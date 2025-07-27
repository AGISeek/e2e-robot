/**
 * 测试相关类型定义
 */

// 测试配置类型
export interface LocalTestConfig {
  targetUrl: string;
  siteName: string;
  testRequirements: string[];
  testTypes: TestType[];
  maxTestCases: number;
  priority: TestPriority;
  timeout: number;
  workDir: string;
  verbose: boolean;
}

export type TestType = 
  | 'functional' 
  | 'ux' 
  | 'performance' 
  | 'accessibility' 
  | 'security' 
  | 'regression';

export type TestPriority = 'low' | 'medium' | 'high' | 'critical';

export type TestStatus = 
  | 'pending' 
  | 'running' 
  | 'passed' 
  | 'failed' 
  | 'skipped' 
  | 'cancelled';

// 测试执行结果
export interface TestResult {
  id: string;
  name: string;
  description?: string;
  status: TestStatus;
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: TestError;
  screenshots?: string[];
  logs?: TestLog[];
  metadata?: Record<string, any>;
}

export interface TestError {
  message: string;
  stack?: string;
  type: 'assertion' | 'timeout' | 'network' | 'element' | 'script' | 'unknown';
  details?: any;
}

export interface TestLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// 测试套件
export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  config: LocalTestConfig;
  tests: TestCase[];
  status: TestStatus;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  startTime: Date;
  endTime?: Date;
}

// 测试用例
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  type: TestType;
  priority: TestPriority;
  steps: TestStep[];
  expectedResult?: string;
  tags?: string[];
  timeout?: number;
  retries?: number;
}

export interface TestStep {
  id: string;
  name: string;
  description?: string;
  action: TestAction;
  target?: string;
  value?: string;
  expected?: string;
  screenshot?: boolean;
  waitFor?: number;
}

export type TestAction = 
  | 'navigate'
  | 'click'
  | 'type'
  | 'select'
  | 'check'
  | 'uncheck'
  | 'hover'
  | 'scroll'
  | 'wait'
  | 'screenshot'
  | 'assert'
  | 'custom';

// 测试场景
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  type: TestType;
  priority: TestPriority;
  preconditions?: string[];
  steps: string[];
  expectedOutcome: string;
  testData?: Record<string, any>;
  tags?: string[];
}

// 网站分析结果
export interface WebsiteAnalysis {
  url: string;
  title: string;
  description?: string;
  elements: AnalyzedElement[];
  pages: AnalyzedPage[];
  forms: AnalyzedForm[];
  navigation: NavigationStructure;
  metadata: WebsiteMetadata;
  suggestions: TestSuggestion[];
}

export interface AnalyzedElement {
  id: string;
  type: 'button' | 'link' | 'input' | 'form' | 'image' | 'text' | 'other';
  selector: string;
  text?: string;
  attributes: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  interactive: boolean;
}

export interface AnalyzedPage {
  url: string;
  title: string;
  description?: string;
  elements: AnalyzedElement[];
  loadTime?: number;
  errors?: string[];
}

export interface AnalyzedForm {
  id: string;
  selector: string;
  method: 'get' | 'post';
  action: string;
  fields: FormField[];
  validation?: ValidationRule[];
}

export interface FormField {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'pattern' | 'length' | 'custom';
  value?: any;
  message?: string;
}

export interface NavigationStructure {
  mainMenu: TestNavigationItem[];
  breadcrumbs?: TestNavigationItem[];
  footer?: TestNavigationItem[];
  sidebar?: TestNavigationItem[];
}

export interface TestNavigationItem {
  text: string;
  url: string;
  children?: TestNavigationItem[];
  active?: boolean;
}

export interface WebsiteMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  viewport?: string;
  charset?: string;
  language?: string;
  robots?: string;
  canonicalUrl?: string;
  ogData?: Record<string, string>;
  structuredData?: any[];
}

export interface TestSuggestion {
  type: TestType;
  priority: TestPriority;
  title: string;
  description: string;
  rationale: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  automatable: boolean;
}

// 测试执行状态
export interface TestExecution {
  id: string;
  suiteId: string;
  status: TestStatus;
  currentTest?: string;
  progress: number;
  startTime: Date;
  estimatedEndTime?: Date;
  results: TestResult[];
  errors: TestError[];
  logs: TestLog[];
  browser?: BrowserInfo;
  environment?: EnvironmentInfo;
}

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  userAgent: string;
  viewport: { width: number; height: number };
}

export interface EnvironmentInfo {
  os: string;
  node: string;
  playwright: string;
  timestamp: Date;
  hostname: string;
}

// 测试报告
export interface TestReport {
  id: string;
  suiteId: string;
  executionId: string;
  title: string;
  summary: TestReportSummary;
  results: TestResult[];
  charts: TestChart[];
  recommendations: string[];
  generatedAt: Date;
  format: 'html' | 'json' | 'xml' | 'pdf';
}

export interface TestReportSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  passRate: number;
  totalDuration: number;
  avgDuration: number;
  browser: BrowserInfo;
  environment: EnvironmentInfo;
}

export interface TestChart {
  type: 'pie' | 'bar' | 'line' | 'area';
  title: string;
  data: any[];
  options?: any;
}