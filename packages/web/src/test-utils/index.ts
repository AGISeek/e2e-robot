/**
 * 测试工具函数
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { AppProviders } from '@/contexts';

// 自定义渲染函数，包含所有 Provider
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(AppProviders, null, children);
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// 创建 mock 函数的工具
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  return jest.fn(implementation) as jest.MockedFunction<T>;
};

// 等待异步操作完成
export const waitFor = (condition: () => boolean, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout: condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
};

// 模拟用户事件
export const mockUserEvent = {
  click: (element: HTMLElement) => {
    element.click();
  },
  type: (element: HTMLInputElement, text: string) => {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  clear: (element: HTMLInputElement) => {
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
};

// 创建测试数据的工厂函数
export const createTestData = {
  testConfig: (overrides = {}) => ({
    targetUrl: 'https://example.com',
    siteName: 'example.com',
    testRequirements: ['基础功能测试'],
    testTypes: ['functional'],
    maxTestCases: 10,
    priority: 'medium',
    timeout: 30000,
    workDir: '/tmp/test',
    verbose: true,
    ...overrides,
  }),

  chatMessage: (overrides = {}) => ({
    id: `msg_${Date.now()}`,
    type: 'assistant',
    content: 'Test message',
    timestamp: Date.now(),
    ...overrides,
  }),

  fileContent: (overrides = {}) => ({
    id: `file_${Date.now()}`,
    name: 'test.md',
    type: 'markdown',
    content: '# Test Content',
    size: 1024,
    lastModified: new Date(),
    ...overrides,
  }),

  testResult: (overrides = {}) => ({
    id: `test_${Date.now()}`,
    name: 'Test Case',
    status: 'passed',
    duration: 1000,
    startTime: new Date(),
    endTime: new Date(),
    ...overrides,
  }),

  notification: (overrides = {}) => ({
    id: `notif_${Date.now()}`,
    type: 'info',
    title: 'Test Notification',
    message: 'Test message',
    timestamp: new Date(),
    ...overrides,
  }),
};

// Mock API 响应
export const mockApiResponse = {
  success: <T>(data: T) => ({
    ok: true,
    json: async () => ({ success: true, data }),
    text: async () => JSON.stringify({ success: true, data }),
  }),

  error: (message: string, status = 500) => ({
    ok: false,
    status,
    json: async () => ({ success: false, error: message }),
    text: async () => JSON.stringify({ success: false, error: message }),
  }),

  stream: (chunks: string[]) => {
    let index = 0;
    return {
      ok: true,
      body: {
        getReader: () => ({
          read: async () => {
            if (index >= chunks.length) {
              return { done: true, value: undefined };
            }
            return {
              done: false,
              value: new TextEncoder().encode(chunks[index++]),
            };
          },
        }),
      },
    };
  },
};

// 断言工具
export const expect = {
  toBeInDocument: (element: HTMLElement | null) => {
    if (!element || !document.body.contains(element)) {
      throw new Error('Element is not in document');
    }
  },

  toHaveTextContent: (element: HTMLElement | null, text: string) => {
    if (!element || !element.textContent?.includes(text)) {
      throw new Error(`Element does not contain text: ${text}`);
    }
  },

  toBeVisible: (element: HTMLElement | null) => {
    if (!element || element.style.display === 'none' || element.hidden) {
      throw new Error('Element is not visible');
    }
  },

  toBeDisabled: (element: HTMLElement | null) => {
    if (!element || !(element as HTMLInputElement).disabled) {
      throw new Error('Element is not disabled');
    }
  },
};

// 性能测试工具
export const measurePerformance = async (fn: () => Promise<void> | void): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// 内存使用测试工具
export const measureMemory = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// 清理工具
export const cleanup = () => {
  // 清理所有模拟
  jest.clearAllMocks();
  
  // 清理 DOM
  document.body.innerHTML = '';
  
  // 清理存储
  localStorage.clear();
  sessionStorage.clear();
  
  // 清理计时器
  jest.clearAllTimers();
};

// 测试套件助手
export const describeWithSetup = (
  name: string,
  setup: () => void | Promise<void>,
  tests: () => void
) => {
  describe(name, () => {
    beforeEach(async () => {
      cleanup();
      await setup();
    });

    afterEach(() => {
      cleanup();
    });

    tests();
  });
};

// 重新导出常用的测试工具
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { renderWithProviders as render };