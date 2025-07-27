/**
 * SSE API for real-time test generation with enhanced error handling
 */

import { NextRequest } from 'next/server';
import { SSEMessage } from '@/types/sse';
import { StreamingOrchestrator } from './streaming-orchestrator';
import { AppError, createError, handleError } from '@/lib/error-handling';
import { HTTP_STATUS, ERROR_CODES } from '@/constants';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input) {
      const error = createError.validation('Missing input parameter');
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        code: error.code 
      }), { 
        status: HTTP_STATUS.BAD_REQUEST,
        headers: { 'Content-Type': 'application/json' }
      });
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
            const appError = createError.server('Failed to send SSE message');
            handleError(appError);
            
            // 发送错误消息
            try {
              const errorData = `data: ${JSON.stringify({
                type: 'error',
                data: {
                  error: appError.message,
                  code: appError.code,
                  recoverable: false
                },
                timestamp: Date.now()
              })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
            } catch (secondaryError) {
              console.error('Critical: Failed to send error message:', secondaryError);
            }
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
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : createError.server('API request processing failed');
    
    handleError(appError);
    
    return new Response(JSON.stringify({
      success: false,
      error: appError.message,
      code: appError.code,
      timestamp: new Date().toISOString()
    }), {
      status: appError.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function startTestGeneration(
  input: string,
  sendMessage: (message: SSEMessage) => void,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  let streamingOrchestrator: StreamingOrchestrator | null = null;
  
  try {
    // 发送开始消息
    sendMessage({
      type: 'chat',
      data: {
        id: `start_${Date.now()}`,
        role: 'assistant',
        content: '🚀 开始分析测试需求...',
        timestamp: Date.now(),
        type: 'text'
      },
      timestamp: Date.now()
    });

    // 解析输入并创建配置
    const targetUrl = extractAndValidateUrl(input);
    const siteName = extractSiteNameFromUrl(targetUrl);
    
    // 使用环境变量或相对路径，避免硬编码用户路径
    const workDir = process.env.WORK_DIR || path.join(process.cwd(), 'claude-agents-output');
    
    const config = {
      targetUrl,
      siteName,
      testRequirements: [input],
      testTypes: ['functional', 'ux'] as const,
      maxTestCases: 10,
      priority: 'medium' as const,
      timeout: 600000,
      workDir,
      verbose: true
    };

    // 发送配置确认消息
    sendMessage({
      type: 'chat',
      data: {
        id: `config_${Date.now()}`,
        role: 'assistant',
        content: `✅ 测试配置已创建：\n• 目标网站：${targetUrl}\n• 测试类型：功能测试、用户体验\n• 最大用例数：${config.maxTestCases}`,
        timestamp: Date.now(),
        type: 'text'
      },
      timestamp: Date.now()
    });

    // 创建流式orchestrator
    streamingOrchestrator = new StreamingOrchestrator(sendMessage);
    
    // 执行流式处理
    await streamingOrchestrator.execute(config);
    
    // 发送完成消息
    sendMessage({
      type: 'complete',
      data: {
        success: true,
        summary: '测试生成完成',
        totalSteps: 5,
        completedSteps: 5,
        results: {
          analysisFile: true,
          scenarioFile: true,
          testCaseFile: true,
          testResults: true
        }
      },
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    const appError = error instanceof AppError 
      ? error 
      : createError.server(error.message || 'Test generation failed');
    
    handleError(appError);
    
    try {
      sendMessage({
        type: 'error',
        data: {
          error: appError.message,
          code: appError.code,
          details: appError.context,
          recoverable: appError.isOperational,
          timestamp: new Date().toISOString()
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
    
    try {
      controller.close();
    } catch (closeError) {
      console.error('Failed to close controller:', closeError);
    }
  }
}

function extractAndValidateUrl(input: string): string {
  try {
    // 尝试从输入中提取 URL
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const match = input.match(urlRegex);
    
    let urlToValidate: string;
    
    if (match) {
      urlToValidate = match[1];
    } else if (input.includes('.com') || input.includes('.cn') || input.includes('.org')) {
      // 如果包含域名但没有协议，添加 https://
      if (!input.startsWith('http')) {
        urlToValidate = `https://${input.trim()}`;
      } else {
        urlToValidate = input.trim();
      }
    } else {
      // 默认返回百度作为示例
      return 'https://www.baidu.com';
    }
    
    // 验证URL安全性
    const url = new URL(urlToValidate);
    
    // 安全检查：阻止内网地址和危险协议
    const hostname = url.hostname.toLowerCase();
    
    // 检查是否为内网地址
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
        hostname.startsWith('169.254.')) {
      // 开发环境允许本地地址
      if (process.env.NODE_ENV !== 'development') {
        throw createError.validation('Internal network address not allowed', {
          hostname,
          originalInput: input
        });
      }
    }
    
    // 只允许HTTP和HTTPS协议
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw createError.validation('Unsafe protocol detected', {
        protocol: url.protocol,
        originalInput: input
      });
    }
    
    return url.toString();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    throw createError.validation('URL validation failed', {
      originalInput: input,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function extractSiteNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'example.com';
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: HTTP_STATUS.OK,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}