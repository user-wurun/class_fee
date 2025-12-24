import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/utils/response';
import { verifyToken, generateRegistrationCode } from '@/utils/auth';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;
    
    let whereCondition = '';

    if (status === 'used') {
      whereCondition = 'WHERE rc.is_used = TRUE';
    } else if (status === 'unused') {
      whereCondition = 'WHERE rc.is_used = FALSE';
    } else if (status === 'expired') {
      whereCondition = 'WHERE rc.expires_at < NOW()';
    }

    const codes = await query(`
      SELECT 
        rc.*,
        creator.real_name as created_by_name,
        user.real_name as used_by_name
      FROM registration_codes rc
      LEFT JOIN users creator ON rc.created_by = creator.id
      LEFT JOIN users user ON rc.used_by = user.id
      ${whereCondition}
      ORDER BY rc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM registration_codes rc
      ${whereCondition}
    `);

    const total = totalResult[0].total;
    const pages = Math.ceil(total / limit);

    return successResponse({
      codes,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    }, '获取注册码列表成功');

  } catch (error) {
    console.error('Get registration codes error:', error);
    return errorResponse('获取注册码列表失败');
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

    if (decoded.role !== 'admin') {
      return forbiddenResponse();
    }

    const { count = 1, expiresInDays = 30 } = await request.json();

    if (count < 1 || count > 100) {
      return errorResponse('一次生成数量为1-100个');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = generateRegistrationCode();
      codes.push(code);
    }

    const values = codes.map(code => [code, decoded.id, expiresAt]).flat();

    await query(
      `INSERT INTO registration_codes (code, created_by, expires_at) VALUES ${codes.map(() => '(?, ?, ?)').join(', ')}`,
      values
    );

    return successResponse({
      codes: codes.map((code, index) => ({
        code,
        created_by: decoded.id,
        expires_at: expiresAt.toISOString(),
      })),
    }, `成功生成${count}个注册码`);

  } catch (error) {
    console.error('Generate registration codes error:', error);
    return errorResponse('生成注册码失败');
  }
}