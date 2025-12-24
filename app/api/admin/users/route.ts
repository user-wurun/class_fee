import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/utils/response';
import { verifyToken } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return unauthorizedResponse();
    }

    if (decoded.role !== 'admin') {
      return forbiddenResponse();
    }

    const users = await query(`
      SELECT 
        id,
        username,
        real_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return successResponse(users, '获取用户列表成功');

  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('获取用户列表失败');
  }
}