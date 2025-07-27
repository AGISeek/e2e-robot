/**
 * 统一类型定义入口文件
 * 集中管理所有类型定义，避免重复和不一致
 */

// 重新导出所有类型模块
export * from './sse';
export * from './api';
export * from './ui';
export * from './test';

// 通用基础类型
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// 状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  lastUpdated?: Date;
}

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 环境类型
export type Environment = 'development' | 'staging' | 'production';