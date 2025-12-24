'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import StatisticsCards from '@/components/StatisticsCards';
import TransactionList from '@/components/TransactionList';
import FilterBar from '@/components/FilterBar';
import ExportButtons from '@/components/ExportButtons';
import { Application, FilterParams, Statistics } from '@/types';

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    type: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchApplications = async (page = 1) => {
    try {
      const token = localStorage.getItem('auth-token');
      const queryParams = new URLSearchParams();
      
      // 修改这里：确保所有参数都是字符串
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.categoryId) queryParams.append('categoryId', String(filters.categoryId));
      if (filters.applicantId) queryParams.append('applicantId', String(filters.applicantId));
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', String(page));
      queryParams.append('limit', '20');

      const response = await fetch(`/api/applications?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setApplications(data.data.applications);
        setPagination(data.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/applications/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchApplications(1);
    fetchStatistics();
  }, [filters]);

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">班费概览</h2>
          <StatisticsCards statistics={statistics} />
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">收支明细</h3>
            <ExportButtons />
          </div>

          <FilterBar 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>

        <TransactionList 
          applications={applications} 
          loading={loading}
          onRefresh={() => fetchApplications(currentPage)}
          pagination={pagination}
          onPageChange={fetchApplications}
          currentPage={currentPage}
        />
      </div>
    </Layout>
  );
}