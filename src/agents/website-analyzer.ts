/**
 * 网站分析代理
 * 使用 Claude Code 通过 Playwright MCP 分析网站
 */

import { BaseAgent, AgentResult, AgentConfig } from './types.js';
import { ClaudeExecutor } from './claude-executor.js';
import * as path from 'path';

export class WebsiteAnalyzer extends BaseAgent {
  private claudeExecutor: ClaudeExecutor;
  
  constructor(config: AgentConfig) {
    super(config);
    this.claudeExecutor = new ClaudeExecutor({ workDir: config.workDir });
  }
  
  /**
   * 分析指定网站并生成分析报告
   */
  async execute(url: string): Promise<AgentResult> {
    try {
      this.log(`开始分析网站: ${url}`);
      
      // 重置 abort controller 确保新的查询
      this.claudeExecutor.resetAbortController();
      const outputFile = 'website-analysis.md';

      const prompt = this.buildAnalysisPrompt(url);
      
      const result = await this.claudeExecutor.executePrompt(prompt, outputFile);
      
      return {
        success: true,
        data: { 
          url, 
          analysisFile: path.join(this.config.workDir, outputFile),
          content: result 
        },
        filePath: outputFile
      };
      
    } catch (error) {
      this.logError(`网站分析失败: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private buildAnalysisPrompt(url: string): string {
    return `请分析网站 ${url} 并**必须使用 Write 工具**将分析结果保存到文件。

**关键要求：**
1. 分析完网站后，必须调用 Write 工具
2. 文件名必须是：website-analysis.md
3. 文件路径必须是：claude-agents-output/website-analysis.md
4. 不要只是描述，必须真正使用 Write 工具保存文件到指定目录

任务步骤：
1. 访问或分析网站 ${url}
2. 分析页面结构，识别所有可交互元素（输入框、按钮、链接、表单等）
3. 记录页面的基本信息（标题、URL、主要内容区域）
4. 分析用户可能的交互路径和操作场景
5. **使用 Write 工具将分析结果保存到 claude-agents-output/website-analysis.md 文件**

文件内容格式：
# 网站分析报告

## 基本信息
- 网站URL: ${url}
- 分析时间: [当前时间]
- 页面标题: [页面标题]

## 页面结构
[描述页面的整体布局和主要区域]

## 可交互元素分析
[详细列出所有重要的可交互元素，包括：
- 输入框（ID、类名、占位符文本）
- 按钮（文本、ID、类名）  
- 链接（文本、目标）
- 表单元素等]

## 用户操作场景
[分析用户可能的操作路径和使用场景，包括：
- 主要功能流程
- 常见用户操作
- 关键交互点]

## 测试建议
[基于分析结果，提出具体的测试重点和建议]

**请确保使用 Write 工具将完整的分析报告保存到 claude-agents-output/website-analysis.md**`;
  }
}