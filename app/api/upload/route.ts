import { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/utils/response';
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // 验证环境变量
    if (!process.env.COS_SECRET_ID || !process.env.COS_SECRET_KEY || !process.env.COS_BUCKET || !process.env.COS_REGION) {
      return errorResponse('文件上传服务配置错误', 500);
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return unauthorizedResponse('Token 无效或已过期');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('没有上传文件');
    }

    // 文件大小限制
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('文件大小不能超过10MB');
    }

    // 文件类型限制
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('只支持上传图片文件 (JPEG, PNG, GIF, WebP)');
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `uploads/${decoded.id}/${timestamp}_${randomString}_${file.name}`;

    // 使用 async/await 处理 COS 上传
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      }, (err, data) => {
        if (err) {
          console.error('COS upload error:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    const fileUrl = `https://${uploadResult.Location}`;
    
    return successResponse({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    }, '文件上传成功');

  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = '文件上传失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    
    return errorResponse(errorMessage, 500);
  }
}