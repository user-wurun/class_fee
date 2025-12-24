'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ExportButtons() {
  const [loading, setLoading] = useState(false);

  const handleExportXLSX = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `班费明细_${new Date().toLocaleDateString('zh-CN')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Excel文件已下载');
      } else {
        const errorText = await response.text();
        console.error('导出失败:', errorText);
        toast.error(`导出失败: ${response.status}`);
      }
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHTML = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/export/png', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `班费报表_${new Date().toLocaleDateString('zh-CN')}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('HTML文件已下载，可另存为图片');
      } else {
        const errorText = await response.text();
        console.error('导出失败:', errorText);
        toast.error(`导出失败: ${response.status}`);
      }
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={handleExportXLSX}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        导出Excel
      </button>
      <button
        onClick={handleExportHTML}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        导出报表
      </button>
    </div>
  );
}