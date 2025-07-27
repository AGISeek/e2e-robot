/**
 * 应用常量定义
 * 集中管理所有常量，避免魔法数字和字符串
 */

// API 相关常量
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// 测试相关常量
export const TEST_CONFIG = {
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_WAIT_TIME: 1000,
  MAX_SCREENSHOT_SIZE: 1920,
  SUPPORTED_BROWSERS: ['chromium', 'firefox', 'webkit'],
  DEFAULT_VIEWPORT: { width: 1280, height: 720 },
} as const;

export const TEST_TYPES = {
  FUNCTIONAL: 'functional',
  UX: 'ux',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
  SECURITY: 'security',
  REGRESSION: 'regression',
} as const;

export const TEST_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const TEST_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
} as const;

// UI 相关常量
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  TOOLTIP_DELAY: 500,
  SIDEBAR_WIDTH: 240,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
} as const;

// 存储相关常量
export const STORAGE_KEYS = {
  THEME: 'e2e-robot-theme',
  TOKEN: 'e2e-robot-token',
  USER_PREFERENCES: 'e2e-robot-preferences',
  RECENT_TESTS: 'e2e-robot-recent-tests',
  WORKSPACE: 'e2e-robot-workspace',
} as const;

// 路由常量
export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  TESTS: '/tests',
  RESULTS: '/results',
  SETTINGS: '/settings',
  HELP: '/help',
} as const;

// API 端点
export const API_ENDPOINTS = {
  TEST_GENERATION: '/api/test-generation',
  TEST_EXECUTION: '/api/test-execution',
  TEST_RESULTS: '/api/test-results',
  WEBSITE_ANALYSIS: '/api/website-analysis',
  FILE_UPLOAD: '/api/file-upload',
  HEALTH_CHECK: '/api/health',
} as const;

// SSE 事件类型
export const SSE_EVENTS = {
  CHAT: 'chat',
  WORKFLOW: 'workflow',
  FILE: 'file',
  STEP: 'step',
  PROGRESS: 'progress',
  RESULT: 'result',
  COMPLETE: 'complete',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat',
} as const;

// 文件类型
export const FILE_TYPES = {
  MARKDOWN: 'markdown',
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  JSON: 'json',
  HTML: 'html',
  CSS: 'css',
  TEXT: 'text',
} as const;

export const FILE_EXTENSIONS = {
  [FILE_TYPES.MARKDOWN]: ['.md', '.markdown'],
  [FILE_TYPES.TYPESCRIPT]: ['.ts', '.tsx'],
  [FILE_TYPES.JAVASCRIPT]: ['.js', '.jsx'],
  [FILE_TYPES.JSON]: ['.json'],
  [FILE_TYPES.HTML]: ['.html', '.htm'],
  [FILE_TYPES.CSS]: ['.css', '.scss', '.sass'],
  [FILE_TYPES.TEXT]: ['.txt'],
} as const;

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// 正则表达式
export const REGEX_PATTERNS = {
  URL: /^https?:\/\/[^\s]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  CSS_SELECTOR: /^[#.]?[a-zA-Z][a-zA-Z0-9\-_\[\]="':]+$/,
  XPATH: /^\/\/?[a-zA-Z][a-zA-Z0-9\-_\[\]@="':\/\(\)]+$/,
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  TEST: {
    maxTestCases: 10,
    priority: TEST_PRIORITIES.MEDIUM,
    timeout: TEST_CONFIG.DEFAULT_TIMEOUT,
    retries: TEST_CONFIG.DEFAULT_RETRY_ATTEMPTS,
    types: [TEST_TYPES.FUNCTIONAL, TEST_TYPES.UX],
  },
  UI: {
    theme: 'system',
    language: 'zh-CN',
    pageSize: 10,
    sidebarCollapsed: false,
  },
  API: {
    timeout: API_CONFIG.TIMEOUT,
    retries: API_CONFIG.RETRY_ATTEMPTS,
    retryDelay: API_CONFIG.RETRY_DELAY,
  },
} as const;

// 环境变量键名
export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  API_URL: 'NEXT_PUBLIC_API_URL',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  WORK_DIR: 'WORK_DIR',
  LOG_LEVEL: 'LOG_LEVEL',
} as const;

// 消息模板
export const MESSAGE_TEMPLATES = {
  SUCCESS: {
    TEST_CREATED: '测试用例创建成功',
    TEST_EXECUTED: '测试执行完成',
    FILE_UPLOADED: '文件上传成功',
    SETTINGS_SAVED: '设置保存成功',
  },
  ERROR: {
    NETWORK_FAILED: '网络请求失败，请检查连接',
    INVALID_INPUT: '输入内容不合法，请重新输入',
    PERMISSION_DENIED: '权限不足，无法执行操作',
    SERVER_ERROR: '服务器错误，请稍后重试',
  },
  WARNING: {
    UNSAVED_CHANGES: '存在未保存的更改',
    LARGE_FILE: '文件较大，上传可能需要较长时间',
    COMPATIBILITY: '浏览器兼容性警告',
  },
  INFO: {
    LOADING: '正在加载...',
    PROCESSING: '正在处理...',
    GENERATING: '正在生成测试用例...',
    ANALYZING: '正在分析网站结构...',
  },
} as const;