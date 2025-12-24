import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/utils/auth';
import { unauthorizedResponse, successResponse } from '@/utils/response';

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

    const totalBalanceResult = await query(`
      SELECT 
        SUM(CASE WHEN type = 'income' AND status = 'approved' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' AND status = 'approved' THEN amount ELSE 0 END) as total_expense,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as total_transactions
      FROM applications
    `);

    const categoryStatsResult = await query(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COALESCE(SUM(a.amount), 0) as total_amount,
        COALESCE(COUNT(a.id), 0) as count
      FROM categories c
      LEFT JOIN applications a ON c.id = a.category_id AND a.type = 'expense' AND a.status = 'approved'
      GROUP BY c.id, c.name
      HAVING total_amount > 0
      ORDER BY total_amount DESC
    `);

    const totalBalance = totalBalanceResult[0];
    const totalIncome = totalBalance.total_income || 0;
    const totalExpense = totalBalance.total_expense || 0;
    const currentBalance = totalIncome - totalExpense;

    const totalTransactions = totalBalance.total_transactions || 0;
    const totalExpenseAmount = categoryStatsResult.reduce((sum: number, cat: any) => sum + cat.total_amount, 0);

    const categoryStats = categoryStatsResult.map((cat: any) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      total_amount: cat.total_amount,
      count: cat.count,
      percentage: totalExpenseAmount > 0 ? (cat.total_amount / totalExpenseAmount * 100).toFixed(2) : 0,
    }));

    const statistics = {
      total_balance: currentBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      total_transactions: totalTransactions,
      category_stats: categoryStats,
    };

    return successResponse(statistics, '获取统计数据成功');

  } catch (error) {
    console.error('Get statistics error:', error);
    return unauthorizedResponse('获取统计数据失败');
  }
}