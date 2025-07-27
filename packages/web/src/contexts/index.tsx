"use client";

/**
 * 统一的应用提供者
 * 组合所有上下文提供者
 */

import { ReactNode, useEffect } from 'react';
import { AppStateProvider, usePersistentPreferences } from './app-context';
import { TestGenerationProvider } from './test-generation-context';
import { ThemeProvider } from './theme-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { registerGlobalErrorHandler } from '@/lib/error-handling';
import { useApp } from './app-context';

interface AppProvidersProps {
  children: ReactNode;
}

// 内部组件处理副作用
function AppEffects({ children }: { children: ReactNode }) {
  const { actions, state } = useApp();
  const { loadPreferences, savePreferences } = usePersistentPreferences();

  // 加载用户偏好设置
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // 保存用户偏好设置
  useEffect(() => {
    savePreferences();
  }, [state.preferences, savePreferences]);

  // 监听网络状态
  useEffect(() => {
    const updateOnlineStatus = () => {
      actions.setOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [actions]);

  // 注册全局错误处理器
  useEffect(() => {
    const handleGlobalError = (error: any) => {
      actions.setGlobalError(error);
      actions.addNotification({
        type: 'error',
        title: '系统错误',
        message: error.message || '发生了未知错误',
        duration: 5000,
      });
    };

    registerGlobalErrorHandler(handleGlobalError);

    // 处理未捕获的 Promise 错误
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      handleGlobalError(error);
      event.preventDefault();
    };

    // 处理全局错误
    const handleError = (event: ErrorEvent) => {
      handleGlobalError(event.error || new Error(event.message));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [actions]);

  // 清理过期通知
  useEffect(() => {
    const cleanupNotifications = () => {
      const now = Date.now();
      state.notifications.forEach(notification => {
        const duration = notification.duration || 5000;
        const elapsed = now - notification.timestamp.getTime();
        
        if (elapsed >= duration) {
          actions.removeNotification(notification.id);
        }
      });
    };

    const interval = setInterval(cleanupNotifications, 1000);
    return () => clearInterval(interval);
  }, [state.notifications, actions]);

  return <>{children}</>;
}

// 主应用提供者
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Top-level error boundary:', error, errorInfo);
        
        // 这里可以集成错误报告服务
        // reportError(error, errorInfo);
      }}
    >
      <AppStateProvider>
        <TestGenerationProvider>
          <ThemeProvider>
            <AppEffects>
              {children}
            </AppEffects>
          </ThemeProvider>
        </TestGenerationProvider>
      </AppStateProvider>
    </ErrorBoundary>
  );
}

// 便捷的 Hook 组合
export function useAppState() {
  const app = useApp();
  
  return {
    ...app,
    // 添加一些便捷方法
    showLoading: (message?: string) => app.actions.setGlobalLoading(true, message),
    hideLoading: () => app.actions.setGlobalLoading(false),
    showError: (error: string | Error) => {
      const message = typeof error === 'string' ? error : error.message;
      app.notify.error('错误', message);
    },
    showSuccess: (message: string) => app.notify.success('成功', message),
    showWarning: (message: string) => app.notify.warning('警告', message),
    showInfo: (message: string) => app.notify.info('提示', message),
  };
}

// 性能监控 Hook
export function usePerformanceMonitor() {
  const { actions, computed } = useApp();

  useEffect(() => {
    if (!computed.isDevelopment) return;

    // 监控长任务
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 长于50ms的任务
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });

      return () => observer.disconnect();
    }
  }, [computed.isDevelopment]);

  useEffect(() => {
    if (!computed.isDevelopment) return;

    // 监控内存使用
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / 1048576; // MB
        const total = memory.totalJSHeapSize / 1048576; // MB
        
        if (used / total > 0.9) { // 使用超过90%
          console.warn('High memory usage:', {
            used: `${used.toFixed(2)}MB`,
            total: `${total.toFixed(2)}MB`,
            percentage: `${((used / total) * 100).toFixed(1)}%`,
          });
        }
      }
    };

    const interval = setInterval(monitorMemory, 10000); // 每10秒检查一次
    return () => clearInterval(interval);
  }, [computed.isDevelopment]);
}

// 键盘快捷键 Hook
export function useKeyboardShortcuts() {
  const { actions, state } = useApp();

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K: 搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        actions.pushModal('search');
      }

      // Ctrl/Cmd + /: 显示快捷键帮助
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        actions.pushModal('shortcuts');
      }

      // Ctrl/Cmd + B: 切换侧边栏
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        actions.toggleSidebar();
      }

      // Escape: 关闭模态框
      if (event.key === 'Escape' && state.modalStack.length > 0) {
        event.preventDefault();
        actions.popModal();
      }

      // Ctrl/Cmd + Shift + D: 切换调试模式
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        actions.setPreferences({
          debugMode: !state.preferences.debugMode,
        });
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [actions, state]);
}