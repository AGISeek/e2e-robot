/**
 * SSE (Server-Sent Events) 类型定义
 */

export interface TestConfig {
  targetUrl: string;
  siteName?: string;
  testRequirements?: string[];
  testTypes?: string[];
  maxTestCases?: number;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
  workDir?: string;
  verbose?: boolean;
}

export interface SSEMessage {
  type: 'step' | 'progress' | 'result' | 'error' | 'complete' | 'chat' | 'workflow' | 'file';
  data: any;
  timestamp: number;
}

export interface StepMessage {
  step: number;
  name: string;
  description: string;
  status: 'starting' | 'in_progress' | 'completed' | 'error';
}

export interface ProgressMessage {
  step: number;
  progress: number; // 0-100
  message?: string;
}

export interface ResultMessage {
  step: number;
  filePath?: string;
  content?: string;
  success: boolean;
  error?: string;
}

export interface ErrorMessage {
  step?: number;
  error: string;
  details?: string;
  recoverable?: boolean;
}

export interface CompleteMessage {
  success: boolean;
  totalSteps: number;
  completedSteps: number;
  results: {
    analysisFile?: string;
    scenarioFile?: string;
    testCaseFile?: string;
    testResults?: string;
    calibrationResults?: string;
  };
  summary: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  step?: number;
  stepName?: string;
  timestamp: number;
  metadata?: {
    tokens?: {
      input?: number;
      output?: number;
      cacheRead?: number;
      cacheWrite?: number;
    };
    toolUse?: any;
    error?: string;
  };
}

export interface WorkflowStatus {
  currentStep: number;
  stepName: string;
  stepDescription: string;
  progress: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  totalSteps: number;
}

export interface FileContent {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'markdown' | 'typescript' | 'json' | 'text';
  size: number;
  lastModified: number;
}

export interface FileMessage {
  files: FileContent[];
  workDir: string;
}

export const TestSteps = {
  WEBSITE_ANALYSIS: { id: 1, name: '分析目标', description: '正在分析网站结构和测试需求' },
  SCENARIO_GENERATION: { id: 2, name: '生成方案', description: '基于 AI 生成完整的测试策略' },
  TEST_CASE_GENERATION: { id: 3, name: '优化测试', description: '优化测试用例和执行流程' },
  TEST_EXECUTION: { id: 4, name: '执行测试', description: '运行测试并收集结果' },
  CALIBRATION: { id: 5, name: '准备预览', description: '生成测试代码和预览界面' }
} as const;

export type TestStepId = keyof typeof TestSteps;