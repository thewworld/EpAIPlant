import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8087';

export async function GET(request: Request) {
  try {
    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key 不能为空' },
        { status: 400 }
      );
    }
    
    // 调用后端API
    const response = await fetch(`${API_BASE_URL}/api/dify-apps/sync?apiKey=${encodeURIComponent(apiKey)}`);
    
    if (!response.ok) {
      throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('同步应用信息失败:', error);
    return NextResponse.json(
      { error: `同步应用信息失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 