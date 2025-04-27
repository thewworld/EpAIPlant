import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';

// 流式响应处理函数
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
    
    // 调用后端流式API
    const apiResponse = await fetch(`${API_BASE_URL}/api/dify/completion/messages/stream?appId=${appId}`, {
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
    
    // 创建一个新的 TransformStream 用于处理 SSE 事件
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const transformStream = new TransformStream({
      start(controller) {
        // 读取上游响应并传递给下游
        const reader = apiResponse.body!.getReader();
        
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.terminate();
              return;
            }
            
            controller.enqueue(value);
            read();
          }).catch(error => {
            console.error('流处理错误:', error);
            controller.error(error);
          });
        }
        
        read();
      }
    });
    
    // 返回流式响应
    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('调用Completion API失败:', error);
    return new Response(
      `data: ${JSON.stringify({ error: `生成内容失败: ${error instanceof Error ? error.message : String(error)}` })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
}
