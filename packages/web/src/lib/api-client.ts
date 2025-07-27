/**
 * API 客户端配置和错误处理
 * 提供统一的 API 调用接口和错误处理机制
 */

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// API 错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 请求配置
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

// API 客户端类
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private defaultTimeout: number;

  constructor(baseURL: string = '', defaultTimeout: number = 10000) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 添加请求拦截器
   */
  private async interceptRequest(url: string, config: RequestConfig): Promise<[string, RequestConfig]> {
    // 处理相对 URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // 合并默认配置
    const mergedConfig: RequestConfig = {
      timeout: this.defaultTimeout,
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    };

    return [fullUrl, mergedConfig];
  }

  /**
   * 处理响应拦截器
   */
  private async interceptResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        response.status.toString(),
        { url: response.url, status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    if (contentType?.includes('text/')) {
      return response.text() as T;
    }
    
    return response.blob() as T;
  }

  /**
   * 带超时的 fetch
   */
  private async fetchWithTimeout(url: string, config: RequestConfig): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchConfig } = config;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('请求超时', 408, 'TIMEOUT');
      }
      
      throw error;
    }
  }

  /**
   * 带重试的请求
   */
  private async requestWithRetry<T>(
    url: string, 
    config: RequestConfig
  ): Promise<T> {
    const { retry = 0, retryDelay = 1000, ...fetchConfig } = config;
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const [fullUrl, mergedConfig] = await this.interceptRequest(url, fetchConfig);
        const response = await this.fetchWithTimeout(fullUrl, mergedConfig);
        return await this.interceptResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        
        // 如果是最后一次尝试，或者是不可重试的错误，直接抛出
        if (attempt === retry || 
            (error instanceof ApiError && error.status && error.status < 500)) {
          throw error;
        }
        
        // 等待后重试
        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * 流式请求 (SSE)
   */
  async stream(
    url: string, 
    config: RequestConfig = {},
    onMessage?: (data: any) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    const [fullUrl, mergedConfig] = await this.interceptRequest(url, {
      ...config,
      headers: {
        ...config.headers,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    try {
      const response = await this.fetchWithTimeout(fullUrl, mergedConfig);
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new ApiError('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const messageData = line.slice(6);
              if (messageData.trim()) {
                const data = JSON.parse(messageData);
                onMessage?.(data);
              }
            } catch (error) {
              console.error('Failed to parse SSE message:', error);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 设置默认头部
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      [key]: value,
    };
  }

  /**
   * 移除默认头部
   */
  removeDefaultHeader(key: string): void {
    if (this.defaultHeaders && typeof this.defaultHeaders === 'object' && !Array.isArray(this.defaultHeaders)) {
      const headers = { ...this.defaultHeaders as Record<string, string> };
      delete headers[key];
      this.defaultHeaders = headers;
    }
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// 便捷方法
export const api = {
  get: <T = any>(url: string, config?: RequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: RequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: RequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: RequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: RequestConfig) => apiClient.delete<T>(url, config),
  stream: (url: string, config?: RequestConfig, onMessage?: (data: any) => void, onError?: (error: Error) => void, onComplete?: () => void) => 
    apiClient.stream(url, config, onMessage, onError, onComplete),
};