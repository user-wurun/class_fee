'use client';

import { Statistics } from '@/types';

interface StatisticsCardsProps {
  statistics: Statistics | null;
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const cards = [
    {
      title: '当前余额',
      value: statistics ? formatCurrency(statistics.total_balance) : '¥0.00',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    {
      title: '总收入',
      value: statistics ? formatCurrency(statistics.total_income) : '¥0.00',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    {
      title: '总支出',
      value: statistics ? formatCurrency(statistics.total_expense) : '¥0.00',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    {
      title: '交易笔数',
      value: statistics ? statistics.total_transactions : 0,
      bgColor: 'bg-purple-500',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.textColor} p-6 rounded-lg shadow-lg`}
        >
          <div className="text-sm opacity-90 mb-2">{card.title}</div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}