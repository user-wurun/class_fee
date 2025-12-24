'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-hot-toast';
import { User } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState([]);
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appPagination, setAppPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role !== 'admin') {
      toast.error('无权限访问管理后台');
      router.push('/');
      return;
    }

    fetchData(1);
  }, [router]);

  const fetchData = async (appPage = 1) => {
    try {
      const token = localStorage.getItem('auth-token');
      
      const [appResponse, userResponse, categoryResponse, codeResponse] = await Promise.all([
        fetch(`/api/applications?page=${appPage}&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/registration-codes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [appData, userData, categoryData, codeData] = await Promise.all([
        appResponse.json(),
        userResponse.json(),
        categoryResponse.json(),
        codeResponse.json()
      ]);

      if (appData.success) {
        setApplications(appData.data.applications);
        setAppPagination(appData.data.pagination);
        setCurrentPage(appPage);
      }
      if (userData.success) setUsers(userData.data);
      if (categoryData.success) setCategories(categoryData.data);
      if (codeData.success) setRegistrationCodes(codeData.data.codes);
      
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (id: number) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('申请已批准');
        fetchData(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleRejectApplication = async (id: number, reason: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: reason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('申请已拒绝');
        fetchData(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const generateRegistrationCodes = async (count = 10) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/registration-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          count,
          expiresInDays: 30,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`已生成${count}个注册码`);
        fetchData(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('生成注册码失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">管理后台</h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['applications', 'users', 'categories', 'registration-codes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'applications' && '申请管理'}
                {tab === 'users' && '用户管理'}
                {tab === 'categories' && '分类管理'}
                {tab === 'registration-codes' && '注册码管理'}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'applications' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">申请管理</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          标题
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          申请人
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金额
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          申请时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((app: any) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.applicant_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(app.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              app.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status === 'approved' ? '已通过' :
                               app.status === 'rejected' ? '已拒绝' :
                               app.status === 'cancelled' ? '已撤销' : '待审批'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(app.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  批准
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('请输入拒绝原因：');
                                    if (reason) handleRejectApplication(app.id, reason);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  拒绝
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页组件 */}
                {appPagination.pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        显示第 {(currentPage - 1) * appPagination.limit + 1} 到{' '}
                        {Math.min(currentPage * appPagination.limit, appPagination.total)} 条，共{' '}
                        {appPagination.total} 条记录
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchData(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`px-3 py-1 rounded ${
                            currentPage <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          上一页
                        </button>
                        
                        {Array.from({ length: Math.min(5, appPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (appPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= appPagination.pages - 2) {
                            pageNum = appPagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchData(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => fetchData(currentPage + 1)}
                          disabled={currentPage >= appPagination.pages}
                          className={`px-3 py-1 rounded ${
                            currentPage >= appPagination.pages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">用户管理</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          真实姓名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          邮箱
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          角色
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.real_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页组件 */}
                {appPagination.pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        显示第 {(currentPage - 1) * appPagination.limit + 1} 到{' '}
                        {Math.min(currentPage * appPagination.limit, appPagination.total)} 条，共{' '}
                        {appPagination.total} 条记录
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchData(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`px-3 py-1 rounded ${
                            currentPage <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          上一页
                        </button>
                        
                        {Array.from({ length: Math.min(5, appPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (appPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= appPagination.pages - 2) {
                            pageNum = appPagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchData(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => fetchData(currentPage + 1)}
                          disabled={currentPage >= appPagination.pages}
                          className={`px-3 py-1 rounded ${
                            currentPage >= appPagination.pages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">分类管理</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          分类名称
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          描述
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用次数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          创建时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category: any) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.application_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(category.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页组件 */}
                {appPagination.pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        显示第 {(currentPage - 1) * appPagination.limit + 1} 到{' '}
                        {Math.min(currentPage * appPagination.limit, appPagination.total)} 条，共{' '}
                        {appPagination.total} 条记录
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchData(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`px-3 py-1 rounded ${
                            currentPage <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          上一页
                        </button>
                        
                        {Array.from({ length: Math.min(5, appPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (appPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= appPagination.pages - 2) {
                            pageNum = appPagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchData(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => fetchData(currentPage + 1)}
                          disabled={currentPage >= appPagination.pages}
                          className={`px-3 py-1 rounded ${
                            currentPage >= appPagination.pages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'registration-codes' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">注册码管理</h3>
                  <div className="space-x-3">
                    <button
                      onClick={() => generateRegistrationCodes(5)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      生成5个注册码
                    </button>
                    <button
                      onClick={() => generateRegistrationCodes(10)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      生成10个注册码
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册码
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          创建时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrationCodes.map((code: any) => (
                        <tr key={code.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {code.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              code.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {code.is_used ? '已使用' : '未使用'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {code.used_by_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(code.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {code.used_at ? formatDate(code.used_at) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页组件 */}
                {appPagination.pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        显示第 {(currentPage - 1) * appPagination.limit + 1} 到{' '}
                        {Math.min(currentPage * appPagination.limit, appPagination.total)} 条，共{' '}
                        {appPagination.total} 条记录
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchData(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`px-3 py-1 rounded ${
                            currentPage <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          上一页
                        </button>
                        
                        {Array.from({ length: Math.min(5, appPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (appPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= appPagination.pages - 2) {
                            pageNum = appPagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchData(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => fetchData(currentPage + 1)}
                          disabled={currentPage >= appPagination.pages}
                          className={`px-3 py-1 rounded ${
                            currentPage >= appPagination.pages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}