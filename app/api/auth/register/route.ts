import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db';
import { hashPassword, generateRegistrationCode } from '@/utils/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(request: NextRequest) {
  try {
    const { username, password, realName, email, registrationCode } = await request.json();

    if (!username || !password || !realName || !registrationCode) {
      return errorResponse('所有字段都是必填的');
    }

    if (password.length < 6) {
      return errorResponse('密码长度至少6位');
    }

    const existingUsers = await query<any[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return errorResponse('用户名或邮箱已存在');
    }

    const codes = await query(
      'SELECT id, used_by, expires_at FROM registration_codes WHERE code = ? AND is_used = FALSE',
      [registrationCode]
    );

    if (codes.length === 0) {
      return errorResponse('注册码无效或已被使用');
    }

    const code = codes[0] as any;
    
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return errorResponse('注册码已过期');
    }

    await transaction(async (connection) => {
      const hashedPassword = await hashPassword(password);
      
      const [insertResult] = await connection.execute(
        'INSERT INTO users (username, password, real_name, email, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, realName, email, 'user']
      );

      await connection.execute(
        'UPDATE registration_codes SET is_used = TRUE, used_by = ?, used_at = NOW() WHERE id = ?',
        [(insertResult as any).insertId, code.id]
      );
    });

    return successResponse(null, '注册成功');

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('注册失败');
  }
}