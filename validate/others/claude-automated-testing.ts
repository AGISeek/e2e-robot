/**
 * Claude Code SDK 自动化测试生成器
 * 
 * 这个脚本使用 Claude Code SDK 来完成完整的测试自动化流程：
 * 1. 打开网站并分析可交互元素
 * 2. 生成测试场景设计文档
 * 3. 生成测试代码
 * 4. 验证和修正测试代码
 */

import { query, type SDKMessage } from '@anthropic-ai/claude-code';
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs/promises';
import path from 'path';
// import * as dotenv from 'dotenv';

// dotenv.config();

interface TestScenario {
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
}

interface ElementAnalysis {
  elementType: string;
  selector: string;
  text?: string;
  attributes?: Record<string, string>;
  interactionPossibilities: string[];
}

class ClaudeAutomatedTesting {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private abortController: AbortController;
  private outputDir: string;

  constructor() {
    this.abortController = new AbortController();
    this.outputDir = path.join(process.cwd(), 'test-output');
  }

  /**
   * 初始化输出目录
   */
  private async initOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`📁 输出目录已创建: ${this.outputDir}`);
    } catch (error) {
      console.error('❌ 创建输出目录失败:', error);
      throw error;
    }
  }

  /**
   * 使用 Claude Code SDK 执行操作（带重试机制）
   */
  private async queryClaudeSDK(prompt: string, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 正在调用 Claude Code SDK... (尝试 ${attempt}/${maxRetries})`);
        console.log('📝 提示词长度:', prompt.length);
        
        const messages: SDKMessage[] = [];
        
        for await (const message of query({
          prompt: prompt,
          abortController: this.abortController,
          options: {
            maxTurns: 1,
          },
        })) {
          console.log('📨 收到消息类型:', message.type);
          messages.push(message);
        }

        console.log('📊 总消息数量:', messages.length);
        console.log('📋 消息类型分布:', messages.map(m => m.type));

        // 尝试从所有可能的消息中提取文本内容
        let extractedContent = '';
        
        messages.forEach((msg, index) => {
          console.log(`📄 消息 ${index + 1}:`, {
            type: msg.type,
            hasContent: msg.type === 'assistant' ? msg.message?.content?.length > 0 : 'N/A'
          });
          
          // 尝试从助手消息中提取内容
          if (msg.type === 'assistant' && msg.message?.content) {
            msg.message.content.forEach((content, contentIndex) => {
              console.log(`   内容 ${contentIndex + 1}:`, {
                type: content.type,
                textLength: content.type === 'text' ? content.text?.length : 'N/A'
              });
              
              if (content.type === 'text' && content.text && content.text.trim()) {
                extractedContent += content.text + '\n';
              }
            });
          }
          
          // 如果是结果类型消息，也尝试提取
          if (msg.type === 'result' && (msg as any).content) {
            console.log('📋 发现结果类型消息，尝试提取内容...');
            const resultContent = (msg as any).content;
            if (typeof resultContent === 'string') {
              extractedContent += resultContent + '\n';
            }
          }
        });

        // 清理提取的内容
        extractedContent = extractedContent.trim();
        
        if (extractedContent && extractedContent.length > 10) {
          console.log('✅ 成功提取内容，长度:', extractedContent.length);
          console.log('📝 内容预览:', extractedContent.substring(0, 200) + '...');
          return extractedContent;
        }
        
        console.warn(`⚠️ 尝试 ${attempt} 未获取到有效内容，内容长度: ${extractedContent.length}`);
        
        if (attempt < maxRetries) {
          console.log(`🔄 等待 2 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ 尝试 ${attempt} 失败:`, error);
        
        if (attempt < maxRetries) {
          console.log(`🔄 等待 3 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          throw error;
        }
      }
    }
    
    throw new Error(`经过 ${maxRetries} 次尝试后仍无法获取有效的 Claude 响应`);
  }

  /**
   * 验证生成的内容是否有效
   */
  private async validateContent(content: string, expectedType: 'json' | 'markdown' | 'code'): Promise<boolean> {
    try {
      console.log(`🔍 验证内容类型: ${expectedType}`);
      
      switch (expectedType) {
        case 'json':
          // 尝试解析 JSON
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              JSON.parse(jsonMatch[0]);
              console.log('✅ JSON 格式验证通过');
              return true;
            }
          } catch {
            console.log('⚠️ JSON 格式验证失败，尝试通过 Claude 修复...');
            return false;
          }
          break;
          
        case 'markdown':
          // 检查是否包含 Markdown 结构
          if (content.includes('#') || content.includes('##') || content.includes('```')) {
            console.log('✅ Markdown 格式验证通过');
            return true;
          }
          break;
          
        case 'code':
          // 检查是否包含代码结构
          if (content.includes('import') || content.includes('function') || content.includes('await') || content.includes('test(')) {
            console.log('✅ 代码格式验证通过');
            return true;
          }
          break;
      }
      
      console.log(`⚠️ ${expectedType} 格式验证失败`);
      return false;
    } catch (error) {
      console.error('❌ 内容验证失败:', error);
      return false;
    }
  }

  /**
   * 步骤1: 打开网站并分析可交互元素
   */
  public async openWebsiteAndAnalyze(url: string): Promise<ElementAnalysis[]> {
    try {
      console.log(`🌐 正在打开网站: ${url}`);
      
      // 启动浏览器
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
      });

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // 打开网站
      await this.page.goto(url, { waitUntil: 'networkidle' }); // networkidle is a valid Playwright option
      await this.page.waitForTimeout(3000);

      // 获取页面HTML结构
      const pageContent = await this.page.content();
      
      // 使用 Claude 分析可交互元素
      const analysisPrompt = `
你是一个专业的网页测试分析师。请分析以下 HTML 内容，识别所有可交互的元素并输出 JSON 格式的分析结果。

网站 URL: ${url}
HTML 内容: ${pageContent.substring(0, 10000)}...

请识别以下类型的可交互元素：
1. 输入框 (input, textarea)
2. 按钮 (button, input[type="submit"], input[type="button"])
3. 链接 (a)
4. 选择框 (select)
5. 复选框和单选框 (input[type="checkbox"], input[type="radio"])
6. 其他可点击元素

对每个元素，请提供以下信息：
- elementType: 元素类型
- selector: CSS 选择器
- text: 元素文本内容（如果有）
- attributes: 重要属性（如 id, class, name, placeholder 等）
- interactionPossibilities: 可能的交互操作数组

请确保返回有效的 JSON 格式，不要包含任何 markdown 标记。格式如下：
[
  {
    "elementType": "input",
    "selector": "#search-input",
    "text": "",
    "attributes": {"id": "search-input", "placeholder": "请输入搜索内容"},
    "interactionPossibilities": ["fill", "click", "focus"]
  }
]
`;

      let analysisResult = await this.queryClaudeSDK(analysisPrompt);
      
      // 验证并解析分析结果
      let elements: ElementAnalysis[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 解析尝试 ${attempts}/${maxAttempts}`);
        
        // 验证内容格式
        if (await this.validateContent(analysisResult, 'json')) {
          try {
            // 尝试从结果中提取 JSON
            const jsonMatch = analysisResult.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              elements = JSON.parse(jsonMatch[0]);
              console.log('✅ 元素分析解析成功');
              break;
            } else {
              elements = JSON.parse(analysisResult);
              console.log('✅ 元素分析解析成功');
              break;
            }
          } catch (parseError) {
            console.warn(`⚠️ 尝试 ${attempts} JSON 解析失败:`, parseError);
          }
        }
        
        if (attempts < maxAttempts) {
          console.log('🔧 使用 Claude 重新格式化结果...');
          const reformatPrompt = `
以下是网页元素分析结果，请将其转换为有效的 JSON 数组格式：

${analysisResult}

请确保返回的是有效的 JSON 数组，不包含任何解释或 markdown 标记。
格式示例：
[{"elementType": "input", "selector": "#id", "text": "", "attributes": {}, "interactionPossibilities": ["fill", "click"]}]
`;
          
          analysisResult = await this.queryClaudeSDK(reformatPrompt);
        }
      }
      
      if (elements.length === 0) {
        console.warn('⚠️ 无法解析元素分析结果，使用默认结构');
        elements = [{
          elementType: 'unknown',
          selector: 'body',
          text: 'Failed to parse elements',
          attributes: {},
          interactionPossibilities: ['click']
        }];
      }

      // 保存分析结果到文件
      const analysisFile = path.join(this.outputDir, 'element-analysis.json');
      await fs.writeFile(analysisFile, JSON.stringify(elements, null, 2), 'utf-8');
      console.log(`✅ 元素分析完成，结果已保存到: ${analysisFile}`);
      console.log(`📊 发现 ${elements.length} 个可交互元素`);

      return elements;
    } catch (error) {
      console.error('❌ 网站分析失败:', error);
      throw error;
    }
  }

  /**
   * 步骤2: 生成测试场景设计文档
   */
  public async generateTestScenarios(elements: ElementAnalysis[], url: string): Promise<TestScenario[]> {
    try {
      console.log('📝 正在生成测试场景设计文档...');

      const scenarioPrompt = `
你是一个资深的测试工程师。基于以下网站的可交互元素分析，设计全面的测试场景。

网站 URL: ${url}
可交互元素: ${JSON.stringify(elements, null, 2)}

请设计多个测试场景，包括：
1. 正常功能测试场景
2. 边界值测试场景
3. 异常情况测试场景
4. 用户体验测试场景

对每个测试场景，请提供：
- name: 测试场景名称
- description: 测试场景描述
- steps: 详细的测试步骤数组
- expectedResult: 预期结果

请确保返回有效的 JSON 格式，不要包含任何 markdown 标记。格式如下：
[
  {
    "name": "搜索功能正常流程测试",
    "description": "验证用户能够正常使用搜索功能",
    "steps": [
      "打开网站首页",
      "在搜索框中输入'测试关键词'",
      "点击搜索按钮",
      "验证搜索结果页面加载"
    ],
    "expectedResult": "搜索结果页面成功加载，显示相关搜索结果"
  }
]
`;

      let scenarioResult = await this.queryClaudeSDK(scenarioPrompt);
      
      // 验证并解析测试场景
      let scenarios: TestScenario[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && scenarios.length === 0) {
        attempts++;
        console.log(`🔄 场景解析尝试 ${attempts}/${maxAttempts}`);
        
        if (await this.validateContent(scenarioResult, 'json')) {
          try {
            const jsonMatch = scenarioResult.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              scenarios = JSON.parse(jsonMatch[0]);
              console.log('✅ 测试场景解析成功');
              break;
            } else {
              scenarios = JSON.parse(scenarioResult);
              console.log('✅ 测试场景解析成功');
              break;
            }
          } catch (parseError) {
            console.warn(`⚠️ 尝试 ${attempts} 场景解析失败:`, parseError);
          }
        }
        
        if (attempts < maxAttempts) {
          console.log('🔧 使用 Claude 重新格式化场景结果...');
          const reformatPrompt = `
以下是测试场景设计结果，请将其转换为有效的 JSON 数组格式：

${scenarioResult}

请确保返回的是有效的 JSON 数组，格式如下：
[{"name": "场景名称", "description": "描述", "steps": ["步骤1", "步骤2"], "expectedResult": "预期结果"}]
`;
          
          scenarioResult = await this.queryClaudeSDK(reformatPrompt);
        }
      }
      
      if (scenarios.length === 0) {
        console.warn('⚠️ 无法解析测试场景，使用默认场景');
        scenarios = [{
          name: '基础功能测试',
          description: '验证网站基本功能',
          steps: ['打开网站', '检查页面加载', '验证基本元素存在'],
          expectedResult: '网站正常显示，基本功能可用'
        }];
      }

      // 保存测试场景到文件
      const scenarioFile = path.join(this.outputDir, 'test-scenarios.json');
      await fs.writeFile(scenarioFile, JSON.stringify(scenarios, null, 2), 'utf-8');

      // 生成详细的设计文档
      const designDocPrompt = `
基于以下测试场景，生成详细的测试设计文档：

测试场景: ${JSON.stringify(scenarios, null, 2)}
网站 URL: ${url}

请生成一个完整的测试设计文档，包括：
1. 项目概述
2. 测试目标
3. 测试范围
4. 测试策略
5. 详细的测试场景说明
6. 风险评估
7. 测试环境要求

请使用 Markdown 格式。
`;

      const designDoc = await this.queryClaudeSDK(designDocPrompt);
      
      const designDocFile = path.join(this.outputDir, 'test-design-document.md');
      await fs.writeFile(designDocFile, designDoc, 'utf-8');
      
      console.log(`✅ 测试场景设计完成，共生成 ${scenarios.length} 个测试场景`);
      console.log(`📄 设计文档已保存到: ${designDocFile}`);

      return scenarios;
    } catch (error) {
      console.error('❌ 测试场景生成失败:', error);
      throw error;
    }
  }

  /**
   * 步骤3: 生成测试代码
   */
  public async generateTestCode(scenarios: TestScenario[], elements: ElementAnalysis[], url: string): Promise<string> {
    try {
      console.log('⚙️ 正在生成测试代码...');

      const codeGenerationPrompt = `
你是一个专业的测试自动化工程师。基于以下信息生成完整的 Playwright TypeScript 测试代码：

网站 URL: ${url}
可交互元素: ${JSON.stringify(elements, null, 2)}
测试场景: ${JSON.stringify(scenarios, null, 2)}

请生成完整的 Playwright 测试代码，要求：
1. 使用 TypeScript 语法
2. 使用 Playwright 的 @playwright/test 框架
3. 每个测试场景对应一个 test() 函数
4. 包含适当的等待和断言
5. 包含错误处理
6. 使用 Page Object 模式（如果适用）
7. 包含 beforeEach 和 afterEach 钩子
8. 代码结构清晰，注释详细

请确保代码是可执行的，不要包含任何 markdown 标记。直接返回 TypeScript 代码。
`;

      let testCode = await this.queryClaudeSDK(codeGenerationPrompt);
      
      // 验证代码内容
      if (!(await this.validateContent(testCode, 'code'))) {
        console.log('⚠️ 生成的代码格式不正确，尝试重新生成...');
        const retryPrompt = `
请生成一个简单的 Playwright TypeScript 测试代码，要求：
1. 包含 import 语句
2. 包含至少一个 test() 函数
3. 使用 page.goto() 打开网站
4. 包含基本的 expect 断言
5. 不要使用 markdown 标记，直接返回代码

示例格式：
import { test, expect } from '@playwright/test';
test('basic test', async ({ page }) => {
  await page.goto('https://www.baidu.com');
  await expect(page).toHaveTitle(/百度/);
});
`;
        testCode = await this.queryClaudeSDK(retryPrompt);
      }
      
      // 清理代码（移除可能的 markdown 标记）
      let cleanedCode = testCode
        .replace(/```typescript\s*/gi, '')
        .replace(/```javascript\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      console.log(`🧹 清理后的代码长度: ${cleanedCode.length} 字符`);

      const testCodeFile = path.join(this.outputDir, 'generated-test.spec.ts');
      await fs.writeFile(testCodeFile, cleanedCode, 'utf-8');
      
      console.log(`✅ 测试代码生成完成，已保存到: ${testCodeFile}`);

      return cleanedCode;
    } catch (error) {
      console.error('❌ 测试代码生成失败:', error);
      throw error;
    }
  }

  /**
   * 步骤4: 验证和修正测试代码
   */
  public async validateAndFixTestCode(testCode: string): Promise<string> {
    try {
      console.log('🔍 正在验证测试代码...');

      const validationPrompt = `
你是一个代码审查专家。请仔细检查以下 Playwright TypeScript 测试代码的质量和正确性：

测试代码:
${testCode}

请检查以下方面：
1. 语法正确性
2. Playwright API 使用是否正确
3. 选择器是否合理
4. 等待机制是否充分
5. 断言是否完整
6. 错误处理是否充分
7. 代码结构是否清晰
8. 是否遵循最佳实践

如果发现问题，请提供具体的修改建议。如果代码质量良好，请返回 "VALIDATION_PASSED"。

请先给出评估结果，然后如果需要修改，请提供修改后的完整代码。
`;

      const validationResult = await this.queryClaudeSDK(validationPrompt);
      
      if (validationResult.includes('VALIDATION_PASSED')) {
        console.log('✅ 测试代码验证通过');
        return testCode;
      }

      console.log('⚠️ 测试代码需要修正，正在进行修正...');
      
      // 请求修正代码
      const fixPrompt = `
基于以下验证结果和问题，请修正测试代码：

验证结果: ${validationResult}

原始代码:
${testCode}

请提供修正后的完整代码，确保：
1. 修复所有识别出的问题
2. 代码语法正确
3. 遵循 Playwright 最佳实践
4. 包含适当的注释

请直接返回修正后的完整 TypeScript 代码，不要包含 markdown 标记。
`;

      const fixedCode = await this.queryClaudeSDK(fixPrompt);
      
      // 清理修正后的代码
      let cleanedFixedCode = fixedCode
        .replace(/```typescript\s*/gi, '')
        .replace(/```javascript\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      // 保存修正后的代码
      const fixedCodeFile = path.join(this.outputDir, 'fixed-test.spec.ts');
      await fs.writeFile(fixedCodeFile, cleanedFixedCode, 'utf-8');
      
      console.log('✅ 测试代码修正完成');
      console.log(`📄 修正后的代码已保存到: ${fixedCodeFile}`);

      // 可选：进行二次验证
      console.log('🔍 进行二次验证...');
      const secondValidation = await this.queryClaudeSDK(`
请再次验证以下修正后的测试代码是否正确：

${cleanedFixedCode}

如果代码现在是正确的，请返回 "VALIDATION_PASSED"。如果仍有问题，请说明具体问题。
`);

      if (secondValidation.includes('VALIDATION_PASSED')) {
        console.log('✅ 二次验证通过');
      } else {
        console.log('⚠️ 二次验证发现问题:', secondValidation);
      }

      return cleanedFixedCode;
    } catch (error) {
      console.error('❌ 代码验证失败:', error);
      throw error;
    }
  }

  /**
   * 生成测试执行报告
   */
  public async generateTestReport(): Promise<void> {
    try {
      console.log('📊 正在生成测试报告...');

      const reportPrompt = `
请基于刚才完成的自动化测试生成过程，创建一个详细的执行报告。

报告应包括：
1. 执行摘要
2. 网站分析结果概述
3. 测试场景设计概述
4. 代码生成和验证过程
5. 发现的问题和解决方案
6. 建议和改进点
7. 下一步行动计划

请使用 Markdown 格式生成报告。
`;

      const report = await this.queryClaudeSDK(reportPrompt);
      
      const reportFile = path.join(this.outputDir, 'test-execution-report.md');
      await fs.writeFile(reportFile, report, 'utf-8');
      
      console.log(`✅ 测试报告已生成: ${reportFile}`);
    } catch (error) {
      console.error('❌ 生成测试报告失败:', error);
    }
  }

  /**
   * 关闭浏览器
   */
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      console.log('🛑 关闭浏览器...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('✅ 浏览器已关闭');
    }
  }

  /**
   * 完整的自动化测试流程
   */
  public async runCompleteWorkflow(url: string): Promise<void> {
    try {
      console.log('🚀 开始 Claude Code SDK 自动化测试生成流程...');
      console.log(`🎯 目标网站: ${url}`);

      // 初始化
      await this.initOutputDirectory();

      // 步骤1: 打开网站并分析元素
      const elements = await this.openWebsiteAndAnalyze(url);

      // 步骤2: 生成测试场景
      const scenarios = await this.generateTestScenarios(elements, url);

      // 步骤3: 生成测试代码
      const testCode = await this.generateTestCode(scenarios, elements, url);

      // 步骤4: 验证和修正代码
      const finalCode = await this.validateAndFixTestCode(testCode);
      console.log(`📝 最终代码长度: ${finalCode.length} 字符`);

      // 步骤5: 生成报告
      await this.generateTestReport();

      console.log('🎉 完整的自动化测试生成流程完成！');
      console.log(`📁 所有输出文件已保存到: ${this.outputDir}`);
      console.log('📄 生成的文件包括:');
      console.log('  - element-analysis.json (元素分析结果)');
      console.log('  - test-scenarios.json (测试场景)');
      console.log('  - test-design-document.md (设计文档)');
      console.log('  - generated-test.spec.ts (初始测试代码)');
      console.log('  - fixed-test.spec.ts (修正后的测试代码)');
      console.log('  - test-execution-report.md (执行报告)');

    } catch (error) {
      console.error('❌ 自动化测试流程失败:', error);
      throw error;
    }
  }
}

// 主函数
async function main(): Promise<void> {
  // // 检查环境变量
  // const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // if (!apiKey) {
  //   console.error('❌ 请设置 ANTHROPIC_API_KEY 环境变量');
  //   console.log('💡 使用方法: export ANTHROPIC_API_KEY="your-api-key"');
  //   process.exit(1);
  // }

  const automation = new ClaudeAutomatedTesting();
  
  try {
    // 执行完整流程
    await automation.runCompleteWorkflow('https://www.baidu.com');
    
  } catch (error) {
    console.error('❌ 自动化测试流程执行失败:', error);
  } finally {
    await automation.closeBrowser();
  }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudeAutomatedTesting };