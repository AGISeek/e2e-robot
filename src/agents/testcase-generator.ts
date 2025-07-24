/**
 * 测试用例生成代理
 * 基于测试场景生成 Playwright 测试代码
 */

import { BaseAgent, AgentResult, AgentConfig } from './types';
import { ClaudeExecutor } from './claude-executor';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TestCaseGenerator extends BaseAgent {
  private claudeExecutor: ClaudeExecutor;
  
  constructor(config: AgentConfig) {
    super(config);
    this.claudeExecutor = new ClaudeExecutor({ workDir: config.workDir });
  }
  
  /**
   * 基于测试场景生成 Playwright 测试代码
   */
  async execute(scenarioFilePath: string): Promise<AgentResult> {
    try {
      this.log('开始生成测试用例代码...');
      
      // 重置 abort controller
      this.claudeExecutor.resetAbortController();
      
      // 读取测试场景文档
      const scenarioContent = await this.readScenarioFile(scenarioFilePath);
      const prompt = this.buildTestCasePrompt(scenarioContent);
      const outputFile = 'generated-tests.spec.ts';
      
      const result = await this.claudeExecutor.executePrompt(prompt, outputFile);
      
      return {
        success: true,
        data: { 
          testFile: path.join(this.config.workDir, outputFile),
          content: result 
        },
        filePath: outputFile
      };
      
    } catch (error) {
      this.logError(`测试用例生成失败: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private async readScenarioFile(filePath: string): Promise<string> {
    // 尝试多个可能的文件位置
    const possiblePaths = [
      path.isAbsolute(filePath) ? filePath : path.join(this.config.workDir, filePath),
      path.join(process.cwd(), filePath),
      filePath
    ];
    
    for (const fullPath of possiblePaths) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        console.log(`📖 成功读取场景文件: ${fullPath}`);
        return content;
      } catch {
        // 继续尝试下一个路径
      }
    }
    
    throw new Error(`无法在任何位置找到场景文件 ${filePath}`);
  }
  
  private buildTestCasePrompt(scenarioContent: string): string {
    return `请基于测试场景设计文档生成 Playwright 测试代码，然后使用 Write 工具保存结果。

**重要：请必须使用 Write 工具将测试代码保存到 claude-agents-output/generated-tests.spec.ts 文件。**

=== 测试场景设计文档 ===
${scenarioContent}

任务步骤：
1. 仔细阅读测试场景设计文档
2. 将每个测试场景转换为对应的 Playwright TypeScript 测试代码
3. **使用 Write 工具将测试代码保存到 claude-agents-output/generated-tests.spec.ts 文件**

代码要求：
1. 使用 @playwright/test 框架
2. 每个场景对应一个 test() 函数
3. 包含适当的等待和断言
4. 添加详细的注释说明
5. 使用稳定可靠的选择器策略
6. 包含错误处理

代码结构示例：
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('网站功能测试', () => {
  test('场景1: 基础功能验证', async ({ page }) => {
    // 测试步骤实现
    await page.goto('网站URL');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/预期标题/);
    
    // 其他测试步骤...
  });
  
  test('场景2: 用户交互测试', async ({ page }) => {
    // 根据场景文档实现具体测试逻辑
  });
});
\`\`\`

**请确保使用 Write 工具将完整的测试代码保存到 claude-agents-output/generated-tests.spec.ts**

要求：
1. 代码语法正确，可以直接运行
2. 包含所有必要的导入语句
3. 每个测试都有清晰的描述
4. 基于场景文档中的具体步骤编写代码
5. 使用合理的元素选择器和等待机制`;
  }
}