/**
 * SSE API for real-time test generation
 */

import { NextRequest } from 'next/server';
import { SSEMessage } from '@/types/sse';
import { StreamingOrchestrator } from './streaming-orchestrator';

export async function POST(request: NextRequest) {
  const { input } = await request.json();

  if (!input) {
    return new Response('Missing input parameter', { status: 400 });
  }

  // 创建 SSE 响应
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // 发送 SSE 消息的辅助函数
      const sendMessage = (message: SSEMessage) => {
        try {
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Failed to send SSE message:', error);
          // 如果控制器已关闭，不再尝试发送消息
        }
      };

      // 启动测试生成流程
      startTestGeneration(input, sendMessage, controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function startTestGeneration(
  input: string,
  sendMessage: (message: SSEMessage) => void,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  let streamingOrchestrator: StreamingOrchestrator | null = null;
  
  try {
    // 解析输入并创建配置
    const targetUrl = extractUrlFromInput(input);
    const siteName = extractSiteNameFromUrl(targetUrl);
    const workDir = '/Users/mingzhe/Learn/e2e-robot/claude-agents-output'; // 使用固定路径确保一致性
    
    const config = {
      targetUrl,
      siteName,
      testRequirements: [input],
      testTypes: ['functional', 'ux'],
      maxTestCases: 10,
      priority: 'medium' as const,
      timeout: 600000,
      workDir,
      verbose: true
    };

    // 创建流式orchestrator
    streamingOrchestrator = new StreamingOrchestrator(sendMessage);
    
    // 执行流式处理
    await streamingOrchestrator.execute(config);
    
  } catch (error: any) {
    console.error('Test generation error:', error);
    
    try {
      sendMessage({
        type: 'error',
        data: {
          error: error.message || 'Unknown error occurred',
          details: error.stack,
          recoverable: false
        },
        timestamp: Date.now()
      });
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  } finally {
    // 标记流已关闭
    if (streamingOrchestrator) {
      streamingOrchestrator.markStreamClosed();
    }
    controller.close();
  }
}

function extractUrlFromInput(input: string): string {
  // 尝试从输入中提取 URL
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  const match = input.match(urlRegex);
  
  if (match) {
    return match[1];
  }
  
  // 如果没有找到完整 URL，尝试智能补全
  if (input.includes('.com') || input.includes('.cn') || input.includes('.org')) {
    // 如果包含域名但没有协议，添加 https://
    if (!input.startsWith('http')) {
      return `https://${input.trim()}`;
    }
  }
  
  // 默认返回百度作为示例
  return 'https://www.baidu.com';
}

function extractSiteNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'example.com';
  }
}

