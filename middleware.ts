import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允许访问登录和注册页面
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // 允许访问API路由（它们有自己的认证逻辑）
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 检查是否已登录（通过cookie或header）
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // 对于客户端路由，暂时不强制要求token在cookie中
  // 让客户端组件自己处理认证逻辑
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};