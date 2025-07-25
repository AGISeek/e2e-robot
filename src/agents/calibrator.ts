/**
 * 校准代理
 * 根据成功执行的测试用例回顾测试场景和网站分析文档，进行校准优化
 */

import { BaseAgent, AgentResult, AgentConfig } from './types';
import { ClaudeExecutor } from './claude-executor';
import * as fs from 'fs/promises';
import * as path from 'path';

export class Calibrator extends BaseAgent {
  private claudeExecutor: ClaudeExecutor;
  
  constructor(config: AgentConfig) {
    super(config);
    this.claudeExecutor = new ClaudeExecutor({
      workDir: config.workDir,
      timeout: config.timeout || 600000
    });
  }
  
  /**
   * 执行校准过程
   * 基于成功的测试结果回顾和优化前面的步骤
   */
  async execute(testResultsPath: string): Promise<AgentResult> {
    try {
      this.log('开始校准过程...');
      
      // 读取测试结果
      const testResults = await this.readTestResults(testResultsPath);
      
      if (!testResults.success) {
        return {
          success: false,
          error: '测试未成功，无法进行校准'
        };
      }
      
      // 读取相关文件
      const analysisFile = path.join(this.config.workDir, 'website-analysis.md');
      const scenarioFile = path.join(this.config.workDir, 'test-scenarios.md');
      const testCaseFile = path.join(this.config.workDir, 'generated-tests.spec.ts');
      
      const [analysisContent, scenarioContent, testCaseContent] = await Promise.all([
        this.readFileIfExists(analysisFile),
        this.readFileIfExists(scenarioFile),
        this.readFileIfExists(testCaseFile)
      ]);
      
      // 执行校准分析
      const calibrationResult = await this.performCalibration({
        testResults,
        analysisContent,
        scenarioContent,
        testCaseContent
      });
      
      // 保存校准报告
      await this.saveCalibrationReport(calibrationResult);
      
      return {
        success: true,
        data: calibrationResult,
        filePath: 'calibration-report.md'
      };
      
    } catch (error) {
      this.logError(`校准过程失败: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * 读取测试结果文件
   */
  private async readTestResults(testResultsPath: string): Promise<any> {
    const fullPath = path.isAbsolute(testResultsPath) ? testResultsPath : path.join(this.config.workDir, testResultsPath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`无法读取测试结果文件: ${fullPath}`);
    }
  }
  
  /**
   * 读取文件（如果存在）
   */
  private async readFileIfExists(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }
  
  /**
   * 执行校准分析
   */
  private async performCalibration(data: {
    testResults: any;
    analysisContent: string | null;
    scenarioContent: string | null;
    testCaseContent: string | null;
  }): Promise<any> {
    this.log('使用 Claude 进行校准分析...');
    
    const calibrationPrompt = this.buildCalibrationPrompt(data);
    
    // 重置 Claude Executor
    this.claudeExecutor.resetAbortController();
    
    // 执行校准分析
    const response = await this.claudeExecutor.executePrompt(
      calibrationPrompt,
      'calibration-report.md'
    );
    
    return {
      response,
      timestamp: new Date().toISOString(),
      testSuccess: data.testResults.success,
      attempts: data.testResults.attempts,
      fixedIssues: data.testResults.fixedIssues
    };
  }
  
  /**
   * 构建校准提示词
   */
  private buildCalibrationPrompt(data: {
    testResults: any;
    analysisContent: string | null;
    scenarioContent: string | null;
    testCaseContent: string | null;
  }): string {
    return `请根据成功执行的测试用例结果，对之前的网站分析和测试场景进行校准和优化。

## 测试执行结果
执行状态: ${data.testResults.success ? '✅ 成功' : '❌ 失败'}
尝试次数: ${data.testResults.attempts || 1}
执行时间: ${data.testResults.timestamp}
${data.testResults.fixedIssues ? `自动修复的问题: ${data.testResults.fixedIssues}` : ''}

执行详情:
\`\`\`
${data.testResults.details || data.testResults.rawOutput || '无详细信息'}
\`\`\`

## 原始网站分析
${data.analysisContent ? `\`\`\`markdown
${data.analysisContent}
\`\`\`` : '❌ 网站分析文件不存在'}

## 原始测试场景
${data.scenarioContent ? `\`\`\`markdown
${data.scenarioContent}
\`\`\`` : '❌ 测试场景文件不存在'}

## 实际执行的测试用例
${data.testCaseContent ? `\`\`\`typescript
${data.testCaseContent}
\`\`\`` : '❌ 测试用例文件不存在'}

## 校准任务

请基于实际测试执行的结果，分析并提供以下校准建议：

### 1. 网站分析校准
- 分析实际测试中发现的网站特征与原始分析的差异
- 识别遗漏的重要元素或交互方式
- 评估元素选择器的准确性和稳定性
- 建议改进网站分析的方法和重点

### 2. 测试场景校准
- 评估测试场景的覆盖度和实用性
- 分析哪些场景在实际执行中最有效
- 识别可能遗漏的重要测试场景
- 建议优化测试场景的优先级和步骤

### 3. 测试用例质量评估
- 分析测试用例的稳定性和可靠性
- 评估选择器策略的有效性
- 识别可能的脆弱点和改进机会
- 建议增强测试用例的健壮性

### 4. 自动化流程优化
${data.testResults.fixedIssues ? `- 分析自动修复机制的有效性
- 总结常见问题类型和解决方案
- 建议预防性措施` : '- 评估测试执行的稳定性'}
- 建议改进整体自动化流程

### 5. 未来改进建议
- 基于实际执行经验的改进建议
- 新的测试场景或功能建议
- 技术栈或方法论的优化建议

请生成详细的校准报告，并使用 Write 工具保存到 ${path.join(this.config.workDir, 'calibration-report.md')}

报告应该结构清晰，包含具体的建议和行动项。`;
  }
  
  /**
   * 保存校准报告
   */
  private async saveCalibrationReport(calibrationResult: any): Promise<void> {
    const reportPath = path.join(this.config.workDir, 'calibration-report.md');
    
    // 检查 Claude 是否已经使用工具保存了报告
    try {
      await fs.access(reportPath);
      this.log(`✅ 校准报告已由 Claude 保存: ${reportPath}`);
      return;
    } catch {
      // 如果 Claude 没有保存，我们手动保存
      this.log('Claude 未使用工具保存报告，手动生成报告...');
    }
    
    const reportContent = `# 测试执行校准报告

## 校准概要
- **校准时间**: ${calibrationResult.timestamp}
- **基于测试**: ${calibrationResult.testSuccess ? '✅ 成功执行' : '❌ 失败执行'}
- **测试尝试次数**: ${calibrationResult.attempts}
- **是否有自动修复**: ${calibrationResult.fixedIssues ? '是' : '否'}

## Claude 校准分析结果

${calibrationResult.response}

---
*由 Claude Code Agents 校准系统自动生成*
`;

    await fs.writeFile(reportPath, reportContent, 'utf-8');
    this.log(`📋 校准报告已保存: ${reportPath}`);
  }
}