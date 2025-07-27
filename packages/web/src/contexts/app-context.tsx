/**
 * 应用级状态管理
 */

import { useCallback, useMemo } from 'react';
import { createStateContext } from '@/lib/state-management';
import { Theme } from '@/types';
import { AppError } from '@/lib/error-handling';

// 用户偏好设置
export interface UserPreferences {
  theme: Theme;
  language: string;
  sidebarCollapsed: boolean;
  pageSize: number;
  autoSave: boolean;
  notifications: boolean;
  debugMode: boolean;
}

// 应用状态
export interface AppState {
  // 用户设置
  preferences: UserPreferences;
  
  // UI 状态
  sidebarOpen: boolean;
  modalStack: string[];
  notifications: Notification[];
  
  // 全局加载状态
  globalLoading: boolean;
  loadingMessage: string;
  
  // 全局错误
  globalError: AppError | null;
  
  // 网络状态
  online: boolean;
  
  // 应用元数据
  version: string;
  buildTime: string;
  environment: string;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// 动作类型
export type AppAction =
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'PUSH_MODAL'; payload: string }
  | { type: 'POP_MODAL' }
  | { type: 'CLEAR_MODALS' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_GLOBAL_LOADING'; payload: { loading: boolean; message?: string } }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'RESET_APP_STATE' };

// 默认偏好设置
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'zh-CN',
  sidebarCollapsed: false,
  pageSize: 10,
  autoSave: true,
  notifications: true,
  debugMode: process.env.NODE_ENV === 'development',
};

// 初始状态
const initialAppState: AppState = {
  preferences: defaultPreferences,
  sidebarOpen: true,
  modalStack: [],
  notifications: [],
  globalLoading: false,
  loadingMessage: '',
  globalError: null,
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: action.payload,
        },
      };

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'PUSH_MODAL':
      return {
        ...state,
        modalStack: [...state.modalStack, action.payload],
      };

    case 'POP_MODAL':
      return {
        ...state,
        modalStack: state.modalStack.slice(0, -1),
      };

    case 'CLEAR_MODALS':
      return {
        ...state,
        modalStack: [],
      };

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        notifications: [...state.notifications, notification],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload.loading,
        loadingMessage: action.payload.message || '',
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
      };

    case 'SET_ONLINE':
      return {
        ...state,
        online: action.payload,
      };

    case 'RESET_APP_STATE':
      return {
        ...initialAppState,
        preferences: state.preferences, // 保留用户偏好
      };

    default:
      return state;
  }
};

// 创建状态上下文
export const {
  StateProvider: AppStateProvider,
  useStateContext: useAppContext,
} = createStateContext(initialAppState, appReducer);

// 自定义 Hook
export const useApp = () => {
  const { state, dispatch } = useAppContext();

  // 动作创建器 (memoized to prevent infinite re-renders)
  const actions = useMemo(() => ({
    setPreferences: (preferences: Partial<UserPreferences>) =>
      dispatch({ type: 'SET_PREFERENCES', payload: preferences }),

    setTheme: (theme: Theme) =>
      dispatch({ type: 'SET_THEME', payload: theme }),

    setSidebarOpen: (open: boolean) =>
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open }),

    toggleSidebar: () =>
      dispatch({ type: 'TOGGLE_SIDEBAR' }),

    pushModal: (modalId: string) =>
      dispatch({ type: 'PUSH_MODAL', payload: modalId }),

    popModal: () =>
      dispatch({ type: 'POP_MODAL' }),

    clearModals: () =>
      dispatch({ type: 'CLEAR_MODALS' }),

    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),

    removeNotification: (id: string) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),

    clearNotifications: () =>
      dispatch({ type: 'CLEAR_NOTIFICATIONS' }),

    setGlobalLoading: (loading: boolean, message?: string) =>
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: { loading, message } }),

    setGlobalError: (error: AppError | null) =>
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: error }),

    setOnline: (online: boolean) =>
      dispatch({ type: 'SET_ONLINE', payload: online }),

    resetAppState: () =>
      dispatch({ type: 'RESET_APP_STATE' }),
  }), [dispatch]);

  // 便捷方法 (memoized to prevent infinite re-renders)
  const notify = useMemo(() => ({
    success: (title: string, message?: string, duration?: number) =>
      actions.addNotification({ type: 'success', title, message, duration }),

    error: (title: string, message?: string, duration?: number) =>
      actions.addNotification({ type: 'error', title, message, duration }),

    warning: (title: string, message?: string, duration?: number) =>
      actions.addNotification({ type: 'warning', title, message, duration }),

    info: (title: string, message?: string, duration?: number) =>
      actions.addNotification({ type: 'info', title, message, duration }),
  }), [actions]);

  // 计算属性 (memoized to prevent infinite re-renders)
  const computed = useMemo(() => ({
    isDarkMode: state.preferences.theme === 'dark' || 
      (state.preferences.theme === 'system' && 
       typeof window !== 'undefined' && 
       window.matchMedia('(prefers-color-scheme: dark)').matches),
    
    currentModal: state.modalStack[state.modalStack.length - 1] || null,
    hasModals: state.modalStack.length > 0,
    hasNotifications: state.notifications.length > 0,
    isLoading: state.globalLoading,
    hasError: state.globalError !== null,
    isOffline: !state.online,
    isDevelopment: state.environment === 'development',
    isProduction: state.environment === 'production',
  }), [state]);

  return {
    state,
    actions,
    notify,
    computed,
  };
};

// 持久化用户偏好设置的 Hook
export const usePersistentPreferences = () => {
  const { state, actions } = useApp();

  // 加载偏好设置
  const loadPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        actions.setPreferences(preferences);
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }, [actions]);

  // 保存偏好设置
  const savePreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('user-preferences', JSON.stringify(state.preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }, [state.preferences]);

  // 重置偏好设置
  const resetPreferences = useCallback(() => {
    actions.setPreferences(defaultPreferences);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-preferences');
    }
  }, [actions]);

  return {
    loadPreferences,
    savePreferences,
    resetPreferences,
  };
};