"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * 错误边界组件 - 捕获子组件中的错误并提供友好的错误界面
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // 调用错误处理回调
    this.props.onError?.(error, errorInfo);
    
    // 在开发环境下打印错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* 错误图标 */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            {/* 错误标题 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                出现了一些问题
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                抱歉，应用程序遇到了一个错误。请尝试刷新页面或返回首页。
              </p>
            </div>

            {/* 错误详情（仅在开发环境显示） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                  错误详情 (开发模式)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                重新尝试
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                返回首页
              </Button>
            </div>

            {/* 联系信息 */}
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              如果问题持续存在，请联系技术支持
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 简单的错误展示组件
 */
interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className || ''}`}>
      <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          出现错误
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
          {errorMessage}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} size="sm" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          重新尝试
        </Button>
      )}
    </div>
  );
}

/**
 * Hook for using error boundaries in functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // 这里可以添加错误报告逻辑
    console.error('Application error:', error, errorInfo);
    
    // 可以集成错误追踪服务，如 Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  };
}