/**
 * 异步工具函数
 */

export const async = {
  // 延迟函数
  delay: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 超时包装器
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      )
    ]);
  },
  
  // 重试函数
  retry: async <T>(
    fn: () => Promise<T>, 
    retries: number = 3, 
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return async.retry(fn, retries - 1, delay);
    }
  },
  
  // 批量执行
  batch: async <T, R>(
    items: T[], 
    fn: (item: T) => Promise<R>, 
    batchSize: number = 5
  ): Promise<R[]> => {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fn));
      results.push(...batchResults);
    }
    return results;
  },
  
  // 防抖
  debounce: <T extends (...args: any[]) => any>(
    fn: T, 
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },
  
  // 节流
  throttle: <T extends (...args: any[]) => any>(
    fn: T, 
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};