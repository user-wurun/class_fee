'use client';

import { useState, useEffect } from 'react';
import { Application } from '@/types';
import { toast } from 'react-hot-toast';

interface ApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ApplicationModal({ application, isOpen, onClose, onUpdate }: ApplicationModalProps) {
  const [fullApplication, setFullApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && application.id) {
      fetchApplicationDetails();
      // 获取当前用户信息
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    }
  }, [isOpen, application.id]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${application.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFullApplication(data.data);
      }
    } catch (error) {
      toast.error('获取申请详情失败');
    } finally {
      setLoading(false);
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

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${application.id}`, {
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
        onUpdate();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${application.id}`, {
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
        onUpdate();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancellation_reason: reason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('申请已撤销');
        onUpdate();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'cancelled':
        return '已撤销';
      case 'pending':
      default:
        return '待审批';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  if (!isOpen) return null;

  const app = fullApplication || application;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">申请详情</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">类型</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.type === 'income' ? '收入' : '支出'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusText(app.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">标题</label>
                  <p className="mt-1 text-sm text-gray-900">{app.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">金额</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {formatCurrency(app.amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">申请人</label>
                  <p className="mt-1 text-sm text-gray-900">{app.applicant_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">分类</label>
                  <p className="mt-1 text-sm text-gray-900">{app.category_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">申请时间</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(app.created_at)}</p>
                </div>
                {app.expense_time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">支出时间</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(app.expense_time)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <p className="mt-1 text-sm text-gray-900">{app.description}</p>
              </div>

              {app.type === 'income' && app.source && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">收入来源</label>
                  <p className="mt-1 text-sm text-gray-900">{app.source}</p>
                </div>
              )}

              {app.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {app.type === 'income' ? '收入原因' : '支出原因'}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{app.reason}</p>
                </div>
              )}

              {app.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">拒绝原因</label>
                  <p className="mt-1 text-sm text-red-600">{app.rejection_reason}</p>
                </div>
              )}

              {app.cancellation_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">撤销原因</label>
                  <p className="mt-1 text-sm text-gray-600">{app.cancellation_reason}</p>
                </div>
              )}

              {app.proof_images && app.proof_images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">凭证图片</label>
                  <div className="grid grid-cols-2 gap-4">
                    {app.proof_images.map((image) => (
                      <div key={image.id} className="relative group cursor-pointer" onClick={() => handleImageClick(image.image_url)}>
                        <img
                          src={image.image_url}
                          alt={image.image_name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 truncate">{image.image_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(app.status === 'pending' || app.status === 'rejected') && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {/* 普通用户只能修改和撤销自己的申请 */}
                  {currentUser && currentUser.role !== 'admin' && app.applicant_id === currentUser.id && (
                    <>
                      <button
                        onClick={() => {
                          const reason = prompt('请输入撤销原因：');
                          if (reason) {
                            handleCancel(reason);
                          }
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        撤销申请
                      </button>
                    </>
                  )}
                  
                  {/* 管理员可以审批申请 */}
                  {currentUser && currentUser.role === 'admin' && app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          const reason = prompt('请输入拒绝原因：');
                          if (reason) {
                            handleReject(reason);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        拒绝
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        批准
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <img
              src={previewImage}
              alt="预览图片"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(previewImage, '_blank');
              }}
              className="absolute top-4 right-16 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}