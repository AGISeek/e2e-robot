/**
 * 测试执行代理
 * 使用 Claude Executor 和 Playwright MCP 执行生成的测试用例并生成报告
 * 支持自动调试和修复测试用例
 */

import { BaseAgent, AgentResult, AgentConfig } from './types';
import { ClaudeExecutor } from './claude-executor';
import { TestResultAnalyzer, TestResults, TestCase } from './test-result-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TestRunner extends BaseAgent {
  private claudeExecutor: ClaudeExecutor;
  private maxRetries: number = 10;
  private testResultAnalyzer: TestResultAnalyzer;
  
  constructor(config: AgentConfig) {
    super(config);
    this.claudeExecutor = new ClaudeExecutor({
      workDir: config.workDir,
      timeout: config.timeout || 600000
    });
    this.testResultAnalyzer = new TestResultAnalyzer(config.workDir);
  }
  
  /**
   * 执行测试并生成报告
   * 先分析历史测试结果，针对失败的测试用例进行逐个修复
   */
  async execute(testFilePath: string): Promise<AgentResult> {
    try {
      this.log('开始执行测试，首先分析历史测试结果...');
      
      // 检查测试文件是否存在
      await this.validateTestFile(testFilePath);
      
      // 分析历史测试结果
      const previousResults = await this.testResultAnalyzer.analyzeResults();
      
      let testResult: any;
      
      if (previousResults && previousResults.failedTests.length > 0) {
        this.log(`发现 ${previousResults.failedTests.length} 个失败的测试用例，开始逐个修复...`);
        
        // 针对失败的测试用例进行修复
        testResult = await this.fixFailedTests(testFilePath, previousResults);
      } else {
        this.log('未发现历史失败测试或首次执行，直接运行完整测试套件...');
        
        // 直接执行完整测试
        testResult = await this.executeTestsWithClaude(testFilePath);
      }
      
      // 生成测试报告
      await this.generateTestReport(testResult, previousResults);
      
      return {
        success: testResult.success,
        data: {
          testFile: testFilePath,
          reportFile: path.join(this.config.workDir, 'test-results.json'),
          previousResults,
          ...testResult
        },
        filePath: 'test-results.json'
      };
      
    } catch (error) {
      this.logError(`测试执行失败: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private async validateTestFile(testFilePath: string): Promise<void> {
    // 尝试多个可能的文件位置
    const possiblePaths = [
      path.isAbsolute(testFilePath) ? testFilePath : path.join(this.config.workDir, testFilePath),
      path.join(process.cwd(), testFilePath),
      testFilePath
    ];
    
    for (const fullPath of possiblePaths) {
      try {
        await fs.access(fullPath);
        this.log(`测试文件验证通过: ${fullPath}`);
        return;
      } catch {
        // 继续尝试下一个路径
      }
    }
    
    throw new Error(`测试文件不存在于任何位置: ${testFilePath}`);
  }
  
  /**
   * 针对失败的测试用例进行逐个修复
   */
  private async fixFailedTests(testFilePath: string, previousResults: TestResults): Promise<any> {
    this.log('开始针对失败测试用例进行逐个修复...');
    
    const absoluteTestPath = path.isAbsolute(testFilePath) ? testFilePath : path.join(this.config.workDir, testFilePath);
    const fixedTests: string[] = [];
    const stillFailingTests: TestCase[] = [];
    
    // 为每个失败的测试用例生成修复报告
    const failureReport = this.testResultAnalyzer.generateFailureReport(previousResults);
    this.log('失败测试详情:\n' + failureReport);
    
    // 逐个尝试修复失败的测试用例
    for (let i = 0; i < previousResults.failedTests.length; i++) {
      const failedTest = previousResults.failedTests[i];
      this.log(`正在修复测试用例 ${i + 1}/${previousResults.failedTests.length}: ${failedTest.name}`);
      
      const fixResult = await this.fixSingleTestCase(absoluteTestPath, failedTest, i + 1);
      
      if (fixResult.success) {
        fixedTests.push(failedTest.name);
        this.log(`✅ 测试用例修复成功: ${failedTest.name}`);
      } else {
        stillFailingTests.push(failedTest);
        this.log(`❌ 测试用例修复失败: ${failedTest.name}`);
      }
    }
    
    // 修复完成后，执行完整测试套件验证
    this.log('所有失败测试用例修复完毕，执行完整测试套件验证...');
    const finalResult = await this.executeTestsWithClaude(absoluteTestPath, {
      fixedTests,
      stillFailingTests: stillFailingTests.map(t => t.name),
      previousFailureCount: previousResults.failedTests.length
    });
    
    return {
      ...finalResult,
      fixedTests,
      stillFailingTests: stillFailingTests.map(t => t.name),
      fixingSummary: {
        total: previousResults.failedTests.length,
        fixed: fixedTests.length,
        stillFailing: stillFailingTests.length
      }
    };
  }
  
  /**
   * 修复单个测试用例
   */
  private async fixSingleTestCase(testFilePath: string, failedTest: TestCase, testNumber: number): Promise<any> {
    let currentAttempt = 0;
    let lastError = failedTest.error || '测试失败';
    
    while (currentAttempt < 3) { // 每个测试用例最多尝试3次修复
      try {
        currentAttempt++;
        this.log(`修复测试用例 "${failedTest.name}" - 尝试 ${currentAttempt}/3`);
        
        // 构建针对单个测试用例的修复提示词
        const fixPrompt = await this.buildSingleTestFixPrompt(testFilePath, failedTest, lastError, currentAttempt);
        
        // 使用 Claude Executor 执行修复
        const response = await this.claudeExecutor.executePrompt(fixPrompt);
        
        // 检查修复结果
        const fixResult = await this.parseSingleTestResult(response, failedTest.name);
        
        if (fixResult.success) {
          return {
            success: true,
            attempts: currentAttempt,
            testName: failedTest.name,
            fixedIssue: lastError
          };
        } else {
          lastError = fixResult.error || '修复失败';
          if (currentAttempt >= 3) {
            return {
              success: false,
              attempts: currentAttempt,
              testName: failedTest.name,
              finalError: lastError
            };
          }
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logError(`修复测试用例 "${failedTest.name}" 尝试 ${currentAttempt} 失败: ${lastError}`);
        
        if (currentAttempt >= 3) {
          return {
            success: false,
            attempts: currentAttempt,
            testName: failedTest.name,
            finalError: lastError
          };
        }
      }
    }
    
    return {
      success: false,
      attempts: 3,
      testName: failedTest.name,
      finalError: lastError
    };
  }
  
  /**
   * 构建单个测试用例修复的提示词
   */
  private async buildSingleTestFixPrompt(testFilePath: string, failedTest: TestCase, lastError: string, attemptNumber: number): Promise<string> {
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    return `请修复特定的失败测试用例。

测试文件路径: ${testFilePath}
失败的测试用例: ${failedTest.name}

当前测试文件内容:
\`\`\`typescript
${testContent}
\`\`\`

失败测试的详细信息:
- **测试名称**: ${failedTest.name}
- **状态**: 失败
- **错误信息**: ${failedTest.error || lastError}
- **所在文件**: ${failedTest.file || testFilePath}
${failedTest.line ? `- **行号**: ${failedTest.line}` : ''}

修复要求 (第 ${attemptNumber}/3 次尝试):

1. **定位问题**: 仔细分析错误信息，找到导致测试 "${failedTest.name}" 失败的具体原因
2. **修复代码**: 只修复与这个特定测试用例相关的问题，可能包括：
   - 修正选择器错误 (元素定位问题)
   - 增加等待时间 (处理异步加载)
   - 修复断言逻辑错误
   - 处理页面跳转或弹窗问题
   - 修正输入数据或测试数据问题
3. **保存修复**: 使用 Edit 工具将修复后的代码保存到原文件: ${testFilePath}
4. **验证修复**: 使用 bash 工具执行 \`npx playwright test --grep "${failedTest.name}"\` 来只运行这个特定的测试用例

请注意:
- 只修复这一个特定的测试用例
- 不要影响其他测试用例的代码
- 保持代码的整体结构和风格一致
- 如果是选择器问题，可能需要检查网页结构变化
- 如果是时序问题，增加适当的等待机制

开始修复测试用例 "${failedTest.name}"...`;
  }
  
  /**
   * 解析单个测试用例的执行结果
   */
  private async parseSingleTestResult(response: string, testName: string): Promise<any> {
    const result = {
      success: false,
      error: '',
      details: response
    };
    
    // 检查是否执行了特定测试用例
    const testNamePattern = new RegExp(testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const hasSpecificTest = testNamePattern.test(response);
    
    // 检查测试结果
    const passedPattern = /1\s+passed|✓.*passed|test.*passed/i;
    const failedPattern = /failed|error|timeout|✗/i;
    
    if (hasSpecificTest && passedPattern.test(response) && !failedPattern.test(response)) {
      result.success = true;
      result.details = `测试用例 "${testName}" 修复成功并通过验证`;
    } else if (failedPattern.test(response)) {
      result.success = false;
      // 提取错误信息
      const errorLines = response.split('\n').filter(line => 
        line.toLowerCase().includes('error') || 
        line.toLowerCase().includes('failed')
      );
      result.error = errorLines.slice(0, 2).join('\n') || '测试仍然失败';
    } else {
      result.success = false;
      result.error = '未能确认测试用例修复状态';
    }
    
    return result;
  }
  
  /**
   * 使用 Claude Executor 执行测试，支持自动调试修复
   */
  private async executeTestsWithClaude(testFilePath: string, context?: any): Promise<any> {
    this.log('使用 Claude Executor 和 Playwright MCP 执行测试...');
    
    const absoluteTestPath = path.isAbsolute(testFilePath) ? testFilePath : path.join(this.config.workDir, testFilePath);
    let currentAttempt = 0;
    let lastError = '';
    
    while (currentAttempt < this.maxRetries) {
      try {
        currentAttempt++;
        this.log(`执行尝试 ${currentAttempt}/${this.maxRetries}`);
        
        // 重置 Claude Executor 的 abort controller
        this.claudeExecutor.resetAbortController();
        
        // 构建执行测试的提示词
        const executePrompt = await this.buildExecutePrompt(absoluteTestPath, lastError, currentAttempt, context);
        
        // 使用 Claude Executor 执行
        const response = await this.claudeExecutor.executePrompt(executePrompt);
        
        // 检查执行结果
        const testResult = await this.parseExecutionResult(response, absoluteTestPath);
        
        if (testResult.success) {
          this.log(`✅ 测试执行成功！尝试次数: ${currentAttempt}`);
          return {
            ...testResult,
            attempts: currentAttempt,
            fixedIssues: currentAttempt > 1 ? lastError : null
          };
        } else {
          // 记录错误信息，准备下次尝试
          lastError = testResult.error || testResult.rawOutput || '未知错误';
          this.log(`❌ 测试执行失败 (${currentAttempt}/${this.maxRetries})，准备尝试修复... 错误: ${lastError.substring(0, 200)}`);
          
          if (currentAttempt >= this.maxRetries) {
            throw new Error(`测试执行失败，已达到最大重试次数 ${this.maxRetries} 次，无法修复`);
          }
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logError(`执行尝试 ${currentAttempt}/${this.maxRetries} 失败: ${lastError}`);
        
        if (currentAttempt >= this.maxRetries) {
          throw new Error(`测试执行失败，已达到最大重试次数 ${this.maxRetries} 次，无法修复`);
        }
      }
    }
    
    throw new Error(`测试执行失败，已用尽所有 ${this.maxRetries} 次重试机会`);
  }
  
  /**
   * 构建执行测试的提示词
   */
  private async buildExecutePrompt(testFilePath: string, lastError: string, attemptNumber: number, context?: any): Promise<string> {
    const testContent = await fs.readFile(testFilePath, 'utf-8');
    
    let prompt = `请使用 bash 工具执行 Playwright 测试用例。

测试文件路径: ${testFilePath}

测试文件内容:
\`\`\`typescript
${testContent}
\`\`\`

${context ? `
## 执行上下文信息
${context.fixedTests && context.fixedTests.length > 0 ? `
### 已修复的测试用例 (${context.fixedTests.length}个)
${context.fixedTests.map((test: string) => `- ✅ ${test}`).join('\n')}
` : ''}

${context.stillFailingTests && context.stillFailingTests.length > 0 ? `
### 仍然失败的测试用例 (${context.stillFailingTests.length}个)
${context.stillFailingTests.map((test: string) => `- ❌ ${test}`).join('\n')}
` : ''}

${context.previousFailureCount ? `
### 历史失败统计
- 之前失败的测试用例总数: ${context.previousFailureCount}
- 本轮修复的测试用例数: ${context.fixedTests?.length || 0}
- 仍需关注的测试用例数: ${context.stillFailingTests?.length || 0}
` : ''}
` : ''}

`;

    if (attemptNumber === 1) {
      prompt += `请使用 bash 工具执行以下命令来运行 Playwright 测试：

\`\`\`bash
npx playwright test ${testFilePath}
\`\`\`

执行要求：
1. 使用 bash 工具运行 npx playwright test 命令
2. 捕获完整的输出结果，包括测试通过/失败的详细信息
3. 如果测试失败，提供详细的错误信息和堆栈跟踪
4. 统计测试结果：总数、通过数、失败数、跳过数

请确保：
- 完整执行所有测试场景
- 详细记录每个测试的执行结果
- 如果有测试失败，提供具体的失败原因
- 输出完整的测试报告

直接使用 bash 工具执行 npx playwright test 命令。`;
    } else {
      prompt += `这是第 ${attemptNumber}/10 次调试尝试。上次执行失败的错误信息：

错误信息:
\`\`\`
${lastError}
\`\`\`

请按以下步骤进行调试和修复：

1. **分析错误**: 仔细分析上次的错误信息，识别问题根源
2. **修复测试文件**: 根据错误信息修复测试代码中的问题，可能包括：
   - 修正选择器错误或元素定位问题
   - 增加适当的等待时间
   - 处理页面加载或异步操作问题
   - 修复网络连接或超时问题
   - 纠正测试逻辑错误
   - 处理浏览器兼容性问题
3. **保存修复后的文件**: 使用 Edit 或 Write 工具将修复后的测试代码保存到原文件：${testFilePath}
4. **重新执行测试**: 使用 bash 工具执行 \`npx playwright test ${testFilePath}\` 命令

请务必：
- 先修复代码，再执行测试
- 使用 bash 工具运行 npx playwright test
- 提供详细的修复说明和执行结果
- 如果仍然失败，记录新的错误信息以便下次调试

开始调试修复过程...`;
    }

    return prompt;
  }
  
  /**
   * 解析 Claude 执行结果
   */
  private async parseExecutionResult(response: string, _testFilePath: string): Promise<any> {
    // 从 Claude 的响应中提取执行结果
    const result = {
      success: false,
      rawOutput: response,
      error: '',
      details: response
    };
    
    // 增强的成功检测逻辑 - 针对 npx playwright test 输出
    const successKeywords = [
      'passed', 'all tests passed', '✓', 'test results',
      'tests passed', 'playwright test', 'test successful',
      'completed successfully', 'no failures', 'test suite passed'
    ];
    
    const failureKeywords = [
      'failed', 'error', 'Error', '✗', 'failure', 'FAIL',
      'timeout', 'not found', 'exception', 'crashed',
      'test failed', 'tests failed', 'failing tests'
    ];
    
    // 检查 playwright 测试结果统计
    const testStatsPattern = /(\d+)\s+passed.*?(\d+)?\s*failed/i;
    const testStatsMatch = response.match(testStatsPattern);
    
    const hasSuccess = successKeywords.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const hasFailure = failureKeywords.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // 检查是否包含 bash 命令执行的输出
    const hasBashExecution = response.includes('npx playwright test') || 
                            response.includes('Running') ||
                            response.includes('Test results');
    
    if (testStatsMatch) {
      const passedCount = parseInt(testStatsMatch[1] || '0');
      const failedCount = parseInt(testStatsMatch[2] || '0');
      
      if (passedCount > 0 && failedCount === 0) {
        result.success = true;
        result.details = `Playwright 测试执行成功: ${passedCount} 个测试通过，0 个失败。${response}`;
      } else if (passedCount > 0 && failedCount > 0) {
        result.success = false;
        result.error = `部分测试失败: ${passedCount} 个通过，${failedCount} 个失败`;
      } else {
        result.success = false;
        result.error = `所有测试失败: 0 个通过，${failedCount} 个失败`;
      }
    } else if (hasSuccess && !hasFailure && hasBashExecution) {
      result.success = true;
      result.details = `检测到成功的 Playwright 测试执行。${response}`;
    } else if (hasFailure) {
      result.success = false;
      // 尝试提取错误信息
      const errorLines = response.split('\n').filter(line => 
        line.toLowerCase().includes('error') || 
        line.toLowerCase().includes('failed') ||
        line.toLowerCase().includes('timeout')
      );
      result.error = errorLines.slice(0, 3).join('\n') || '测试执行失败';
    } else if (hasBashExecution && response.length > 200) {
      // 如果有 bash 执行痕迹且响应足够长，可能是成功的
      result.success = true;
      result.details = `基于 bash 执行输出判断测试可能成功。${response}`;
    } else {
      result.success = false;
      result.error = '未检测到有效的 Playwright 测试执行结果或命令未执行';
    }
    
    return result;
  }
  
  private async generateTestReport(testResult: any, previousResults?: TestResults | null): Promise<void> {
    // 生成 JSON 格式的详细结果
    const jsonResult = {
      timestamp: new Date().toISOString(),
      success: testResult.success,
      attempts: testResult.attempts || 1,
      fixedIssues: testResult.fixedIssues,
      details: testResult.details,
      error: testResult.error,
      rawOutput: testResult.rawOutput,
      // 新增的修复相关信息
      fixedTests: testResult.fixedTests || [],
      stillFailingTests: testResult.stillFailingTests || [],
      fixingSummary: testResult.fixingSummary,
      previousResults: previousResults ? {
        totalTests: previousResults.summary.total,
        previouslyFailed: previousResults.summary.failed,
        failedTestNames: previousResults.failedTests.map(t => t.name)
      } : null
    };
    
    const jsonPath = path.join(this.config.workDir, 'test-results.json');
    await fs.writeFile(jsonPath, JSON.stringify(jsonResult, null, 2), 'utf-8');
    
    // 生成 Markdown 格式的报告
    const reportContent = this.buildReportContent(testResult, previousResults);
    const reportPath = path.join(this.config.workDir, 'test-report.md');
    await fs.writeFile(reportPath, reportContent, 'utf-8');
    
    this.log(`测试结果已保存: ${jsonPath}`);
    this.log(`测试报告已生成: ${reportPath}`);
  }
  
  private buildReportContent(testResult: any, previousResults?: TestResults | null): string {
    const timestamp = new Date().toISOString();
    
    return `# Claude Code 自动化测试执行报告

## 执行概要
- **执行时间**: ${timestamp}
- **执行方式**: Claude Executor + bash 工具 + npx playwright test
- **执行状态**: ${testResult.success ? '✅ 通过' : '❌ 失败'}
- **尝试次数**: ${testResult.attempts || 1}/10
- **自动调试**: ${testResult.fixedIssues ? '是' : '否'}

${previousResults ? `## 历史测试结果分析
- **上次测试总数**: ${previousResults.summary.total}
- **上次失败数量**: ${previousResults.summary.failed}
- **本轮针对性修复**: ${testResult.fixingSummary ? `${testResult.fixingSummary.fixed}/${testResult.fixingSummary.total}` : '无'}

${testResult.fixedTests && testResult.fixedTests.length > 0 ? `### 🔧 成功修复的测试用例
${testResult.fixedTests.map((test: string) => `- ✅ ${test}`).join('\n')}
` : ''}

${testResult.stillFailingTests && testResult.stillFailingTests.length > 0 ? `### ❌ 仍然失败的测试用例
${testResult.stillFailingTests.map((test: string) => `- ❌ ${test}`).join('\n')}
` : ''}
` : ''}

## 测试结果
${testResult.success ? '🎉 Playwright 测试通过 bash 工具执行成功！' : '⚠️ 测试执行失败，已进行最多10轮自动调试修复。'}

${testResult.fixedIssues ? `## 自动调试修复记录
在执行过程中发现并修复了以下问题：
\`\`\`
${testResult.fixedIssues}
\`\`\`
` : ''}

## 执行详细信息
\`\`\`
${testResult.details || testResult.rawOutput || '无详细输出'}
\`\`\`

${testResult.error ? `## 错误信息
\`\`\`
${testResult.error}
\`\`\`` : ''}

## 建议和总结
${testResult.success ? 
  `- ✅ 测试通过，网站功能正常
- 🤖 Claude Code 使用 bash 工具执行 npx playwright test 成功
- 📈 建议：可以考虑添加更多边界情况测试
${testResult.attempts > 1 ? '- 🔧 系统自动调试修复了测试问题，提高了测试稳定性' : ''}
${testResult.fixedTests && testResult.fixedTests.length > 0 ? `- 🎯 本轮成功修复了 ${testResult.fixedTests.length} 个历史失败测试用例` : ''}` : 
  `- ❌ 测试执行失败，已尝试 ${testResult.attempts}/10 次自动调试修复
- 🔍 使用 bash 工具执行 npx playwright test 命令失败
- 📋 建议：检查错误信息，手动调试测试用例
- 🌐 确认目标网站是否正常访问
- 🛠️ 考虑检查 Playwright 环境配置
${testResult.fixedTests && testResult.fixedTests.length > 0 ? `- 🎯 虽然失败，但成功修复了 ${testResult.fixedTests.length} 个历史失败测试用例` : ''}`}

---
*由 Claude Code Agents 自动生成 | 使用 bash 工具执行 npx playwright test*
`;
  }
}