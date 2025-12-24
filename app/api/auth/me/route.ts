import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/utils/auth';
import { successResponse, unauthorizedResponse } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return unauthorizedResponse('Token无效或已过期');
    }

    const users = await query(
      'SELECT id, username, real_name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return unauthorizedResponse('用户不存在');
    }

    const user = users[0] as any;
    
    if (!user.is_active) {
      return unauthorizedResponse('账户已被禁用');
    }

    return successResponse(user, '获取用户信息成功');

  } catch (error) {
    console.error('Get user error:', error);
    return unauthorizedResponse('获取用户信息失败');
  }
}