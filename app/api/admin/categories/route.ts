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

    const categories = await query(`
      SELECT 
        c.*,
        u.real_name as created_by_name,
        COUNT(a.id) as application_count
      FROM categories c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN applications a ON c.id = a.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return successResponse(categories, '获取分类列表成功');

  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('获取分类列表失败');
  }
}

export async function POST(request: NextRequest) {
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

    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return errorResponse('分类名称不能为空');
    }

    const existingCategories = await query(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );

    if (existingCategories.length > 0) {
      return errorResponse('分类名称已存在');
    }

    const result = await query(
      'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
      [name.trim(), description, decoded.id]
    );

    return successResponse(
      { id: (result as any).insertId, name: name.trim(), description },
      '分类创建成功'
    );

  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse('创建分类失败');
  }
}