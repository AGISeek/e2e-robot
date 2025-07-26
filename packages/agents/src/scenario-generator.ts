/**
 * 测试场景生成代理
 * 基于网站分析结果生成测试场景文档
 */

import { BaseAgent, AgentResult, AgentConfig } from '@e2e-robot/core';
import { ClaudeExecutor } from './claude-executor';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ScenarioGenerator extends BaseAgent {
  private claudeExecutor: ClaudeExecutor;
  
  constructor(config: AgentConfig) {
    super(config);
    this.claudeExecutor = new ClaudeExecutor({ workDir: config.workDir });
  }
  
  /**
   * 基于网站分析结果生成测试场景
   */
  async execute(analysisFilePath: string, testConfig?: any): Promise<AgentResult> {
    try {
      this.log('开始生成测试场景...');
      
      // 重置 abort controller
      this.claudeExecutor.resetAbortController();
      
      // 读取网站分析结果
      const analysisContent = await this.readAnalysisFile(analysisFilePath);
      const prompt = this.buildScenarioPrompt(analysisContent, testConfig);
      const outputFile = 'test-scenarios.md';
      
      const result = await this.claudeExecutor.executePrompt(prompt, outputFile);
      
      return {
        success: true,
        data: { 
          scenarioFile: path.join(this.config.workDir, outputFile),
          content: result 
        },
        filePath: outputFile
      };
      
    } catch (error) {
      this.logError(`测试场景生成失败: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private async readAnalysisFile(filePath: string): Promise<string> {
    // 尝试多个可能的文件位置
    const possiblePaths = [
      path.isAbsolute(filePath) ? filePath : path.join(this.config.workDir, filePath),
      path.join(process.cwd(), filePath),
      filePath
    ];
    
    for (const fullPath of possiblePaths) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        console.log(`📖 成功读取分析文件: ${fullPath}`);
        return content;
      } catch {
        // 继续尝试下一个路径
      }
    }
    
    throw new Error(`无法在任何位置找到分析文件 ${filePath}`);
  }
  
  private buildScenarioPrompt(analysisContent: string, testConfig?: any): string {
    let configSection = '';
    
    if (testConfig) {
      configSection = `
=== 用户配置的测试要求 ===
**目标网站**: ${testConfig.targetUrl}
**站点名称**: ${testConfig.siteName}
**最大测试用例数**: ${testConfig.maxTestCases}
**测试优先级**: ${testConfig.priority}

**具体测试要求**:
${testConfig.testRequirements.map((req: string, index: number) => `${index + 1}. ${req}`).join('\n')}

**测试类型**:
${testConfig.testTypes.map((type: string) => {
  const typeNames: {[key: string]: string} = {
    'functional': '功能测试',
    'ux': '用户体验测试', 
    'responsive': '响应式测试',
    'performance': '性能测试',
    'compatibility': '兼容性测试',
    'security': '安全测试'
  };
  return `- ${typeNames[type] || type}`;
}).join('\n')}

`;
    }

    return `请基于网站分析报告和用户配置要求设计测试场景，然后使用 Write 工具保存结果。

**重要：请必须使用 Write 工具将测试场景保存到 claude-agents-output/test-scenarios.md 文件。**
${configSection}
=== 网站分析报告 ===
${analysisContent}

任务步骤：
1. 仔细阅读网站分析报告和用户配置要求
2. 根据用户指定的测试要求和测试类型设计针对性测试场景
3. **使用 Write 工具将测试场景保存到 claude-agents-output/test-scenarios.md 文件**

文件内容格式：
# 测试场景设计文档

## 测试目标
[基于网站功能定义的具体测试目标]

## 测试策略
[测试的整体策略和方法]

## 核心功能测试场景

### 场景1: [场景名称]
- **描述**: [详细的场景描述]
- **前置条件**: [测试前的准备条件]
- **测试步骤**:
  1. [具体可执行的步骤1]
  2. [具体可执行的步骤2]
  3. [具体可执行的步骤3]
- **预期结果**: [明确的期望结果]
- **优先级**: [高/中/低]

### 场景2: [场景名称]
[按相同格式继续...]

## 用户体验测试场景
[重点关注用户交互和体验的测试场景]

## 边界和异常测试场景
[异常情况和边界值的测试场景]

## 性能和兼容性测试场景
[性能和兼容性相关的测试场景]

**请确保使用 Write 工具将完整的测试场景文档保存到 claude-agents-output/test-scenarios.md**

要求：
1. 每个测试场景都基于分析报告中的实际元素和功能
2. 测试步骤具体可执行，包含明确的操作和验证点
3. 场景覆盖主要功能、边界情况和异常处理`;
  }
}