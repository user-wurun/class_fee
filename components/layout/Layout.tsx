'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { User } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('user');

      console.log('检查认证状态:', { 
        hasToken: !!token, 
        hasUser: !!userStr,
        currentPath: window.location.pathname 
      });

      if (!token || !userStr) {
        console.log('未找到认证信息，跳转到登录页');
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        console.log('用户数据解析成功:', userData);
        setUser(userData);
      } catch (error) {
        console.error('用户数据解析失败:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    toast.success('已退出登录');
    router.push('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    toast('个人资料功能开发中');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-xl font-bold text-gray-800 hover:text-gray-600"
              >
                班费管理系统
              </button>
              <a
                href="https://dashboard.pay.cubestudio.top"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-6 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                数据看板
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {user.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  管理后台
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <span className="mr-2">{user.real_name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                  <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleProfile}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      个人资料
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push('/applications/new');
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      新建申请
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}