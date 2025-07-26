/**
 * Claude Code 执行器
 * 负责与 Claude Code SDK 进行交互
 */

import { query } from '@anthropic-ai/claude-code';
import { MessageDisplay } from './message-display';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ClaudeExecutorConfig {
  workDir: string;
  timeout?: number;
}

export class ClaudeExecutor {
  private config: ClaudeExecutorConfig;
  private abortController: AbortController;
  
  constructor(config: ClaudeExecutorConfig) {
    this.config = {
      timeout: 600000, // 默认10分钟超时
      ...config
    };
    this.abortController = new AbortController();
  }
  
  /**
   * 执行 Claude Code SDK 查询并返回结果
   */
  async executePrompt(prompt: string, expectedFile?: string): Promise<string> {
    try {
      console.log('🤖 调用 Claude Code SDK...');
      console.log('📝 提示词长度:', prompt.length);
      if (expectedFile) {
        console.log(`📁 期望生成文件: ${expectedFile}`);
      }
      
      let extractedContent = '';
      const messageLog: any[] = [];
      let usageLimitReached = false;
      
      // 使用 Claude Code SDK 执行查询
      for await (const message of query({
        prompt: prompt,
        abortController: this.abortController,
        options: {
          maxTurns: 50, // 大幅增加轮次以支持完整测试套件执行
          permissionMode: 'bypassPermissions',
          continue: true, // 启用会话保持功能
          mcpServers: {
            "playwright": {
              "command": "npx",
              "args": [
                "@playwright/mcp@latest"
              ]
            }
          }
        },
      })) {
        // 记录所有消息到日志数组
        messageLog.push({
          timestamp: new Date().toISOString(),
          message: message
        });
        
        // 检查是否达到使用限制
        if (this.isUsageLimitReached(message)) {
          usageLimitReached = true;
          console.log('🚫 检测到 Claude AI 使用限制已达上限');
          break;
        }
        
        // 使用友好的消息展示器
        MessageDisplay.logMessage(message);
        
        // 实时输出消息内容
        if (message.type === 'assistant' && message.message?.content) {
          message.message.content.forEach((content: any) => {
            if (content.type === 'text' && content.text) {
              process.stdout.write(content.text); // 实时输出到控制台
              extractedContent += content.text;
            }
          });
        }
        
        // 处理其他类型的消息
        if (message.type === 'result' && (message as any).content) {
          const resultContent = (message as any).content;
          if (typeof resultContent === 'string') {
            process.stdout.write(resultContent);
            extractedContent += resultContent;
          }
        }
      }
      
      // 将消息日志写入文件
      await this.writeMessageLog(messageLog);
      
      // 如果达到使用限制，抛出特殊错误
      if (usageLimitReached) {
        const error = new Error('Claude AI usage limit reached');
        (error as any).code = 'USAGE_LIMIT_REACHED';
        (error as any).retryable = false; // 标记为不可重试 (retryable 是自定义属性)
        throw error;
      }
      
      // 清理提取的内容
      extractedContent = extractedContent.trim();
      
      console.log(`\n✅ Claude Code SDK 执行完成`);
      
      // 检查期望的文件是否被 Claude Code 工具创建
      if (expectedFile) {
        // 检查多个可能的位置
        const possiblePaths = [
          path.join(this.config.workDir, expectedFile), // 工作目录
          path.join(process.cwd(), expectedFile), // 项目根目录
          expectedFile // 当前目录
        ];
        
        let fileFound = false;
        for (const filePath of possiblePaths) {
          try {
            await fs.access(filePath);
            console.log(`📄 确认 Claude Code 已使用工具创建文件: ${filePath}`);
            fileFound = true;
            break;
          } catch {
            // 继续检查下一个路径
          }
        }
        
        if (!fileFound) {
          console.warn(`⚠️ 期望的文件未被 Claude Code 工具创建在任何位置: ${expectedFile}`);
          console.log('💡 请确保提示词中明确要求使用 Write 工具保存文件');
        }
      }
      
      return extractedContent;
      
    } catch (error) {
      // 检查是否为使用限制错误
      if (this.isUsageLimitError(error)) {
        console.error('🚫 Claude AI 使用限制已达上限，系统将优雅退出');
        console.log('💡 请等待限制重置后再次尝试，或检查您的 API 使用配额');
        
        // 创建特殊的使用限制错误
        const usageLimitError = new Error('Claude AI usage limit reached - system exiting gracefully');
        (usageLimitError as any).code = 'USAGE_LIMIT_REACHED'; 
        (usageLimitError as any).retryable = false; // 标记为不可重试 (retryable 是自定义属性)
        (usageLimitError as any).shouldExit = true; // 标记应该退出程序
        throw usageLimitError;
      }
      
      console.error('❌ Claude Code SDK 调用失败:', error);
      throw error;
    }
  }
  
  /**
   * 检查 Claude Code SDK 是否可用
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.executePrompt('Hello Claude, please respond with "OK"');
      return response.includes('OK') || response.length > 0;
    } catch {
      return false;
    }
  }
  
  /**
   * 重置 abort controller（用于新的查询）
   */
  resetAbortController(): void {
    this.abortController = new AbortController();
  }
  
  /**
   * 检查消息是否表示达到使用限制
   */
  private isUsageLimitReached(message: any): boolean {
    // 检查消息内容中的使用限制指示器
    const content = JSON.stringify(message).toLowerCase();
    
    // 常见的使用限制指示器
    const usageLimitIndicators = [
      'usage limit reached',
      'claude ai usage limit reached',
      'api usage limit',
      'rate limit exceeded',
      'quota exceeded',
      'usage quota exceeded',
      'monthly limit reached',
      'api limit exceeded'
    ];
    
    return usageLimitIndicators.some(indicator => content.includes(indicator));
  }
  
  /**
   * 检查错误是否为使用限制相关错误
   */
  private isUsageLimitError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = (error.message || '').toLowerCase();
    const errorString = String(error).toLowerCase();
    
    // 检查错误消息中的使用限制指示器
    const usageLimitPatterns = [
      'usage limit reached',
      'claude ai usage limit',
      'api usage limit',
      'rate limit',
      'quota exceeded',
      'usage quota',
      'monthly limit',
      'api limit exceeded',
      'claude code process exited with code 1', // Claude Code SDK 特定错误
      'anthropic api error'
    ];
    
    return usageLimitPatterns.some(pattern => 
      errorMessage.includes(pattern) || errorString.includes(pattern)
    );
  }
  
  /**
   * 将消息日志写入文件
   */
  private async writeMessageLog(messageLog: any[]): Promise<void> {
    try {
      // 确保输出目录存在
      const outputDir = path.join(this.config.workDir, 'claude-agents-output');
      await fs.mkdir(outputDir, { recursive: true });
      
      // 生成日志文件名，包含时间戳以避免覆盖
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFileName = `message-${timestamp}.log`;
      const logFilePath = path.join(outputDir, logFileName);
      
      // 也写入通用的 message.log 文件（会被覆盖）
      const generalLogPath = path.join(outputDir, 'message.log');
      
      // 格式化消息日志为 JSON 字符串
      const logContent = JSON.stringify(messageLog, null, 2);
      
      // 写入带时间戳的日志文件
      await fs.writeFile(logFilePath, logContent, 'utf-8');
      
      // 写入通用日志文件
      await fs.writeFile(generalLogPath, logContent, 'utf-8');
      
      console.log(`📋 消息日志已保存: ${logFilePath}`);
      console.log(`📋 消息日志已更新: ${generalLogPath}`);
      
    } catch (error) {
      console.error('❌ 写入消息日志失败:', error);
      // 不抛出错误，避免影响主要功能
    }
  }
}