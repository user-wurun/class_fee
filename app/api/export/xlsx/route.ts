import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/utils/auth';
import { unauthorizedResponse } from '@/utils/response';
import * as XLSX from 'xlsx';

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

    const applications = await query(`
      SELECT 
        a.id,
        a.title,
        CASE WHEN a.type = 'income' THEN '收入' ELSE '支出' END as type,
        a.amount,
        a.description,
        u.real_name as applicant_name,
        c.name as category_name,
        CASE 
          WHEN a.status = 'pending' THEN '待审批'
          WHEN a.status = 'approved' THEN '已通过'
          WHEN a.status = 'rejected' THEN '已拒绝'
          WHEN a.status = 'cancelled' THEN '已撤销'
          ELSE a.status
        END as status,
        a.created_at,
        a.expense_time,
        ir.source,
        ir.reason as income_reason,
        er.reason as expense_reason,
        a.approved_at,
        admin.real_name as approved_by_name,
        a.rejection_reason,
        a.cancellation_reason
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users admin ON a.approved_by = admin.id
      LEFT JOIN income_records ir ON a.id = ir.application_id
      LEFT JOIN expense_records er ON a.id = er.application_id
      WHERE a.status = 'approved'
      ORDER BY a.created_at DESC
      LIMIT 1000
    `);

    const worksheetData = [
      [
        'ID',
        'Title',
        'Type',
        'Amount(CNY)',
        'Description',
        'Applicant',
        'Category',
        'Status',
        'Created At',
        'Expense Time',
        'Income Source',
        'Income Reason',
        'Expense Reason',
        'Approved At',
        'Approved By',
        'Rejection Reason',
        'Cancellation Reason'
      ]
    ];

    applications.forEach((app: any) => {
      worksheetData.push([
        app.id,
        app.title || '',
        app.type || '',
        app.amount || 0,
        app.description || '',
        app.applicant_name || '',
        app.category_name || '',
        app.status || '',
        app.created_at ? new Date(app.created_at).toLocaleString('zh-CN') : '',
        app.expense_time ? new Date(app.expense_time).toLocaleString('zh-CN') : '',
        app.source || '',
        app.income_reason || '',
        app.expense_reason || '',
        app.approved_at ? new Date(app.approved_at).toLocaleString('zh-CN') : '',
        app.approved_by_name || '',
        app.rejection_reason || '',
        app.cancellation_reason || ''
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '班费明细');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return new Response(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="class_finance_${dateStr}.xlsx"; filename*=UTF-8''%E7%8F%AD%E8%B4%B9%E6%98%8E%E7%BB%86_${dateStr}.xlsx`,
      },
    });

  } catch (error) {
    console.error('Export XLSX error:', error);
    return new Response('导出失败', { status: 500 });
  }
}