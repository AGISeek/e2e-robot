/**
 * 统一错误处理系统
 */

import { ERROR_CODES } from '@/constants';

// 基础错误类
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = ERROR_CODES.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    // 确保 stack trace 正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// 具体错误类型
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400, true, context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.NETWORK_ERROR, 0, true, context);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.TIMEOUT_ERROR, 408, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.AUTHENTICATION_ERROR, 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.AUTHORIZATION_ERROR, 403, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.NOT_FOUND_ERROR, 404, true, context);
  }
}

export class ServerError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ERROR_CODES.SERVER_ERROR, 500, false, context);
  }
}

// 错误工厂函数
export const createError = {
  validation: (message: string, context?: Record<string, any>) => 
    new ValidationError(message, context),
    
  network: (message: string, context?: Record<string, any>) => 
    new NetworkError(message, context),
    
  timeout: (message: string, context?: Record<string, any>) => 
    new TimeoutError(message, context),
    
  authentication: (message: string, context?: Record<string, any>) => 
    new AuthenticationError(message, context),
    
  authorization: (message: string, context?: Record<string, any>) => 
    new AuthorizationError(message, context),
    
  notFound: (message: string, context?: Record<string, any>) => 
    new NotFoundError(message, context),
    
  server: (message: string, context?: Record<string, any>) => 
    new ServerError(message, context),
};

// 错误检查函数
export const isAppError = (error: any): error is AppError => 
  error instanceof AppError;

export const isOperationalError = (error: any): boolean => 
  isAppError(error) && error.isOperational;

export const getErrorCode = (error: any): string => 
  isAppError(error) ? error.code : ERROR_CODES.UNKNOWN_ERROR;

export const getErrorMessage = (error: any): string => {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '未知错误';
};

export const getErrorContext = (error: any): Record<string, any> | undefined => 
  isAppError(error) ? error.context : undefined;

// 错误处理器类型
export type ErrorHandler = (error: AppError) => void;

// 全局错误处理器
class ErrorManager {
  private handlers: Map<string, ErrorHandler[]> = new Map();
  private globalHandlers: ErrorHandler[] = [];

  // 注册错误处理器
  register(errorCode: string, handler: ErrorHandler): void {
    const handlers = this.handlers.get(errorCode) || [];
    handlers.push(handler);
    this.handlers.set(errorCode, handlers);
  }

  // 注册全局错误处理器
  registerGlobal(handler: ErrorHandler): void {
    this.globalHandlers.push(handler);
  }

  // 移除错误处理器
  unregister(errorCode: string, handler: ErrorHandler): void {
    const handlers = this.handlers.get(errorCode) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // 移除全局错误处理器
  unregisterGlobal(handler: ErrorHandler): void {
    const index = this.globalHandlers.indexOf(handler);
    if (index > -1) {
      this.globalHandlers.splice(index, 1);
    }
  }

  // 处理错误
  handle(error: Error | AppError): void {
    const appError = isAppError(error) ? error : this.convertToAppError(error);
    
    // 调用特定错误处理器
    const handlers = this.handlers.get(appError.code) || [];
    handlers.forEach(handler => {
      try {
        handler(appError);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });

    // 调用全局错误处理器
    this.globalHandlers.forEach(handler => {
      try {
        handler(appError);
      } catch (handlerError) {
        console.error('Error in global error handler:', handlerError);
      }
    });

    // 开发环境下打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', appError);
    }
  }

  // 转换为 AppError
  private convertToAppError(error: Error): AppError {
    if (isAppError(error)) return error;
    
    // 根据错误类型进行转换
    if (error.name === 'TypeError') {
      return new ValidationError(error.message, { originalError: error.name });
    }
    
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return new NetworkError(error.message, { originalError: error.name });
    }
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return new TimeoutError(error.message, { originalError: error.name });
    }
    
    return new AppError(error.message, ERROR_CODES.UNKNOWN_ERROR, 500, false, {
      originalError: error.name,
      originalStack: error.stack,
    });
  }
}

// 导出全局错误管理器实例
export const errorManager = new ErrorManager();

// 便捷函数
export const handleError = (error: Error | AppError): void => {
  errorManager.handle(error);
};

export const registerErrorHandler = (errorCode: string, handler: ErrorHandler): void => {
  errorManager.register(errorCode, handler);
};

export const registerGlobalErrorHandler = (handler: ErrorHandler): void => {
  errorManager.registerGlobal(handler);
};

// React 错误边界助手
export const createErrorBoundaryHandler = (
  onError?: (error: AppError) => void
): ErrorHandler => {
  return (error: AppError) => {
    // 记录错误到日志服务
    console.error('Error Boundary caught:', error);
    
    // 调用自定义处理器
    onError?.(error);
    
    // 可以在这里集成错误追踪服务
    // Sentry.captureException(error);
  };
};

// Promise 错误处理助手
export const withErrorHandling = async <T>(
  promise: Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    const appError = isAppError(error) 
      ? error 
      : new AppError(getErrorMessage(error));
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      handleError(appError);
    }
    
    return null;
  }
};

// 函数错误处理装饰器
export const withErrorBoundary = <T extends any[], R>(
  fn: (...args: T) => R,
  errorHandler?: (error: AppError) => R
): ((...args: T) => R) => {
  return (...args: T): R => {
    try {
      const result = fn(...args);
      
      // 处理 Promise 返回值
      if (result instanceof Promise) {
        return result.catch(error => {
          const appError = isAppError(error) 
            ? error 
            : new AppError(getErrorMessage(error));
          
          if (errorHandler) {
            return errorHandler(appError);
          } else {
            handleError(appError);
            throw appError;
          }
        }) as R;
      }
      
      return result;
    } catch (error) {
      const appError = isAppError(error) 
        ? error 
        : new AppError(getErrorMessage(error));
      
      if (errorHandler) {
        return errorHandler(appError);
      } else {
        handleError(appError);
        throw appError;
      }
    }
  };
};