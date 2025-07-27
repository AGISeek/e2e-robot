/**
 * 统一状态管理系统
 * 使用 React Context + useReducer 模式
 */

import React, { createContext, useContext, useReducer, useState, ReactNode, Dispatch } from 'react';
import { AsyncState, LoadingState } from '@/types';
import { AppError } from '@/lib/error-handling';

// 基础状态类型
export interface BaseState {
  loading: LoadingState;
  error: AppError | null;
  lastUpdated?: Date;
}

// 异步状态操作类型
export type AsyncAction<T = any> = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: T }
  | { type: 'ERROR'; payload: AppError }
  | { type: 'RESET' };

// 通用异步状态 reducer
export const createAsyncReducer = <T>() => {
  return (state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
    switch (action.type) {
      case 'LOADING':
        return {
          ...state,
          loading: true,
          error: null,
        };
      
      case 'SUCCESS':
        return {
          data: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        };
      
      case 'ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      
      case 'RESET':
        return {
          data: null,
          loading: false,
          error: null,
          lastUpdated: undefined,
        };
      
      default:
        return state;
    }
  };
};

// 创建状态上下文的工厂函数
export const createStateContext = <State, Action>(
  initialState: State,
  reducer: (state: State, action: Action) => State
) => {
  const StateContext = createContext<{
    state: State;
    dispatch: Dispatch<Action>;
  } | null>(null);

  const StateProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return React.createElement(
      StateContext.Provider,
      { value: { state, dispatch } },
      children
    );
  };

  const useStateContext = () => {
    const context = useContext(StateContext);
    if (!context) {
      throw new Error('useStateContext must be used within StateProvider');
    }
    return context;
  };

  return {
    StateProvider,
    useStateContext,
  };
};

// 创建异步状态 Hook 的工厂函数
export const createAsyncStateHook = <T>() => {
  const initialState: AsyncState<T> = {
    data: null,
    loading: false,
    error: null,
  };

  const reducer = createAsyncReducer<T>();

  return () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const execute = async (asyncFn: () => Promise<T>) => {
      dispatch({ type: 'LOADING' });
      
      try {
        const result = await asyncFn();
        dispatch({ type: 'SUCCESS', payload: result });
        return result;
      } catch (error) {
        const appError = error instanceof AppError 
          ? error 
          : new AppError(error instanceof Error ? error.message : String(error));
        
        dispatch({ type: 'ERROR', payload: appError });
        throw appError;
      }
    };

    const reset = () => {
      dispatch({ type: 'RESET' });
    };

    return {
      ...state,
      execute,
      reset,
    };
  };
};

// 通用状态管理 Hook
export const useAsyncState = <T>() => {
  const hook = createAsyncStateHook<T>();
  return hook();
};

// 缓存状态管理
export class StateCache<T = any> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 全局状态缓存实例
export const globalCache = new StateCache();

// 带缓存的异步状态 Hook
export const useCachedAsyncState = <T>(
  cacheKey: string,
  ttl: number = 5 * 60 * 1000
) => {
  const asyncState = useAsyncState<T>();

  const executeWithCache = async (asyncFn: () => Promise<T>) => {
    // 尝试从缓存获取
    const cached = globalCache.get(cacheKey);
    if (cached) {
      asyncState.reset();
      asyncState.execute(async () => cached);
      return cached;
    }

    // 执行异步函数并缓存结果
    const result = await asyncState.execute(asyncFn);
    globalCache.set(cacheKey, result, ttl);
    return result;
  };

  const invalidateCache = () => {
    globalCache.delete(cacheKey);
  };

  return {
    ...asyncState,
    execute: executeWithCache,
    invalidateCache,
  };
};

// 乐观更新 Hook
export const useOptimisticState = <T>(initialValue: T) => {
  const [optimisticValue, setOptimisticValue] = useState(initialValue);
  const [actualValue, setActualValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  const update = async (
    newValue: T,
    asyncUpdate: (value: T) => Promise<T>
  ) => {
    setOptimisticValue(newValue);
    setIsPending(true);

    try {
      const result = await asyncUpdate(newValue);
      setActualValue(result);
      setOptimisticValue(result);
      return result;
    } catch (error) {
      setOptimisticValue(actualValue); // 回滚
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    value: optimisticValue,
    actualValue,
    isPending,
    update,
  };
};

// 批量状态更新 Hook
export const useBatchedState = <T extends Record<string, any>>(
  initialState: T
) => {
  const [state, setState] = useState(initialState);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>>({});

  const batchUpdate = (updates: Partial<T>) => {
    setPendingUpdates(prev => ({ ...prev, ...updates }));
  };

  const commitUpdates = () => {
    setState(prev => ({ ...prev, ...pendingUpdates }));
    setPendingUpdates({});
  };

  const rollbackUpdates = () => {
    setPendingUpdates({});
  };

  const previewState = { ...state, ...pendingUpdates };

  return {
    state,
    previewState,
    pendingUpdates,
    batchUpdate,
    commitUpdates,
    rollbackUpdates,
    hasPendingUpdates: Object.keys(pendingUpdates).length > 0,
  };
};

// 状态历史记录 Hook
export const useStateHistory = <T>(initialValue: T, maxHistory: number = 10) => {
  const [current, setCurrent] = useState(initialValue);
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = (newState: T) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
    setCurrent(newState);
  };

  const undo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrent(history[newIndex]);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrent(history[newIndex]);
    }
  };

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    current,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    history: history.slice(),
    currentIndex,
  };
};