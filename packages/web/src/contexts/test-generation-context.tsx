/**
 * 测试生成状态管理
 */

import { createStateContext, createAsyncReducer } from '@/lib/state-management';
import { LocalTestConfig, TestSuite, TestResult, WebsiteAnalysis } from '@/types/test';
import { SSEMessage, ChatMessage, WorkflowStatus, FileContent } from '@/types/sse';
import { AppError } from '@/lib/error-handling';

// 测试生成状态类型
export interface TestGenerationState {
  // 配置相关
  config: LocalTestConfig | null;
  configLoading: boolean;
  configError: AppError | null;

  // 生成过程
  isGenerating: boolean;
  currentStep: number;
  progress: number;
  totalSteps: number;

  // 聊天消息
  chatMessages: ChatMessage[];
  
  // 工作流状态
  workflowStatus: WorkflowStatus | null;
  
  // 文件内容
  files: FileContent[];
  activeFileId: string | null;
  
  // 结果
  websiteAnalysis: WebsiteAnalysis | null;
  testSuite: TestSuite | null;
  testResults: TestResult[];
  
  // 错误和状态
  error: AppError | null;
  lastUpdated: Date | null;
}

// 动作类型
export type TestGenerationAction =
  | { type: 'SET_CONFIG'; payload: LocalTestConfig }
  | { type: 'SET_CONFIG_LOADING'; payload: boolean }
  | { type: 'SET_CONFIG_ERROR'; payload: AppError | null }
  | { type: 'START_GENERATION' }
  | { type: 'STOP_GENERATION' }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_WORKFLOW_STATUS'; payload: WorkflowStatus }
  | { type: 'SET_FILES'; payload: FileContent[] }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'SET_WEBSITE_ANALYSIS'; payload: WebsiteAnalysis }
  | { type: 'SET_TEST_SUITE'; payload: TestSuite }
  | { type: 'SET_TEST_RESULTS'; payload: TestResult[] }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'RESET_STATE' }
  | { type: 'HANDLE_SSE_MESSAGE'; payload: SSEMessage };

// 初始状态
const initialTestGenerationState: TestGenerationState = {
  config: null,
  configLoading: false,
  configError: null,
  isGenerating: false,
  currentStep: 0,
  progress: 0,
  totalSteps: 5,
  chatMessages: [],
  workflowStatus: null,
  files: [],
  activeFileId: null,
  websiteAnalysis: null,
  testSuite: null,
  testResults: [],
  error: null,
  lastUpdated: null,
};

// Reducer
const testGenerationReducer = (
  state: TestGenerationState,
  action: TestGenerationAction
): TestGenerationState => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        configError: null,
        lastUpdated: new Date(),
      };

    case 'SET_CONFIG_LOADING':
      return {
        ...state,
        configLoading: action.payload,
      };

    case 'SET_CONFIG_ERROR':
      return {
        ...state,
        configError: action.payload,
        configLoading: false,
      };

    case 'START_GENERATION':
      return {
        ...state,
        isGenerating: true,
        currentStep: 0,
        progress: 0,
        error: null,
        chatMessages: [],
        files: [],
        activeFileId: null,
        lastUpdated: new Date(),
      };

    case 'STOP_GENERATION':
      return {
        ...state,
        isGenerating: false,
        lastUpdated: new Date(),
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        lastUpdated: new Date(),
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
        lastUpdated: new Date(),
      };

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages.filter(msg => msg.id !== action.payload.id),
          action.payload,
        ],
        lastUpdated: new Date(),
      };

    case 'SET_WORKFLOW_STATUS':
      return {
        ...state,
        workflowStatus: action.payload,
        currentStep: action.payload.currentStep - 1,
        progress: action.payload.progress,
        lastUpdated: new Date(),
      };

    case 'SET_FILES':
      return {
        ...state,
        files: action.payload,
        activeFileId: action.payload.length > 0 && !state.activeFileId 
          ? action.payload[0].id 
          : state.activeFileId,
        lastUpdated: new Date(),
      };

    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFileId: action.payload,
      };

    case 'SET_WEBSITE_ANALYSIS':
      return {
        ...state,
        websiteAnalysis: action.payload,
        lastUpdated: new Date(),
      };

    case 'SET_TEST_SUITE':
      return {
        ...state,
        testSuite: action.payload,
        lastUpdated: new Date(),
      };

    case 'SET_TEST_RESULTS':
      return {
        ...state,
        testResults: action.payload,
        lastUpdated: new Date(),
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isGenerating: action.payload ? false : state.isGenerating,
        lastUpdated: new Date(),
      };

    case 'RESET_STATE':
      return {
        ...initialTestGenerationState,
        config: state.config, // 保留配置
      };

    case 'HANDLE_SSE_MESSAGE':
      return handleSSEMessage(state, action.payload);

    default:
      return state;
  }
};

// SSE 消息处理
const handleSSEMessage = (
  state: TestGenerationState,
  message: SSEMessage
): TestGenerationState => {
  switch (message.type) {
    case 'chat':
      const chatMessage = message.data as ChatMessage;
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages.filter(msg => msg.id !== chatMessage.id),
          chatMessage,
        ],
        lastUpdated: new Date(),
      };

    case 'workflow':
      const workflowData = message.data as WorkflowStatus;
      return {
        ...state,
        workflowStatus: workflowData,
        currentStep: workflowData.currentStep - 1,
        progress: workflowData.progress,
        lastUpdated: new Date(),
      };

    case 'file':
      const fileData = message.data as { files: FileContent[] };
      return {
        ...state,
        files: fileData.files,
        activeFileId: fileData.files.length > 0 && !state.activeFileId 
          ? fileData.files[0].id 
          : state.activeFileId,
        lastUpdated: new Date(),
      };

    case 'complete':
      return {
        ...state,
        isGenerating: false,
        progress: 100,
        lastUpdated: new Date(),
      };

    case 'error':
      const errorData = message.data as { error: string; recoverable?: boolean };
      return {
        ...state,
        error: new AppError(errorData.error),
        isGenerating: errorData.recoverable !== false ? state.isGenerating : false,
        lastUpdated: new Date(),
      };

    default:
      return state;
  }
};

// 创建状态上下文
export const {
  StateProvider: TestGenerationProvider,
  useStateContext: useTestGenerationContext,
} = createStateContext(initialTestGenerationState, testGenerationReducer);

// 自定义 Hook
export const useTestGeneration = () => {
  const { state, dispatch } = useTestGenerationContext();

  // 动作创建器
  const actions = {
    setConfig: (config: LocalTestConfig) => 
      dispatch({ type: 'SET_CONFIG', payload: config }),

    setConfigLoading: (loading: boolean) =>
      dispatch({ type: 'SET_CONFIG_LOADING', payload: loading }),

    setConfigError: (error: AppError | null) =>
      dispatch({ type: 'SET_CONFIG_ERROR', payload: error }),

    startGeneration: () =>
      dispatch({ type: 'START_GENERATION' }),

    stopGeneration: () =>
      dispatch({ type: 'STOP_GENERATION' }),

    setCurrentStep: (step: number) =>
      dispatch({ type: 'SET_CURRENT_STEP', payload: step }),

    setProgress: (progress: number) =>
      dispatch({ type: 'SET_PROGRESS', payload: progress }),

    addChatMessage: (message: ChatMessage) =>
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message }),

    setWorkflowStatus: (status: WorkflowStatus) =>
      dispatch({ type: 'SET_WORKFLOW_STATUS', payload: status }),

    setFiles: (files: FileContent[]) =>
      dispatch({ type: 'SET_FILES', payload: files }),

    setActiveFile: (fileId: string | null) =>
      dispatch({ type: 'SET_ACTIVE_FILE', payload: fileId }),

    setWebsiteAnalysis: (analysis: WebsiteAnalysis) =>
      dispatch({ type: 'SET_WEBSITE_ANALYSIS', payload: analysis }),

    setTestSuite: (testSuite: TestSuite) =>
      dispatch({ type: 'SET_TEST_SUITE', payload: testSuite }),

    setTestResults: (results: TestResult[]) =>
      dispatch({ type: 'SET_TEST_RESULTS', payload: results }),

    setError: (error: AppError | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),

    resetState: () =>
      dispatch({ type: 'RESET_STATE' }),

    handleSSEMessage: (message: SSEMessage) =>
      dispatch({ type: 'HANDLE_SSE_MESSAGE', payload: message }),
  };

  // 计算属性
  const computed = {
    hasConfig: state.config !== null,
    hasFiles: state.files.length > 0,
    activeFile: state.files.find(f => f.id === state.activeFileId) || null,
    completedSteps: Math.floor(state.progress / 20), // 假设每步20%
    isComplete: state.progress >= 100,
    hasError: state.error !== null,
  };

  return {
    state,
    actions,
    computed,
  };
};