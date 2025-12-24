import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/utils/auth';
import { unauthorizedResponse } from '@/utils/response';

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
        a.title,
        CASE WHEN a.type = 'income' THEN '收入' ELSE '支出' END as type,
        a.amount,
        a.description,
        u.real_name as applicant_name,
        c.name as category_name,
        a.created_at
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'approved'
      ORDER BY a.created_at DESC
      LIMIT 1000
    `);

    // 计算统计数据
    const totalIncome = applications.reduce((sum: number, app: any) => 
      app.type === '收入' ? sum + parseFloat(app.amount || 0) : sum, 0);
    const totalExpense = applications.reduce((sum: number, app: any) => 
      app.type === '支出' ? sum + parseFloat(app.amount || 0) : sum, 0);
    const balance = totalIncome - totalExpense;

    // 定义now变量
    const now = new Date();

    // 生成二维码内容 - 固定链接
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://pay.cubestudio.top')}`;

    // 生成HTML内容
    let htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>班费明细报表</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
            font-size: 28px;
        }
        .header .date {
            color: #6b7280;
            margin-top: 10px;
        }
        .stats {
            display: flex;
            justify-content: space-between;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-item .label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .stat-item .value {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
        }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .table-container {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: bold;
            color: #374151;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        .income-badge { background: #10b981; }
        .expense-badge { background: #ef4444; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .qr-section {
            position: absolute;
            bottom: 20px;
            right: 20px;
            text-align: center;
        }
        .qr-placeholder {
            width: 100px;
            height: 100px;
            border: 1px solid #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .qr-image {
            width: 96px;
            height: 96px;
            object-fit: contain;
        }
        .qr-text {
            margin-top: 5px;
            font-size: 12px;
            color: #6b7280;
        }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Class Finance Report</h1>
        <div class="date">Generated: ${now.toISOString().split('T')[0]}</div>
    </div>

    <div class="stats">
        <div class="stat-item">
            <div class="label">Total Income</div>
            <div class="value income">¥${totalIncome.toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Total Expense</div>
            <div class="value expense">¥${totalExpense.toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Current Balance</div>
            <div class="value balance">¥${balance.toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Records</div>
            <div class="value">${applications.length}</div>
        </div>
    </div>

    <div class="table-container">
        <h2>Transaction Details</h2>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Applicant</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
`;

    applications.forEach((app: any, index: number) => {
      htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${app.title || ''}</td>
                    <td><span class="type-badge ${app.type === '收入' ? 'income-badge' : 'expense-badge'}">${app.type || ''}</span></td>
                    <td>${app.applicant_name || ''}</td>
                    <td>¥${parseFloat(app.amount || 0).toFixed(2)}</td>
                    <td>${app.category_name || '-'}</td>
                    <td>${app.created_at ? new Date(app.created_at).toLocaleDateString('zh-CN') : ''}</td>
                </tr>
`;
    });

    htmlContent += `
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>此报表由班费管理系统自动生成</p>
        <p>访问pay.cubestudio.top或扫描二维码查看详情</p>
    </div>

    <div class="qr-section">
        <div class="qr-placeholder">
            <img src="${qrCodeUrl}" alt="报表二维码" class="qr-image" />
        </div>
        <div class="qr-text">扫码查看详情</div>
    </div>

</body>
</html>
`;

    // 由于服务器端渲染限制，返回HTML文件而不是PNG
    // 前端可以使用html2canvas等库来转换为PNG
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="class_finance_report_${dateStr}.html"; filename*=UTF-8''%E7%8F%AD%E8%B4%B9%E6%98%8E%E7%BB%86%E6%8A%A5%E8%A1%A8_${dateStr}.html`,
      },
    });

  } catch (error) {
    console.error('Export PNG error:', error);
    return new Response('导出失败', { status: 500 });
  }
}