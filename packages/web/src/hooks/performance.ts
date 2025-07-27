/**
 * 性能优化工具和 Hooks
 */

import React, { 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect, 
  useState,
  RefObject,
  DependencyList,
} from 'react';
import { debounce, throttle } from '@/utils';

// 稳定化引用的 Hook
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback(callback, deps);
}

// 深度比较的 useMemo
export function useDeepMemo<T>(
  factory: () => T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

// 深度比较函数
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
}

// 防抖 Hook
export function useDebounced<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: DependencyList
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...deps]
  );
  
  return debouncedCallback as T;
}

// 节流 Hook
export function useThrottled<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: DependencyList
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay, ...deps]
  );
  
  return throttledCallback as T;
}

// 交叉观察器 Hook（用于懒加载）
export function useIntersectionObserver(
  elementRef: RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, options]);
  
  return isIntersecting;
}

// 虚拟化列表 Hook
export function useVirtualization<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        item,
        index: visibleRange.startIndex + index,
        top: (visibleRange.startIndex + index) * itemHeight,
      }));
  }, [items, visibleRange, itemHeight]);
  
  const totalHeight = items.length * itemHeight;
  
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    onScroll,
    scrollTop,
  };
}

// 图片懒加载 Hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const isIntersecting = useIntersectionObserver(
    { current: imageRef },
    { threshold: 0.1 }
  );
  
  useEffect(() => {
    if (isIntersecting && src && imageSrc !== src) {
      const img = new Image();
      img.onload = () => setImageSrc(src);
      img.src = src;
    }
  }, [isIntersecting, src, imageSrc]);
  
  return {
    imageSrc,
    setImageRef,
    isLoaded: imageSrc === src,
  };
}

// 预加载资源 Hook
export function usePreload(urls: string[], type: 'image' | 'script' | 'style' = 'image') {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (urls.length === 0) return;
    
    setIsLoading(true);
    setLoadedCount(0);
    
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (type === 'image') {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        } else if (type === 'script') {
          const script = document.createElement('script');
          script.onload = () => resolve();
          script.onerror = reject;
          script.src = url;
          document.head.appendChild(script);
        } else if (type === 'style') {
          const link = document.createElement('link');
          link.onload = () => resolve();
          link.onerror = reject;
          link.rel = 'stylesheet';
          link.href = url;
          document.head.appendChild(link);
        }
      }).then(() => {
        setLoadedCount(prev => prev + 1);
      });
    });
    
    Promise.allSettled(promises).then(() => {
      setIsLoading(false);
    });
  }, [urls, type]);
  
  return {
    loadedCount,
    isLoading,
    progress: urls.length > 0 ? loadedCount / urls.length : 0,
    isComplete: loadedCount === urls.length,
  };
}

// 组件懒加载工具
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return React.createElement(
      React.Suspense,
      { 
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, props)
    );
  };
}

// 内存泄漏防护 Hook
export function useCleanup(cleanup: () => void, deps: DependencyList = []) {
  useEffect(() => {
    return cleanup;
  }, deps);
}

// 异步状态缓存 Hook
export function useAsyncCache<T>(
  key: string,
  asyncFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5分钟
) {
  const cache = useRef(new Map<string, { data: T; timestamp: number }>());
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });
  
  const execute = useCallback(async () => {
    const cached = cache.current.get(key);
    const now = Date.now();
    
    // 如果有有效缓存，直接返回
    if (cached && now - cached.timestamp < ttl) {
      setState({ data: cached.data, loading: false, error: null });
      return cached.data;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      cache.current.set(key, { data, timestamp: now });
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      throw error;
    }
  }, [key, asyncFn, ttl]);
  
  const invalidate = useCallback(() => {
    cache.current.delete(key);
  }, [key]);
  
  return {
    ...state,
    execute,
    invalidate,
  };
}

// 渲染性能监控 Hook
export function useRenderPerformance(componentName: string, enabled = false) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  
  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current++;
    const renderTime = performance.now();
    renderTimes.current.push(renderTime);
    
    // 只保留最近10次渲染时间
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }
    
    console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);
    
    if (renderTimes.current.length > 1) {
      const timeDiff = renderTime - renderTimes.current[renderTimes.current.length - 2];
      if (timeDiff < 16) { // 少于16ms间隔可能有性能问题
        console.warn(`[Performance] ${componentName} rapid re-render detected: ${timeDiff.toFixed(2)}ms`);
      }
    }
  });
  
  return {
    renderCount: renderCount.current,
    getAverageRenderInterval: () => {
      if (renderTimes.current.length < 2) return 0;
      const total = renderTimes.current[renderTimes.current.length - 1] - renderTimes.current[0];
      return total / (renderTimes.current.length - 1);
    },
  };
}

// React 18 新特性：并发渲染优化
export function useDeferredValue<T>(value: T, timeout = 5000): T {
  // 在支持的环境中使用 React 18 的 useDeferredValue
  if (typeof React !== 'undefined' && 'useDeferredValue' in React) {
    return (React as any).useDeferredValue(value);
  }
  
  // 降级实现
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredValue(value);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [value, timeout]);
  
  return deferredValue;
}

// 高优先级状态更新
export function useTransition(): [boolean, (callback: () => void) => void] {
  // 在支持的环境中使用 React 18 的 useTransition
  if (typeof React !== 'undefined' && 'useTransition' in React) {
    return (React as any).useTransition();
  }
  
  // 降级实现
  const [isPending, setIsPending] = useState(false);
  
  const startTransition = useCallback((callback: () => void) => {
    setIsPending(true);
    
    // 使用 MessageChannel 来模拟并发行为
    const channel = new MessageChannel();
    channel.port2.onmessage = () => {
      callback();
      setIsPending(false);
    };
    channel.port1.postMessage(null);
  }, []);
  
  return [isPending, startTransition];
}