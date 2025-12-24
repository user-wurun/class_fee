import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/response';
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const categoryId = searchParams.get('categoryId');
    const applicantId = searchParams.get('applicantId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    
    let whereConditions = [];

    if (type !== 'all') {
      whereConditions.push(`a.type = '${type}'`);
    }

    if (categoryId) {
      whereConditions.push(`a.category_id = ${categoryId}`);
    }

    if (applicantId) {
      whereConditions.push(`a.applicant_id = ${applicantId}`);
    }

    if (status) {
      whereConditions.push(`a.status = '${status}'`);
    }

    if (search) {
      const escapedSearch = search.replace(/'/g, "\\'");
      whereConditions.push(`(a.title LIKE '%${escapedSearch}%' OR a.description LIKE '%${escapedSearch}%')`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const applications = await query(`
      SELECT 
        a.*,
        u.username as applicant_username,
        u.real_name as applicant_name,
        c.name as category_name,
        admin.real_name as approved_by_name,
        (
          SELECT COUNT(*) 
          FROM proof_images pi 
          WHERE pi.application_id = a.id
        ) as proof_count
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users admin ON a.approved_by = admin.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM applications a
      ${whereClause}
    `);

    const total = totalResult[0].total;
    const pages = Math.ceil(total / limit);

    return successResponse({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return errorResponse('获取申请列表失败');
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

    const {
      title,
      type,
      amount,
      description,
      categoryId,
      expenseTime,
      source,
      reason,
      proofImages
    } = await request.json();

    if (!title || !type || !amount || !description) {
      return errorResponse('必填字段不能为空');
    }

    if (type === 'expense' && (!expenseTime || !reason)) {
      return errorResponse('支出申请必须填写支出时间和原因');
    }

    if (type === 'income' && (!source || !reason)) {
      return errorResponse('收入申请必须填写来源和原因');
    }

    if (type === 'expense' && !categoryId) {
      return errorResponse('支出申请必须选择分类');
    }

    const todayApplications = await query(`
      SELECT COUNT(*) as count
      FROM applications 
      WHERE applicant_id = ? AND DATE(created_at) = CURDATE() AND status != 'cancelled'
    `, [decoded.id]);

    if (todayApplications[0].count >= 3) {
      return errorResponse('每日最多只能发起3个申请，请等待管理员批准后再试');
    }

    await transaction(async (connection) => {
      const [insertResult] = await connection.execute(`
        INSERT INTO applications 
        (title, type, amount, description, applicant_id, category_id, expense_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [title, type, amount, description, decoded.id, categoryId, expenseTime]);

      const applicationId = (insertResult as any).insertId;

      if (type === 'income') {
        await connection.execute(`
          INSERT INTO income_records (application_id, source, reason)
          VALUES (?, ?, ?)
        `, [applicationId, source, reason]);
      } else {
        await connection.execute(`
          INSERT INTO expense_records (application_id, applicant_name, reason, expense_time)
          VALUES (?, ?, ?, ?)
        `, [applicationId, '', reason, expenseTime]);
      }

      if (proofImages && proofImages.length > 0) {
        for (const image of proofImages) {
          await connection.execute(`
            INSERT INTO proof_images (application_id, image_url, image_name, file_size)
            VALUES (?, ?, ?, ?)
          `, [applicationId, image.url, image.name, image.size]);
        }
      }
    });

    return successResponse(null, '申请提交成功');

  } catch (error) {
    console.error('Create application error:', error);
    return errorResponse('创建申请失败');
  }
}