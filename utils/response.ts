import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export const successResponse = <T>(data: T, message: string = '操作成功'): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status: 200 });
};

// 修改 errorResponse，增加状态码参数
export const errorResponse = (
  message: string, 
  status: number = 400,  // 新增：状态码参数，默认400
  error?: string
): NextResponse<ApiResponse> => {
  return NextResponse.json({
    success: false,
    message,
    error,
  }, { status });
};

// 为了向后兼容，可以保留原有函数，但添加一个新函数
export const serverErrorResponse = (message: string = '服务器内部错误'): NextResponse<ApiResponse> => {
  return NextResponse.json({
    success: false,
    message,
  }, { status: 500 });
};

export const unauthorizedResponse = (message: string = '未授权访问'): NextResponse<ApiResponse> => {
  return NextResponse.json({
    success: false,
    message,
  }, { status: 401 });
};

export const forbiddenResponse = (message: string = '无权限访问'): NextResponse<ApiResponse> => {
  return NextResponse.json({
    success: false,
    message,
  }, { status: 403 });
};

export const notFoundResponse = (message: string = '资源未找到'): NextResponse<ApiResponse> => {
  return NextResponse.json({
    success: false,
    message,
  }, { status: 404 });
};