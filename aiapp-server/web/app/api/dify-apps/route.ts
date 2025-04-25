import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config'; // 从配置文件导入 API_BASE_URL

// 移除环境变量相关代码
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  // 不需要检查 API_BASE_URL 是否存在
  try {
    const response = await fetch(`${API_BASE_URL}/api/dify-apps`);
    
    if (!response.ok) {
      throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取应用列表失败:', error);
    return NextResponse.json(
      { error: `获取应用列表失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 不需要检查 API_BASE_URL 是否存在
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/dify-apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('创建应用失败:', error);
    return NextResponse.json(
      { error: `创建应用失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 