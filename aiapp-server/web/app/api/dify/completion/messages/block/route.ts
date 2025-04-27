import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json(
        { error: '缺少appId参数' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const apiResponse = await fetch(`${API_BASE_URL}/api/dify/completion/messages/block?appId=${appId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`服务器返回错误: ${apiResponse.status} ${errorText}`);
    }
    
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('调用Completion API失败:', error);
    return NextResponse.json(
      { error: `生成内容失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
