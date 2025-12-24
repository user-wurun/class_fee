'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-hot-toast';
import { Category } from '@/types';

export default function NewApplication() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    categoryId: '',
    expenseTime: '',
    source: '',
    reason: '',
    customCategory: '',
  });
  const [proofImages, setProofImages] = useState<File[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProofImages(prev => {
      const newImages = [...prev, ...files];
      // 限制最多5张图片
      if (newImages.length > 5) {
        toast.error('最多只能上传5张凭证图片');
        return prev.slice(0, 5); // 保留前5张
      }
      return newImages;
    });
  };

  const removeFile = (index: number) => {
    setProofImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedImages = [];
    
    for (const file of proofImages) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        if (data.success) {
          uploadedImages.push({
            url: data.data.url,
            name: data.data.name,
            size: data.data.size,
          });
        }
      } catch (error) {
        toast.error(`上传文件 ${file.name} 失败`);
      }
    }
    
    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.amount || !formData.description) {
        toast.error('请填写必填字段');
        setLoading(false);
        return;
      }

      if (formData.type === 'expense' && !formData.expenseTime) {
        toast.error('支出申请必须填写支出时间');
        setLoading(false);
        return;
      }

      if (formData.type === 'expense' && !formData.reason) {
        toast.error('支出申请必须填写支出原因');
        setLoading(false);
        return;
      }

      if (formData.type === 'income' && (!formData.source || !formData.reason)) {
        toast.error('收入申请必须填写来源和原因');
        setLoading(false);
        return;
      }

      if (formData.type === 'expense' && proofImages.length === 0) {
        toast.error('支出申请必须上传至少1张凭证图片');
        setLoading(false);
        return;
      }

      if (proofImages.length > 5) {
        toast.error('最多只能上传5张凭证图片');
        setLoading(false);
        return;
      }

      let categoryId = formData.categoryId;
      
      if (formData.type === 'expense' && formData.customCategory && formData.customCategory.trim()) {
        try {
          const token = localStorage.getItem('auth-token');
          const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: formData.customCategory.trim(),
              description: '用户自定义分类',
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            categoryId = data.data.id.toString();
            toast.success(`已创建新分类: ${formData.customCategory.trim()}`);
          }
        } catch (error) {
          toast.error('创建自定义分类失败');
          setLoading(false);
          return;
        }
      }

      // 修改这一行：
      let uploadedProofImages: Array<{url: string, name: string, size: number}> = [];
      if (proofImages.length > 0) {
        uploadedProofImages = await uploadImages();
      }

      const applicationData = {
        title: formData.title,
        type: formData.type,
        amount: Number(formData.amount),
        description: formData.description,
        categoryId: categoryId ? Number(categoryId) : undefined,
        expenseTime: formData.expenseTime || undefined,
        source: formData.source || undefined,
        reason: formData.reason || undefined,
        proofImages: uploadedProofImages,
      };

      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('申请提交成功');
        router.push('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('提交申请失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">新建申请</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  标题 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入申请标题"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  类型 *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="expense">支出</option>
                  <option value="income">收入</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  金额 (元) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入金额"
                  required
                />
              </div>

              {formData.type === 'expense' && (
                <div>
                  <label htmlFor="expenseTime" className="block text-sm font-medium text-gray-700">
                    支出时间 *
                  </label>
                  <input
                    type="datetime-local"
                    id="expenseTime"
                    name="expenseTime"
                    value={formData.expenseTime}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            {formData.type === 'expense' && (
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  支出分类
                </label>
                <div className="mt-1 flex space-x-2">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">选择现有分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="或输入新分类"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {formData.type === 'income' && (
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  收入来源 *
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入收入来源"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                描述 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入详细描述"
                required
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                {formData.type === 'income' ? '收入原因' : '支出原因'} *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入具体原因"
                required
              />
            </div>

            {formData.type === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  凭证图片 * (支出申请必须上传1-5张)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                    >
                      点击上传图片
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each (最多5张，支出申请至少1张)
                    </p>
                  </div>

                  {proofImages.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">
                        已选择 {proofImages.length}/5 张图片
                        {formData.type === 'expense' && proofImages.length === 0 && (
                          <span className="text-red-600 ml-2">（支出申请必须上传至少1张）</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {proofImages.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}