/**
 * 性能监控组件
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/contexts/app-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, formatDuration } from '@/utils/format';

interface PerformanceMetrics {
  // 页面性能
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // 内存使用
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  } | null;
  
  // 网络性能
  networkInfo: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  
  // React 性能
  renderCount: number;
  rerenderRate: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export function PerformanceMonitor({ enabled = false, className }: PerformanceMonitorProps) {
  const { computed } = useApp();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(performance.now());

  // 监听 Ctrl+P 快捷键
  useEffect(() => {
    if (!enabled || !computed.isDevelopment) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [enabled, computed.isDevelopment]);

  useEffect(() => {
    if (!enabled || !computed.isDevelopment) return;

    renderCountRef.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // 收集性能指标
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // 页面性能指标
      const pageLoadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
      const domContentLoaded = navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0;

      // Web Vitals
      let firstContentfulPaint = 0;
      let largestContentfulPaint = 0;
      
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) firstContentfulPaint = fcpEntry.startTime;

      // LCP 需要 PerformanceObserver
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) largestContentfulPaint = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP observer not supported:', error);
        }
      }

      // 内存使用
      let memoryUsage = null;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
      }

      // 网络信息
      let networkInfo = null;
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        networkInfo = {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        };
      }

      setMetrics({
        pageLoadTime,
        domContentLoaded,
        firstContentfulPaint,
        largestContentfulPaint,
        firstInputDelay: 0, // 需要通过事件监听器收集
        cumulativeLayoutShift: 0, // 需要通过 PerformanceObserver 收集
        memoryUsage,
        networkInfo,
        renderCount: renderCountRef.current,
        rerenderRate: timeSinceLastRender < 100 ? 1000 / timeSinceLastRender : 0,
      });
    };

    // 延迟收集指标，避免影响性能
    const timer = setTimeout(collectMetrics, 100);
    return () => clearTimeout(timer);
  }, [enabled, computed.isDevelopment]);

  // FID 监听
  useEffect(() => {
    if (!enabled || !computed.isDevelopment) return;

    let firstInputDelay = 0;
    
    const handleFirstInput = (event: Event) => {
      const perfEntry = performance.getEntriesByType('first-input')[0] as any;
      if (perfEntry) {
        firstInputDelay = perfEntry.processingStart - perfEntry.startTime;
        setMetrics(prev => prev ? { ...prev, firstInputDelay } : null);
      }
    };

    // 监听第一次用户交互
    ['click', 'mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
      document.addEventListener(type, handleFirstInput, { once: true, passive: true });
    });

    return () => {
      ['click', 'mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
        document.removeEventListener(type, handleFirstInput);
      });
    };
  }, [enabled, computed.isDevelopment]);

  // CLS 监听
  useEffect(() => {
    if (!enabled || !computed.isDevelopment || !('PerformanceObserver' in window)) return;

    let clsValue = 0;
    
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => clsObserver.disconnect();
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }, [enabled, computed.isDevelopment]);

  if (!enabled || !computed.isDevelopment || !metrics || !isVisible) {
    return null;
  }

  const getPerformanceLevel = (metric: string, value: number): 'success' | 'warning' | 'destructive' => {
    const thresholds: Record<string, [number, number]> = {
      pageLoadTime: [2000, 4000],
      firstContentfulPaint: [1800, 3000],
      largestContentfulPaint: [2500, 4000],
      firstInputDelay: [100, 300],
      cumulativeLayoutShift: [0.1, 0.25],
    };

    const [good, poor] = thresholds[metric] || [0, 0];
    if (value <= good) return 'success';
    if (value <= poor) return 'warning';
    return 'destructive';
  };

  const getMemoryLevel = (used: number, total: number): 'success' | 'warning' | 'destructive' => {
    const ratio = used / total;
    if (ratio < 0.7) return 'success';
    if (ratio < 0.9) return 'warning';
    return 'destructive';
  };

  return (
    <Card className={`fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50 bg-black/90 text-white text-xs ${className}`}>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">性能监控</h3>
          <Badge variant="secondary" size="sm">DEV</Badge>
        </div>

        <div className="space-y-1">
          <div className="text-orange-400 font-medium">Core Web Vitals</div>
          
          <div className="flex justify-between">
            <span>FCP:</span>
            <Badge 
              variant={getPerformanceLevel('firstContentfulPaint', metrics.firstContentfulPaint)} 
              size="sm"
            >
              {formatDuration(metrics.firstContentfulPaint)}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>LCP:</span>
            <Badge 
              variant={getPerformanceLevel('largestContentfulPaint', metrics.largestContentfulPaint)} 
              size="sm"
            >
              {formatDuration(metrics.largestContentfulPaint)}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>FID:</span>
            <Badge 
              variant={getPerformanceLevel('firstInputDelay', metrics.firstInputDelay)} 
              size="sm"
            >
              {formatDuration(metrics.firstInputDelay)}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>CLS:</span>
            <Badge 
              variant={getPerformanceLevel('cumulativeLayoutShift', metrics.cumulativeLayoutShift)} 
              size="sm"
            >
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-blue-400 font-medium">页面性能</div>
          
          <div className="flex justify-between">
            <span>页面加载:</span>
            <Badge 
              variant={getPerformanceLevel('pageLoadTime', metrics.pageLoadTime)} 
              size="sm"
            >
              {formatDuration(metrics.pageLoadTime)}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>DOM 就绪:</span>
            <span>{formatDuration(metrics.domContentLoaded)}</span>
          </div>
        </div>

        {metrics.memoryUsage && (
          <div className="space-y-1">
            <div className="text-green-400 font-medium">内存使用</div>
            
            <div className="flex justify-between">
              <span>已使用:</span>
              <Badge 
                variant={getMemoryLevel(metrics.memoryUsage.used, metrics.memoryUsage.total)} 
                size="sm"
              >
                {formatFileSize(metrics.memoryUsage.used)}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>总计:</span>
              <span>{formatFileSize(metrics.memoryUsage.total)}</span>
            </div>

            <div className="flex justify-between">
              <span>使用率:</span>
              <span>{((metrics.memoryUsage.used / metrics.memoryUsage.total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {metrics.networkInfo && (
          <div className="space-y-1">
            <div className="text-purple-400 font-medium">网络状态</div>
            
            <div className="flex justify-between">
              <span>连接类型:</span>
              <span>{metrics.networkInfo.effectiveType}</span>
            </div>

            <div className="flex justify-between">
              <span>下行速度:</span>
              <span>{metrics.networkInfo.downlink} Mbps</span>
            </div>

            <div className="flex justify-between">
              <span>延迟:</span>
              <span>{metrics.networkInfo.rtt}ms</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="text-yellow-400 font-medium">React 性能</div>
          
          <div className="flex justify-between">
            <span>渲染次数:</span>
            <span>{metrics.renderCount}</span>
          </div>

          <div className="flex justify-between">
            <span>重渲染频率:</span>
            <Badge 
              variant={metrics.rerenderRate > 10 ? 'destructive' : 'success'} 
              size="sm"
            >
              {metrics.rerenderRate.toFixed(1)} fps
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}