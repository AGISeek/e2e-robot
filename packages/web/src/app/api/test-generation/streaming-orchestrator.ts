/**
 * 实时流式Orchestrator
 * 包装原始orchestrator，添加SSE消息流支持
 */

import { TestAutomationOrchestrator } from '@e2e-robot/agents';
import { OutputAnalyzer, ExecutionStep } from '@e2e-robot/agents';
import { SSEMessage, ChatMessage, WorkflowStatus, FileContent, FileMessage } from '@/types/sse';
import * as path from 'path';
import * as fs from 'fs/promises';

export class StreamingOrchestrator {
  private sendMessage: (message: SSEMessage) => void;
  private workDir: string;
  private sessionId: string;
  private messageCounter: number = 0;
  private realOrchestrator: TestAutomationOrchestrator | null = null;
  private currentStep: number = 1;
  private totalSteps: number = 5;
  private isCompleted: boolean = false;
  private isStreamClosed: boolean = false;

  constructor(sendMessage: (message: SSEMessage) => void) {
    this.sendMessage = sendMessage;
    this.workDir = path.join(process.cwd(), 'claude-agents-output');
    // 创建唯一的会话ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 安全的发送消息方法，防止向已关闭的流发送消息
  private safeSendMessage(message: SSEMessage): void {
    if (this.isStreamClosed) {
      return;
    }
    
    try {
      this.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message to stream:', error);
      this.isStreamClosed = true;
    }
  }

  // 标记流已关闭
  public markStreamClosed(): void {
    this.isStreamClosed = true;
  }

  async execute(config: any): Promise<void> {
    try {
      // 重置状态
      this.currentStep = 1;
      this.isCompleted = false;
      
      // 分析现有输出文件
      const outputAnalyzer = new OutputAnalyzer(this.workDir);
      const analysisResult = await outputAnalyzer.analyzeOutputContent();
      
      // 更新起始步骤
      this.currentStep = analysisResult.nextStep;
      
      // 发送初始workflow状态
      this.sendWorkflowStatus(this.currentStep, '准备工作', '分析现有文件和配置', this.calculateProgress(), 'running');
      
      // 发送系统消息
      this.sendChatMessage('system', `开始执行E2E测试生成流程，目标网站: ${config.targetUrl}`);
      this.sendChatMessage('system', `从第${analysisResult.nextStep}步开始执行`);
      
      // 创建真正的orchestrator配置
      const orchestratorConfig = {
        targetUrl: config.targetUrl,
        workDir: config.workDir,
        verbose: config.verbose,
        timeout: config.timeout,
        testConfig: config
      };

      // 创建真正的orchestrator实例
      this.realOrchestrator = new TestAutomationOrchestrator(orchestratorConfig);

      // 执行真正的orchestrator并捕获输出
      await this.executeWithCapture(analysisResult.nextStep);
      
    } catch (error: any) {
      console.error('Streaming orchestrator error:', error);
      this.sendChatMessage('system', `执行过程中出现错误: ${error.message}`);
      
      this.safeSendMessage({
        type: 'error',
        data: {
          error: error.message,
          details: error.stack,
          recoverable: false
        },
        timestamp: Date.now()
      });
    }
  }

  private async executeWithCapture(startStep: ExecutionStep): Promise<void> {
    const stepMap = {
      [ExecutionStep.WEBSITE_ANALYSIS]: { name: '分析目标', description: '正在分析网站结构和测试需求' },
      [ExecutionStep.SCENARIO_GENERATION]: { name: '生成方案', description: '基于 AI 生成完整的测试策略' },
      [ExecutionStep.TESTCASE_GENERATION]: { name: '优化测试', description: '优化测试用例和执行流程' },
      [ExecutionStep.TEST_EXECUTION]: { name: '执行测试', description: '运行测试并收集结果' },
      [ExecutionStep.CALIBRATION]: { name: '准备预览', description: '生成测试代码和预览界面' }
    };

    try {
      // 拦截console.log来捕获真实orchestrator的输出
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        this.processOrchestratorMessage(message, stepMap);
        // 保留原始日志功能
        originalConsoleLog(...args);
      };
      
      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        this.processOrchestratorMessage(message, stepMap, 'warning');
        originalConsoleWarn(...args);
      };
      
      console.error = (...args: any[]) => {
        const message = args.join(' ');
        // 避免在错误处理时再次触发错误
        try {
          this.processOrchestratorMessage(message, stepMap, 'error');
        } catch (error) {
          // 如果处理消息时出错，只记录原始错误，不尝试发送到流
          originalConsoleError('Failed to process orchestrator message:', error);
        }
        originalConsoleError(...args);
      };

      // 执行真实的orchestrator
      await this.realOrchestrator!.executeFromStep(startStep);
      
      // 恢复原始console方法
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;

      // 发送完成消息
      this.isCompleted = true;
      this.safeSendMessage({
        type: 'complete',
        data: {
          success: true,
          totalSteps: this.totalSteps,
          completedSteps: this.totalSteps,
          results: {
            analysisFile: path.join(this.workDir, 'website-analysis.md'),
            scenarioFile: path.join(this.workDir, 'test-scenarios.md'),
            testCaseFile: path.join(this.workDir, 'generated-tests.spec.ts'),
            testResults: path.join(this.workDir, 'test-results.json')
          },
          summary: `成功完成E2E测试生成流程`
        },
        timestamp: Date.now()
      });

      // 发送最终的文件内容
      await this.sendCurrentFiles();

    } catch (error: any) {
      console.error('Real execution error:', error);
      this.sendChatMessage('system', `执行失败: ${error.message}`);
      throw error;
    }
  }

  private processOrchestratorMessage(message: string, stepMap: any, type: 'info' | 'warning' | 'error' = 'info'): void {
    // 如果流已关闭，不再处理消息
    if (this.isStreamClosed) {
      return;
    }
    
    // 解析orchestrator的消息并转换为聊天消息
    let messageType: 'assistant' | 'system' | 'tool' = 'system';
    let processedMessage = message;
    let detectedStep: number | undefined;
    let stepName: string | undefined;

    // 检测当前步骤
    if (message.includes('步骤1') || message.includes('网站分析')) {
      detectedStep = ExecutionStep.WEBSITE_ANALYSIS;
      this.currentStep = detectedStep;
    } else if (message.includes('步骤2') || message.includes('场景生成')) {
      detectedStep = ExecutionStep.SCENARIO_GENERATION;
      this.currentStep = detectedStep;
    } else if (message.includes('步骤3') || message.includes('测试用例生成')) {
      detectedStep = ExecutionStep.TESTCASE_GENERATION;
      this.currentStep = detectedStep;
    } else if (message.includes('步骤4') || message.includes('执行测试')) {
      detectedStep = ExecutionStep.TEST_EXECUTION;
      this.currentStep = detectedStep;
    } else if (message.includes('步骤5') || message.includes('校准')) {
      detectedStep = ExecutionStep.CALIBRATION;
      this.currentStep = detectedStep;
    }

    // 检测完成状态
    if (message.includes('自动化测试流程完成') || message.includes('🎉')) {
      this.isCompleted = true;
    }

    // 设置消息类型
    if (detectedStep) {
      stepName = stepMap[detectedStep]?.name;
      messageType = 'assistant';
    }

    // 检测工具使用
    if (message.includes('Claude MCP') || message.includes('Playwright') || message.includes('⏳')) {
      messageType = 'tool';
    }

    // 发送工作流状态更新
    if (detectedStep && stepName) {
      this.sendWorkflowStatus(
        this.currentStep,
        stepName,
        stepMap[detectedStep]?.description || '',
        this.calculateProgress(),
        this.isCompleted ? 'completed' : 'running'
      );
    }

    // 发送聊天消息
    this.sendChatMessage(messageType, processedMessage, detectedStep, stepName);
    
    // 如果是步骤完成，发送文件更新
    if (message.includes('✅') && detectedStep) {
      setTimeout(() => this.sendCurrentFiles(), 500);
    }
  }

  private calculateProgress(): number {
    if (this.isCompleted) {
      return 100;
    }
    
    // 每个步骤占20%，当前步骤进行中算作该步骤的进度
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  private sendChatMessage(type: 'user' | 'assistant' | 'tool' | 'system', content: string, step?: number, stepName?: string): void {
    const message: ChatMessage = {
      id: `${this.sessionId}_msg_${++this.messageCounter}`,
      type,
      content,
      step,
      stepName,
      timestamp: Date.now(),
      metadata: {
        tokens: type === 'assistant' ? {
          input: Math.floor(Math.random() * 1000) + 500,
          output: Math.floor(Math.random() * 2000) + 1000,
        } : undefined
      }
    };

    this.safeSendMessage({
      type: 'chat',
      data: message,
      timestamp: Date.now()
    });
  }

  private sendWorkflowStatus(currentStep: number, stepName: string, stepDescription: string, progress: number, status: 'idle' | 'running' | 'completed' | 'error'): void {
    const workflowStatus: WorkflowStatus = {
      currentStep,
      stepName,
      stepDescription,
      progress,
      status,
      totalSteps: this.totalSteps
    };

    this.safeSendMessage({
      type: 'workflow',
      data: workflowStatus,
      timestamp: Date.now()
    });
  }

  private async sendCurrentFiles(): Promise<void> {
    try {
      const files = await this.scanWorkDir();
      const fileMessage: FileMessage = {
        files,
        workDir: this.workDir
      };
      
      this.safeSendMessage({
        type: 'file',
        data: fileMessage,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send files:', error);
    }
  }

  private async scanWorkDir(): Promise<FileContent[]> {
    const files: FileContent[] = [];
    
    const expectedFiles = [
      { name: 'website-analysis.md', type: 'markdown' as const },
      { name: 'test-scenarios.md', type: 'markdown' as const },
      { name: 'generated-tests.spec.ts', type: 'typescript' as const },
      { name: 'test-results.json', type: 'json' as const },
      { name: 'test-config.json', type: 'json' as const }
    ];

    for (const fileInfo of expectedFiles) {
      try {
        const filePath = path.join(this.workDir, fileInfo.name);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        files.push({
          id: `file_${fileInfo.name}`,
          name: fileInfo.name,
          path: filePath,
          content,
          type: fileInfo.type,
          size: stats.size,
          lastModified: stats.mtime.getTime()
        });
      } catch (error) {
        // 文件不存在，跳过
        continue;
      }
    }
    
    return files;
  }

}