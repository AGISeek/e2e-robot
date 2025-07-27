/**
 * 统一的 Hooks 导出
 * 集中管理所有自定义 Hook
 */

// 性能相关 Hooks
export * from './performance';

// Context Hooks (重新导出便于使用)
export { useTestGeneration } from '@/contexts/test-generation-context';
export { useApp, usePersistentPreferences } from '@/contexts/app-context';
export { useAppState, usePerformanceMonitor, useKeyboardShortcuts } from '@/contexts';

// 通用 Hooks (从 lib 重新导出)
export { 
  useAsyncState, 
  useCachedAsyncState, 
  useOptimisticState, 
  useBatchedState, 
  useStateHistory 
} from '@/lib/state-management';