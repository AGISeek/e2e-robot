/**
 * Claude Code SDK 消息展示器
 * 提供友好的控制台输出格式
 */

import { type SDKMessage } from '@anthropic-ai/claude-code';

// 扩展的消息类型定义
interface SystemMessage {
  type: 'system';
  subtype?: string;
  cwd?: string;
  tools?: string[];
  mcp_servers?: Array<{ name: string; status: string }>;
  model?: string;
  session_id?: string;
}

interface AssistantMessage {
  type: 'assistant';
  message?: {
    content?: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
  session_id?: string;
}

interface UserMessage {
  type: 'user';
  message?: {
    content?: Array<{
      type: string;
      text?: string;
      is_error?: boolean;
    }>;
  };
  session_id?: string;
}

interface ResultMessage {
  type: 'result';
  subtype?: string;
  duration_ms?: number;
  num_turns?: number;
  total_cost_usd?: number;
  is_error?: boolean;
  session_id?: string;
}

interface ErrorMessage {
  error?: string;
  message?: string;
  is_error?: boolean;
}

type ExtendedMessage = SystemMessage | AssistantMessage | UserMessage | ResultMessage | (SDKMessage & ErrorMessage) | { type: string; [key: string]: unknown };

export class MessageDisplay {
  private static truncateText(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private static formatTimestamp(): string {
    return new Date().toLocaleTimeString();
  }

  /**
   * 展示 Claude Code SDK 消息
   */
  static displayMessage(message: SDKMessage): string {
    const timestamp = this.formatTimestamp();
    const extendedMessage = message as ExtendedMessage;
    
    switch (message.type) {
      case 'system':
        return this.displaySystemMessage(extendedMessage as SystemMessage, timestamp);
      
      case 'assistant':
        return this.displayAssistantMessage(extendedMessage as AssistantMessage, timestamp);
      
      case 'user':
        return this.displayUserMessage(extendedMessage as UserMessage, timestamp);
      
      case 'result':
        return this.displayResultMessage(extendedMessage as ResultMessage, timestamp);
      
      default:
        // 处理可能的错误消息或其他未知类型
        const errorMessage = extendedMessage as ErrorMessage;
        if (errorMessage.error || errorMessage.is_error) {
          return this.displayErrorMessage(errorMessage, timestamp);
        }
        return `[${timestamp}] 📨 未知消息类型: ${String((message as { type: string }).type)}`;
    }
  }

  private static displaySystemMessage(message: SystemMessage, timestamp: string): string {
    if (message.subtype === 'init') {
      const toolCount = message.tools?.length || 0;
      const mcpServers = message.mcp_servers?.map(s => `${s.name}(${s.status})`).join(', ') || '无';
      
      return `[${timestamp}] 🔧 系统初始化完成
   • 工作目录: ${message.cwd}
   • 可用工具: ${toolCount} 个
   • MCP 服务器: ${mcpServers}
   • 模型: ${message.model}
   • 会话ID: ${message.session_id?.substring(0, 8)}...`;
    }
    
    return `[${timestamp}] 🔧 系统消息: ${message.subtype || '未知'}`;
  }

  private static displayAssistantMessage(message: AssistantMessage, timestamp: string): string {
    const content = message.message?.content;
    if (!content || !Array.isArray(content)) {
      return `[${timestamp}] 🤖 Claude 响应 (空内容)`;
    }

    let displayText = '';
    let hasToolUse = false;
    let textContent = '';

    for (const item of content) {
      if (item.type === 'text' && item.text) {
        textContent += item.text;
      } else if (item.type === 'tool_use') {
        hasToolUse = true;
        displayText += `\n   🔧 使用工具: ${item.name || '未知工具'}`;
        if (item.input && typeof item.input === 'object') {
          const inputKeys = Object.keys(item.input);
          if (inputKeys.length > 0) {
            displayText += ` (${inputKeys.join(', ')})`;
          }
        }
      }
    }

    const truncatedText = textContent ? this.truncateText(textContent.trim()) : '';
    const usage = message.message?.usage;
    const tokens = usage ? ` [${usage.output_tokens} tokens]` : '';

    let result = `[${timestamp}] 🤖 Claude 响应${tokens}`;
    if (truncatedText) {
      result += `\n   💬 "${truncatedText}"`;
    }
    if (hasToolUse) {
      result += displayText;
    }

    return result;
  }

  private static displayUserMessage(message: UserMessage, timestamp: string): string {
    const content = message.message?.content;
    if (!content || !Array.isArray(content)) {
      return `[${timestamp}] 👤 用户消息 (空内容)`;
    }

    let textContent = '';
    let hasToolResult = false;

    for (const item of content) {
      if (item.type === 'text' && item.text) {
        textContent += item.text;
      } else if (item.type === 'tool_result') {
        hasToolResult = true;
        const isError = item.is_error ? ' ❌' : ' ✅';
        textContent += `[工具结果${isError}]`;
      }
    }

    const truncatedText = this.truncateText(textContent.trim());
    
    return `[${timestamp}] 👤 ${hasToolResult ? '工具反馈' : '用户输入'}: "${truncatedText}"`;
  }

  private static displayResultMessage(message: ResultMessage, timestamp: string): string {
    const subtype = message.subtype;
    const duration = message.duration_ms ? `${(message.duration_ms / 1000).toFixed(1)}s` : '未知';
    const turns = message.num_turns || 0;
    const cost = message.total_cost_usd ? `$${message.total_cost_usd.toFixed(4)}` : '未知';

    let statusIcon = '✅';
    let statusText = '成功';

    if (message.is_error) {
      statusIcon = '❌';
      statusText = '错误';
    } else if (subtype === 'error_max_turns') {
      statusIcon = '⏱️';
      statusText = '达到最大轮次';
    } else if (subtype === 'timeout') {
      statusIcon = '⏰';
      statusText = '超时';
    }

    return `[${timestamp}] ${statusIcon} 会话结束: ${statusText}
   • 耗时: ${duration}
   • 轮次: ${turns}
   • 费用: ${cost}
   • 会话ID: ${message.session_id?.substring(0, 8)}...`;
  }

  private static displayErrorMessage(message: ErrorMessage, timestamp: string): string {
    const error = message.error || message.message || '未知错误';
    const truncatedError = this.truncateText(String(error));
    
    return `[${timestamp}] ❌ 错误: ${truncatedError}`;
  }

  /**
   * 展示消息并输出到控制台
   */
  static logMessage(message: SDKMessage): void {
    const display = this.displayMessage(message);
    console.log(display);
  }

  /**
   * 展示消息的简洁版本
   */
  static displayMessageCompact(message: SDKMessage): string {
    const timestamp = this.formatTimestamp();
    const extendedMessage = message as ExtendedMessage;
    
    switch (message.type) {
      case 'system':
        const systemMsg = extendedMessage as SystemMessage;
        return `[${timestamp}] 🔧 系统: ${systemMsg.subtype || 'init'}`;
      
      case 'assistant':
        const assistantMsg = extendedMessage as AssistantMessage;
        const content = assistantMsg.message?.content;
        const hasText = content?.some(item => item.type === 'text' && item.text);
        const hasToolUse = content?.some(item => item.type === 'tool_use');
        
        if (hasToolUse) {
          return `[${timestamp}] 🤖 Claude: 使用工具中...`;
        } else if (hasText) {
          return `[${timestamp}] 🤖 Claude: 正在响应...`;
        }
        return `[${timestamp}] 🤖 Claude: 处理中...`;
      
      case 'user':
        return `[${timestamp}] 👤 用户: 工具执行反馈`;
      
      case 'result':
        const resultMsg = extendedMessage as ResultMessage;
        const status = resultMsg.is_error ? '❌ 失败' : '✅ 完成';
        return `[${timestamp}] ${status} (${resultMsg.num_turns || 0} 轮)`;
      
      default:
        // 处理错误消息或其他类型
        const errorMsg = extendedMessage as ErrorMessage;
        if (errorMsg.error || errorMsg.is_error) {
          return `[${timestamp}] ❌ 错误`;
        }
        return `[${timestamp}] 📨 ${String((message as { type: string }).type)}`;
    }
  }

  /**
   * 输出简洁版本到控制台
   */
  static logMessageCompact(message: SDKMessage): void {
    const display = this.displayMessageCompact(message);
    console.log(display);
  }
}