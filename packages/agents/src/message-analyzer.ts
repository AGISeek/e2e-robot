/**
 * 消息日志分析工具
 * 用于分析和测试 message-display.ts 的改进
 */

import { MessageDisplay } from './message-display';
import * as fs from 'fs/promises';
import * as path from 'path';

export class MessageAnalyzer {
  /**
   * 分析指定的消息日志文件
   */
  static async analyzeLogFile(logFilePath: string): Promise<void> {
    try {
      console.log(`🔍 分析消息日志文件: ${logFilePath}`);
      console.log('=' .repeat(60));
      
      // 读取日志文件
      const content = await fs.readFile(logFilePath, 'utf-8');
      const messages = JSON.parse(content);
      
      if (!Array.isArray(messages)) {
        console.error('❌ 日志文件格式不正确，期望数组格式');
        return;
      }
      
      console.log(`📊 找到 ${messages.length} 条消息`);
      console.log('');
      
      // 生成统计报告
      const statsReport = MessageDisplay.analyzeMessageLog(messages);
      console.log(statsReport);
      console.log('');
      
      // 展示改进后的消息显示
      console.log('📋 消息显示效果对比:');
      console.log('=' .repeat(60));
      
      let sampleCount = 0;
      const maxSamples = 5;
      
      for (const messageWrapper of messages) {
        if (sampleCount >= maxSamples) break;
        
        const message = messageWrapper.message || messageWrapper;
        
        // 跳过系统初始化消息（太长）
        if (message.type === 'system' && message.subtype === 'init') {
          continue;
        }
        
        console.log(`\n--- 消息 ${sampleCount + 1} ---`);
        console.log('🔧 改进后显示:');
        console.log(MessageDisplay.displayMessage(message));
        
        console.log('\n🐛 调试信息:');
        console.log(MessageDisplay.displayMessageDebug(message));
        
        sampleCount++;
      }
      
      // 特别分析错误消息
      console.log('\n\n🚨 错误消息分析:');
      console.log('=' .repeat(60));
      
      const errorMessages = messages.filter((msgWrapper: any) => {
        const message = msgWrapper.message || msgWrapper;
        return message.is_error || 
               (message.message?.content?.some((c: any) => c.is_error)) ||
               (message.type === 'user' && message.message?.content?.some((c: any) => c.type === 'tool_result' && c.is_error));
      });
      
      console.log(`找到 ${errorMessages.length} 条错误消息`);
      
      for (let i = 0; i < Math.min(errorMessages.length, 3); i++) {
        const messageWrapper = errorMessages[i];
        const message = messageWrapper.message || messageWrapper;
        
        console.log(`\n--- 错误消息 ${i + 1} ---`);
        console.log(MessageDisplay.displayMessage(message));
      }
      
    } catch (error) {
      console.error('❌ 分析失败:', error);
    }
  }
  
  /**
   * 批量分析所有日志文件
   */
  static async analyzeAllLogs(logDir: string): Promise<void> {
    try {
      console.log(`🔍 扫描日志目录: ${logDir}`);
      
      const files = await fs.readdir(logDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      if (logFiles.length === 0) {
        console.log('📭 未找到日志文件');
        return;
      }
      
      console.log(`📋 找到 ${logFiles.length} 个日志文件:`);
      logFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
      
      // 分析最新的日志文件
      const latestLog = logFiles.sort().pop();
      if (latestLog) {
        console.log(`\n🎯 分析最新日志: ${latestLog}`);
        const logPath = path.join(logDir, latestLog);
        await this.analyzeLogFile(logPath);
      }
      
    } catch (error) {
      console.error('❌ 批量分析失败:', error);
    }
  }
  
  /**
   * 测试消息显示功能
   */
  static testMessageDisplay(): void {
    console.log('🧪 测试消息显示功能');
    console.log('=' .repeat(60));
    
    // 模拟不同类型的消息
    const testMessages = [
      {
        type: 'system',
        subtype: 'init',
        cwd: '/test/path',
        tools: ['Bash', 'Write', 'Read'],
        mcp_servers: [{ name: 'playwright', status: 'connected' }],
        model: 'claude-sonnet-4',
        session_id: 'test-session-12345'
      },
      {
        type: 'assistant',
        message: {
          id: 'msg_test123',
          content: [
            { type: 'text', text: 'I will help you test the website.' },
            { 
              type: 'tool_use', 
              id: 'tool_test456',
              name: 'Bash', 
              input: { command: 'npx playwright test', description: 'Run tests' }
            }
          ],
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 200,
            cache_read_input_tokens: 300
          },
          stop_reason: 'tool_use',
          model: 'claude-sonnet-4'
        },
        session_id: 'test-session-12345'
      },
      {
        type: 'user',
        message: {
          content: [
            {
              type: 'tool_result',
              is_error: true,
              tool_use_id: 'tool_test456',
              text: 'Command timed out after 2m 0.0s\n\n❌ Test failed: element not visible\n\u001b[31mError:\u001b[39m Timeout waiting for element'
            }
          ]
        },
        session_id: 'test-session-12345'
      },
      {
        type: 'result',
        subtype: 'timeout',
        duration_ms: 120000,
        num_turns: 5,
        total_cost_usd: 0.0234,
        is_error: true,
        session_id: 'test-session-12345'
      }
    ];
    
    testMessages.forEach((message, index) => {
      console.log(`\n--- 测试消息 ${index + 1} (${message.type}) ---`);
      console.log('显示效果:');
      console.log(MessageDisplay.displayMessage(message as any));
      
      console.log('\n调试信息:');
      console.log(MessageDisplay.displayMessageDebug(message as any));
    });
  }
}

// 如果直接运行此文件，执行分析
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 测试消息显示
    MessageAnalyzer.testMessageDisplay();
    
    // 尝试分析实际日志
    const logDir = '/Users/mingzhe/Learn/e2e-robot/claude-agents-output/claude-agents-output';
    MessageAnalyzer.analyzeAllLogs(logDir).catch(console.error);
  } else if (args.length > 0 && args[0]) {
    // 分析指定的日志文件
    MessageAnalyzer.analyzeLogFile(args[0]).catch(console.error);
  } else {
    console.error('❌ 请提供日志文件路径');
  }
}