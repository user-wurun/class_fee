import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/utils/response';
import { verifyToken } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const applicationId = params.id;

    const applications = await query(`
      SELECT 
        a.*,
        u.username as applicant_username,
        u.real_name as applicant_name,
        c.name as category_name,
        admin.real_name as approved_by_name,
        ir.source,
        ir.reason as income_reason,
        er.applicant_name as expense_applicant_name,
        er.reason as expense_reason,
        er.expense_time as expense_record_time
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users admin ON a.approved_by = admin.id
      LEFT JOIN income_records ir ON a.id = ir.application_id
      LEFT JOIN expense_records er ON a.id = er.application_id
      WHERE a.id = ?
    `, [applicationId]);

    if (applications.length === 0) {
      return notFoundResponse('申请不存在');
    }

    const application = applications[0];

    const proofImages = await query(`
      SELECT id, image_url, image_name, file_size, created_at
      FROM proof_images
      WHERE application_id = ?
      ORDER BY created_at ASC
    `, [applicationId]);

    application.proof_images = proofImages;

    return successResponse(application, '获取申请详情成功');

  } catch (error) {
    console.error('Get application error:', error);
    return errorResponse('获取申请详情失败');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const applicationId = params.id;
    const updateData = await request.json();

    const applications = await query(
      'SELECT * FROM applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      return notFoundResponse('申请不存在');
    }

    const application = applications[0];

    // 权限检查
    if (decoded.role !== 'admin') {
      // 普通用户只能操作自己的申请
      if (application.applicant_id !== decoded.id) {
        return unauthorizedResponse('只能修改自己的申请');
      }
      
      // 普通用户不能审批申请（批准/拒绝）
      if (updateData.status === 'approved' || updateData.status === 'rejected') {
        return unauthorizedResponse('只有管理员可以审批申请');
      }
      
      // 普通用户只能修改待审批或已拒绝的申请，不能修改已批准的申请
      if (application.status === 'approved') {
        return errorResponse('已批准的申请不能修改');
      }
      
      // 撤销申请时必须填写原因
      if (updateData.status === 'cancelled' && !updateData.cancellation_reason) {
        return errorResponse('申请撤销时必须填写撤销原因');
      }
    }

    await transaction(async (connection) => {
      const updateFields = [];
      const updateParams = [];

      if (updateData.title) {
        updateFields.push('title = ?');
        updateParams.push(updateData.title);
      }
      if (updateData.amount) {
        updateFields.push('amount = ?');
        updateParams.push(updateData.amount);
      }
      if (updateData.description) {
        updateFields.push('description = ?');
        updateParams.push(updateData.description);
      }
      if (updateData.categoryId) {
        updateFields.push('category_id = ?');
        updateParams.push(updateData.categoryId);
      }
      if (updateData.expenseTime) {
        updateFields.push('expense_time = ?');
        updateParams.push(updateData.expenseTime);
      }

      if (updateData.status) {
        updateFields.push('status = ?');
        updateParams.push(updateData.status);

        if (updateData.status === 'approved') {
          updateFields.push('approved_by = ?');
          updateFields.push('approved_at = NOW()');
          updateParams.push(decoded.id);
        } else if (updateData.status === 'rejected') {
          updateFields.push('rejection_reason = ?');
          updateParams.push(updateData.rejection_reason || '');
        } else if (updateData.status === 'cancelled') {
          updateFields.push('cancellation_reason = ?');
          updateParams.push(updateData.cancellation_reason || '');
        }
      }

      if (updateFields.length > 0) {
        updateParams.push(applicationId);
        await connection.execute(`
          UPDATE applications 
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = ?
        `, updateParams);
      }

      if (updateData.type === 'income' && updateData.source && updateData.reason) {
        await connection.execute(`
          INSERT INTO income_records (application_id, source, reason)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE source = VALUES(source), reason = VALUES(reason)
        `, [applicationId, updateData.source, updateData.reason]);
      } else if (updateData.type === 'expense' && updateData.reason) {
        await connection.execute(`
          INSERT INTO expense_records (application_id, applicant_name, reason, expense_time)
          VALUES (?, '', ?, ?)
          ON DUPLICATE KEY UPDATE 
            reason = VALUES(reason), 
            expense_time = VALUES(expense_time)
        `, [applicationId, updateData.reason, updateData.expenseTime || application.expense_time]);
      }
    });

    return successResponse(null, '申请更新成功');

  } catch (error) {
    console.error('Update application error:', error);
    return errorResponse('更新申请失败');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const applicationId = params.id;

    const applications = await query(
      'SELECT * FROM applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      return notFoundResponse('申请不存在');
    }

    const application = applications[0];

    if (decoded.role !== 'admin') {
      if (application.applicant_id !== decoded.id) {
        return unauthorizedResponse('只能删除自己的申请');
      }
      if (application.status !== 'pending') {
        return errorResponse('只能删除待审批状态的申请');
      }
    }

    await transaction(async (connection) => {
      await connection.execute(
        'DELETE FROM proof_images WHERE application_id = ?',
        [applicationId]
      );

      await connection.execute(
        'DELETE FROM income_records WHERE application_id = ?',
        [applicationId]
      );

      await connection.execute(
        'DELETE FROM expense_records WHERE application_id = ?',
        [applicationId]
      );

      await connection.execute(
        'DELETE FROM applications WHERE id = ?',
        [applicationId]
      );
    });

    return successResponse(null, '申请删除成功');

  } catch (error) {
    console.error('Delete application error:', error);
    return errorResponse('删除申请失败');
  }
}