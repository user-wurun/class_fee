import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/utils/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('用户名和密码不能为空');
    }

    const users = await query(
      'SELECT id, username, password, real_name, email, role, is_active FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return errorResponse('用户名或密码错误');
    }

    const user = users[0] as any;

    if (!user.is_active) {
      return errorResponse('账户已被禁用');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('用户名或密码错误');
    }

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token,
    }, '登录成功');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('登录失败');
  }
}