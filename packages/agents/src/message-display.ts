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
    id?: string;
    content?: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
      id?: string;
    }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      service_tier?: string;
    };
    stop_reason?: string | null;
    model?: string;
  };
  session_id?: string;
  parent_tool_use_id?: string | null;
}

interface UserMessage {
  type: 'user';
  message?: {
    content?: Array<{
      type: string;
      text?: string;
      is_error?: boolean;
      tool_use_id?: string;
    }>;
  };
  session_id?: string;
  parent_tool_use_id?: string | null;
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
   * 清理控制台转义字符和格式化文本
   */
  private static cleanConsoleText(text: string): string {
    // 移除 ANSI 转义序列
    return text
      .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '') // ANSI escape codes
      .replace(/\u001b\[[0-9]+[ABCDKJ]/g, '') // Cursor movement codes
      .replace(/\u001b\[2K/g, '') // Clear line
      .replace(/\u001b\[1A/g, '') // Move cursor up
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Control characters
      .trim();
  }

  /**
   * 格式化 token 使用信息
   */
  private static formatTokenUsage(usage: any): string {
    if (!usage) return '';
    
    const parts: string[] = [];
    
    if (usage.input_tokens) {
      parts.push(`输入: ${usage.input_tokens}`);
    }
    
    if (usage.output_tokens) {
      parts.push(`输出: ${usage.output_tokens}`);
    }
    
    if (usage.cache_creation_input_tokens) {
      parts.push(`缓存创建: ${usage.cache_creation_input_tokens}`);
    }
    
    if (usage.cache_read_input_tokens) {
      parts.push(`缓存读取: ${usage.cache_read_input_tokens}`);
    }
    
    const total = (usage.input_tokens || 0) + (usage.output_tokens || 0);
    if (total > 0) {
      parts.push(`总计: ${total}`);
    }
    
    return parts.length > 0 ? `[${parts.join(', ')}]` : '';
  }

  /**
   * 检测并格式化错误类型
   */
  private static detectErrorType(text: string): { type: string; summary: string } {
    const cleanText = this.cleanConsoleText(text);
    
    if (cleanText.includes('timeout') || cleanText.includes('Timed out')) {
      return {
        type: '超时错误',
        summary: '操作超时或测试执行时间过长'
      };
    }
    
    if (cleanText.includes('not visible') || cleanText.includes('element is not visible')) {
      return {
        type: '元素不可见',
        summary: '目标元素不可见或未正确加载'
      };
    }
    
    if (cleanText.includes('toBeLessThan') || cleanText.includes('expect')) {
      return {
        type: '断言失败',
        summary: '测试断言条件不满足'
      };
    }
    
    if (cleanText.includes('failed') && cleanText.includes('passed')) {
      const failedMatch = cleanText.match(/(\d+)\s+failed/);
      const passedMatch = cleanText.match(/(\d+)\s+passed/);
      
      if (failedMatch && passedMatch) {
        return {
          type: '部分测试失败',
          summary: `${passedMatch[1]} 个通过，${failedMatch[1]} 个失败`
        };
      }
    }
    
    return {
      type: '执行错误',
      summary: '命令执行过程中发生错误'
    };
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
        if (item.id) {
          displayText += ` (ID: ${item.id.substring(0, 8)}...)`;
        }
        if (item.input && typeof item.input === 'object') {
          const inputKeys = Object.keys(item.input);
          if (inputKeys.length > 0) {
            displayText += `\n      参数: ${inputKeys.join(', ')}`;
          }
        }
      }
    }

    const truncatedText = textContent ? this.truncateText(this.cleanConsoleText(textContent)) : '';
    const usage = message.message?.usage;
    const tokens = this.formatTokenUsage(usage);
    const stopReason = message.message?.stop_reason;
    const model = message.message?.model;

    let result = `[${timestamp}] 🤖 Claude 响应${tokens ? ' ' + tokens : ''}`;
    
    if (model) {
      result += `\n   🧠 模型: ${model}`;
    }
    
    if (stopReason && stopReason !== 'end_turn') {
      result += `\n   ⏹️ 停止原因: ${stopReason}`;
    }
    
    if (truncatedText) {
      result += `\n   💬 "${truncatedText}"`;
    }
    
    if (hasToolUse) {
      result += displayText;
    }

    if (message.parent_tool_use_id) {
      result += `\n   🔗 关联工具: ${message.parent_tool_use_id.substring(0, 8)}...`;
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
    let toolResultId = '';
    let isError = false;

    for (const item of content) {
      if (item.type === 'text' && item.text) {
        textContent += item.text;
      } else if (item.type === 'tool_result') {
        hasToolResult = true;
        isError = item.is_error || false;
        toolResultId = item.tool_use_id || '';
        
        if (item.text) {
          textContent += item.text;
        }
      }
    }

    if (hasToolResult) {
      const statusIcon = isError ? '❌' : '✅';
      const errorInfo = isError ? this.detectErrorType(textContent) : null;
      
      let result = `[${timestamp}] 👤 工具反馈 ${statusIcon}`;
      
      if (toolResultId) {
        result += ` (ID: ${toolResultId.substring(0, 8)}...)`;
      }
      
      if (isError && errorInfo) {
        result += `\n   🚨 错误类型: ${errorInfo.type}`;
        result += `\n   📝 错误摘要: ${errorInfo.summary}`;
        
        // 显示清理后的错误详情（截断）
        const cleanError = this.cleanConsoleText(textContent);
        if (cleanError && cleanError.length > 0) {
          const truncatedError = this.truncateText(cleanError, 300);
          result += `\n   📄 详情: ${truncatedError}`;
        }
      } else {
        // 成功的工具结果
        const cleanText = this.cleanConsoleText(textContent);
        const truncatedText = this.truncateText(cleanText, 200);
        if (truncatedText) {
          result += `\n   📄 结果: ${truncatedText}`;
        }
      }
      
      return result;
    } else {
      const truncatedText = this.truncateText(textContent.trim());
      return `[${timestamp}] 👤 用户输入: "${truncatedText}"`;
    }
  }

  private static displayResultMessage(message: ResultMessage, timestamp: string): string {
    const subtype = message.subtype;
    const duration = message.duration_ms ? `${(message.duration_ms / 1000).toFixed(1)}s` : '未知';
    const turns = message.num_turns || 0;
    const cost = message.total_cost_usd ? `$${message.total_cost_usd.toFixed(4)}` : '未知';

    let statusIcon = '✅';
    let statusText = '成功';
    let statusDescription = '';

    if (message.is_error) {
      statusIcon = '❌';
      statusText = '错误';
      statusDescription = '执行过程中发生错误';
    } else if (subtype === 'error_max_turns') {
      statusIcon = '⏱️';
      statusText = '达到最大轮次';
      statusDescription = '达到最大对话轮次限制';
    } else if (subtype === 'timeout') {
      statusIcon = '⏰';
      statusText = '超时';
      statusDescription = '执行超时，可能需要调整超时设置';
    } else if (subtype === 'user_cancelled') {
      statusIcon = '🛑';
      statusText = '用户取消';
      statusDescription = '用户主动取消执行';
    } else {
      statusDescription = '正常完成所有操作';
    }

    let result = `[${timestamp}] ${statusIcon} 会话结束: ${statusText}`;
    
    if (statusDescription) {
      result += `\n   📝 说明: ${statusDescription}`;
    }
    
    result += `\n   ⏱️ 耗时: ${duration}`;
    result += `\n   🔄 轮次: ${turns}`;
    result += `\n   💰 费用: ${cost}`;
    result += `\n   🆔 会话ID: ${message.session_id?.substring(0, 8)}...`;

    return result;
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

  /**
   * 显示调试级别的详细信息
   */
  static displayMessageDebug(message: SDKMessage): string {
    const timestamp = this.formatTimestamp();
    const extendedMessage = message as ExtendedMessage;
    
    let result = `[${timestamp}] 🐛 调试信息: ${message.type}`;
    
    // 显示原始消息结构的关键字段
    const rawData: string[] = [];
    
    if ('session_id' in extendedMessage && typeof extendedMessage.session_id === 'string') {
      rawData.push(`会话ID: ${extendedMessage.session_id.substring(0, 12)}...`);
    }
    
    if ('parent_tool_use_id' in extendedMessage && typeof extendedMessage.parent_tool_use_id === 'string') {
      rawData.push(`父工具ID: ${extendedMessage.parent_tool_use_id.substring(0, 12)}...`);
    }
    
    if (message.type === 'assistant') {
      const assistantMsg = extendedMessage as AssistantMessage;
      if (assistantMsg.message?.id) {
        rawData.push(`消息ID: ${assistantMsg.message.id}`);
      }
      if (assistantMsg.message?.model) {
        rawData.push(`模型: ${assistantMsg.message.model}`);
      }
      if (assistantMsg.message?.stop_reason) {
        rawData.push(`停止原因: ${assistantMsg.message.stop_reason}`);
      }
    }
    
    if (message.type === 'result') {
      const resultMsg = extendedMessage as ResultMessage;
      if (resultMsg.subtype) {
        rawData.push(`子类型: ${resultMsg.subtype}`);
      }
      if (resultMsg.duration_ms !== undefined) {
        rawData.push(`耗时: ${resultMsg.duration_ms}ms`);
      }
    }
    
    if (rawData.length > 0) {
      result += `\n   📊 ${rawData.join(' | ')}`;
    }
    
    // 显示 JSON 结构（截断）
    const jsonStr = JSON.stringify(message, null, 2);
    const truncatedJson = this.truncateText(jsonStr, 500);
    result += `\n   📄 结构: ${truncatedJson}`;
    
    return result;
  }

  /**
   * 输出调试信息到控制台
   */
  static logMessageDebug(message: SDKMessage): void {
    const display = this.displayMessageDebug(message);
    console.log(display);
  }

  /**
   * 分析消息日志并生成统计报告
   */
  static analyzeMessageLog(messages: any[]): string {
    const stats = {
      total: messages.length,
      byType: {} as Record<string, number>,
      withErrors: 0,
      toolUses: 0,
      totalTokens: 0,
      totalDuration: 0,
      sessions: new Set<string>()
    };

    for (const msgWrapper of messages) {
      const message = msgWrapper.message || msgWrapper;
      
      // 统计消息类型
      stats.byType[message.type] = (stats.byType[message.type] || 0) + 1;
      
      // 统计错误
      if (message.is_error || (message.message?.content?.some((c: any) => c.is_error))) {
        stats.withErrors++;
      }
      
      // 统计工具使用
      if (message.type === 'assistant' && message.message?.content) {
        const toolUseCount = message.message.content.filter((c: any) => c.type === 'tool_use').length;
        stats.toolUses += toolUseCount;
      }
      
      // 统计 tokens
      if (message.message?.usage) {
        const usage = message.message.usage;
        stats.totalTokens += (usage.input_tokens || 0) + (usage.output_tokens || 0);
      }
      
      // 统计会话
      if (message.session_id) {
        stats.sessions.add(message.session_id);
      }
      
      // 统计时长
      if (message.duration_ms) {
        stats.totalDuration += message.duration_ms;
      }
    }

    let report = `📊 消息日志分析报告\n`;
    report += `═══════════════════════\n`;
    report += `📈 总体统计:\n`;
    report += `   • 消息总数: ${stats.total}\n`;
    report += `   • 会话数量: ${stats.sessions.size}\n`;
    report += `   • 错误消息: ${stats.withErrors}\n`;
    report += `   • 工具调用: ${stats.toolUses}\n`;
    report += `   • Token总数: ${stats.totalTokens.toLocaleString()}\n`;
    if (stats.totalDuration > 0) {
      report += `   • 总耗时: ${(stats.totalDuration / 1000).toFixed(1)}s\n`;
    }
    
    report += `\n📋 消息分布:\n`;
    for (const [type, count] of Object.entries(stats.byType)) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      report += `   • ${type}: ${count} (${percentage}%)\n`;
    }
    
    return report;
  }
}