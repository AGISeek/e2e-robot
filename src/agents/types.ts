/**
 * 代理系统的类型定义
 */

export interface AgentConfig {
  workDir: string;
  verbose?: boolean;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  filePath?: string;
}

export interface WebsiteAnalysisResult {
  url: string;
  timestamp: string;
  pageTitle: string;
  elements: ElementInfo[];
  interactions: InteractionInfo[];
}

export interface ElementInfo {
  type: string;
  selector: string;
  text?: string;
  attributes: Record<string, string>;
}

export interface InteractionInfo {
  element: string;
  actions: string[];
  description: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  steps: TestStep[];
  expectedOutcome: string;
}

export interface TestStep {
  action: string;
  target?: string;
  value?: string;
  description: string;
}

export interface TestCaseResult {
  scenario: string;
  passed: boolean;
  duration: number;
  error?: string;
  screenshots?: string[];
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  
  constructor(config: AgentConfig) {
    this.config = config;
  }
  
  protected log(message: string): void {
    if (this.config.verbose) {
      console.log(`[${this.constructor.name}] ${message}`);
    }
  }
  
  protected logError(error: string): void {
    console.error(`[${this.constructor.name}] ❌ ${error}`);
  }
  
  abstract execute(...args: any[]): Promise<AgentResult>;
}