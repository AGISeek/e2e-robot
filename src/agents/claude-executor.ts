/**
 * Claude Code 执行器
 * 负责与 Claude Code SDK 进行交互
 */

import { query } from '@anthropic-ai/claude-code';
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
      
      // 使用 Claude Code SDK 执行查询
      for await (const message of query({
        prompt: prompt,
        abortController: this.abortController,
        options: {
          maxTurns: 5, // 增加轮次以支持工具使用
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
        console.log('📨 收到消息类型:', message.type);
        console.log('📨 收到消息内容:', message);
        
        // 实时输出消息内容
        if (message.type === 'assistant' && message.message?.content) {
          message.message.content.forEach((content) => {
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
}