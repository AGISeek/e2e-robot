// API相关的类型定义

export interface TestGenerationConfig {
  targetUrl: string;
  siteName: string;
  testRequirements: string[];
  testTypes: ('functional' | 'ux' | 'performance' | 'accessibility')[];
  maxTestCases: number;
  priority: 'low' | 'medium' | 'high';
  timeout: number;
  workDir: string;
  verbose: boolean;
}

export interface APIErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: any;
}

export interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

// 输入验证接口
export interface ValidatedInput {
  input: string;
  url: string;
  siteName: string;
  isValid: boolean;
  errors?: string[];
}

// 流式响应接口
export interface StreamChunk {
  type: 'data' | 'error' | 'complete';
  payload: any;
  timestamp: number;
}