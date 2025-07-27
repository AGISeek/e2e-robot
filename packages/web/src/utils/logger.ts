/**
 * 日志工具函数
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  constructor(private prefix: string = '') {}

  private log(level: LogLevel, message: string, context?: any): void {
    const entry: LogEntry = {
      level,
      message: this.prefix ? `[${this.prefix}] ${message}` : message,
      timestamp: new Date(),
      context,
    };

    // 添加到内存日志
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 控制台输出
    if (this.isDevelopment || level === 'error') {
      const timestamp = entry.timestamp.toISOString();
      const logMessage = `${timestamp} [${level.toUpperCase()}] ${entry.message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, context);
          break;
        case 'info':
          console.info(logMessage, context);
          break;
        case 'warn':
          console.warn(logMessage, context);
          break;
        case 'error':
          console.error(logMessage, context);
          break;
      }
    }
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  // 获取日志记录
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // 清空日志
  clear(): void {
    this.logs = [];
  }

  // 导出日志
  export(): string {
    return this.logs
      .map(log => `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
  }
}

// 默认日志器
export const logger = new Logger();

// 创建命名空间日志器
export const createLogger = (namespace: string): Logger => {
  return new Logger(namespace);
};