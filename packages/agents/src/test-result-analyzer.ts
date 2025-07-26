/**
 * 测试结果分析器
 * 分析 test-results 目录中的测试结果，识别失败的测试用例
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  duration?: number;
  file?: string;
  line?: number;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface TestResults {
  suites: TestSuite[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  failedTests: TestCase[];
}

export class TestResultAnalyzer {
  private resultsDir: string;
  
  constructor(workDir: string) {
    this.resultsDir = path.join(workDir, 'test-results');
  }
  
  /**
   * 分析测试结果目录，返回解析后的结果
   */
  async analyzeResults(): Promise<TestResults | null> {
    try {
      // 检查 test-results 目录是否存在
      const resultsExist = await this.checkResultsExist();
      if (!resultsExist) {
        console.log('未找到 test-results 目录，可能是首次执行测试');
        return null;
      }
      
      // 查找并解析测试结果文件
      const resultFiles = await this.findResultFiles();
      if (resultFiles.length === 0) {
        console.log('test-results 目录中未找到测试结果文件');
        return null;
      }
      
      // 解析所有结果文件
      const results = await this.parseResultFiles(resultFiles);
      return results;
      
    } catch (error) {
      console.error('分析测试结果失败:', error);
      return null;
    }
  }
  
  /**
   * 检查 test-results 目录是否存在
   */
  private async checkResultsExist(): Promise<boolean> {
    try {
      await fs.access(this.resultsDir);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 查找测试结果文件
   */
  private async findResultFiles(): Promise<string[]> {
    const files = await fs.readdir(this.resultsDir, { recursive: true });
    const resultFiles: string[] = [];
    
    for (const file of files) {
      const filePath = path.join(this.resultsDir, file.toString());
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        // 查找 JSON 或 XML 格式的测试结果文件
        if (file.toString().includes('results') && 
            (file.toString().endsWith('.json') || file.toString().endsWith('.xml'))) {
          resultFiles.push(filePath);
        }
        // 也查找 Playwright 常见的结果文件
        if (file.toString().includes('test') && file.toString().endsWith('.json')) {
          resultFiles.push(filePath);
        }
      }
    }
    
    return resultFiles;
  }
  
  /**
   * 解析测试结果文件
   */
  private async parseResultFiles(files: string[]): Promise<TestResults> {
    const suites: TestSuite[] = [];
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalDuration = 0;
    const failedTests: TestCase[] = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        if (file.endsWith('.json')) {
          const result = await this.parseJsonResult(content, file);
          if (result) {
            suites.push(result);
            totalPassed += result.passed;
            totalFailed += result.failed;
            totalSkipped += result.skipped;
            totalDuration += result.duration;
            
            // 收集失败的测试用例
            failedTests.push(...result.tests.filter(t => t.status === 'failed'));
          }
        } else if (file.endsWith('.xml')) {
          const result = await this.parseXmlResult(content, file);
          if (result) {
            suites.push(result);
            totalPassed += result.passed;
            totalFailed += result.failed;
            totalSkipped += result.skipped;
            totalDuration += result.duration;
            
            failedTests.push(...result.tests.filter(t => t.status === 'failed'));
          }
        }
      } catch (error) {
        console.error(`解析结果文件失败 ${file}:`, error);
      }
    }
    
    return {
      suites,
      summary: {
        total: totalPassed + totalFailed + totalSkipped,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        duration: totalDuration
      },
      failedTests
    };
  }
  
  /**
   * 解析 JSON 格式的测试结果
   */
  private async parseJsonResult(content: string, fileName: string): Promise<TestSuite | null> {
    try {
      const data = JSON.parse(content);
      
      // 处理 Playwright JSON 结果格式
      if (data.suites || data.tests) {
        return this.parsePlaywrightJson(data, fileName);
      }
      
      // 处理其他 JSON 格式
      if (data.testResults || data.numPassedTests !== undefined) {
        return this.parseJestJson(data, fileName);
      }
      
      return null;
    } catch (error) {
      console.error('解析 JSON 结果失败:', error);
      return null;
    }
  }
  
  /**
   * 解析 Playwright JSON 结果
   */
  private parsePlaywrightJson(data: any, fileName: string): TestSuite {
    const tests: TestCase[] = [];
    let passed = 0, failed = 0, skipped = 0;
    
    // 递归解析 Playwright 的嵌套结构
    const parseSpecs = (specs: any[]) => {
      for (const spec of specs || []) {
        if (spec.tests) {
          for (const test of spec.tests) {
            for (const result of test.results || []) {
              const error = result.error?.message;
              const testCase: TestCase = {
                name: test.title,
                status: result.status === 'passed' ? 'passed' : 
                       result.status === 'skipped' ? 'skipped' : 'failed',
                duration: result.duration,
                file: spec.file,
                ...(error && { error })
              };
              
              tests.push(testCase);
              
              if (testCase.status === 'passed') passed++;
              else if (testCase.status === 'failed') failed++;
              else skipped++;
            }
          }
        }
        
        if (spec.suites) {
          parseSpecs(spec.suites);
        }
      }
    };
    
    if (data.suites) {
      parseSpecs(data.suites);
    } else if (data.specs) {
      parseSpecs(data.specs);
    }
    
    return {
      name: path.basename(fileName, '.json'),
      tests,
      duration: tests.reduce((sum, t) => sum + (t.duration || 0), 0),
      passed,
      failed,
      skipped
    };
  }
  
  /**
   * 解析 Jest JSON 结果
   */
  private parseJestJson(data: any, fileName: string): TestSuite {
    const tests: TestCase[] = [];
    
    if (data.testResults) {
      for (const testResult of data.testResults) {
        for (const assertionResult of testResult.assertionResults || []) {
          const error = assertionResult.failureMessages?.[0];
          tests.push({
            name: assertionResult.title,
            status: assertionResult.status,
            duration: assertionResult.duration,
            file: testResult.name,
            ...(error && { error })
          });
        }
      }
    }
    
    return {
      name: path.basename(fileName, '.json'),
      tests,
      duration: data.perfStats?.runtime || 0,
      passed: data.numPassedTests || 0,
      failed: data.numFailedTests || 0,
      skipped: data.numPendingTests || 0
    };
  }
  
  /**
   * 解析 XML 格式的测试结果 (JUnit 格式)
   */
  private async parseXmlResult(content: string, fileName: string): Promise<TestSuite | null> {
    // 简单的 XML 解析，提取测试用例信息
    const tests: TestCase[] = [];
    let passed = 0, failed = 0, skipped = 0;
    
    // 使用正则表达式提取测试用例
    const testCaseRegex = /<testcase[^>]*name="([^"]*)"[^>]*(?:time="([^"]*)")?[^>]*>(.*?)<\/testcase>/gs;
    let match;
    
    while ((match = testCaseRegex.exec(content)) !== null) {
      const name = match[1] || 'Unknown Test';
      const duration = parseFloat(match[2] || '0');
      const body = match[3];
      
      if (!body) {
        // 如果没有 body 内容，默认认为测试通过
        tests.push({
          name,
          status: 'passed',
          duration,
          file: fileName
        });
        passed++;
        continue;
      }
      
      let status: 'passed' | 'failed' | 'skipped' = 'passed';
      let error: string | undefined;
      
      if (body.includes('<failure')) {
        status = 'failed';
        const errorMatch = body.match(/<failure[^>]*>(.*?)<\/failure>/s);
        error = errorMatch?.[1]?.trim() || 'Test failed';
        failed++;
      } else if (body.includes('<skipped')) {
        status = 'skipped';
        skipped++;
      } else {
        passed++;
      }
      
      tests.push({
        name,
        status,
        duration,
        ...(error && { error }),
        file: fileName
      });
    }
    
    return {
      name: path.basename(fileName, '.xml'),
      tests,
      duration: tests.reduce((sum, t) => sum + (t.duration || 0), 0),
      passed,
      failed,
      skipped
    };
  }
  
  /**
   * 生成失败测试的详细报告
   */
  generateFailureReport(results: TestResults): string {
    if (results.failedTests.length === 0) {
      return '🎉 所有测试都通过了！';
    }
    
    let report = `## 失败的测试用例 (${results.failedTests.length}/${results.summary.total})\n\n`;
    
    results.failedTests.forEach((test, index) => {
      report += `### ${index + 1}. ${test.name}\n`;
      report += `- **文件**: ${test.file || '未知'}\n`;
      report += `- **状态**: ❌ 失败\n`;
      if (test.duration) {
        report += `- **耗时**: ${test.duration}ms\n`;
      }
      if (test.error) {
        report += `- **错误信息**:\n\`\`\`\n${test.error}\n\`\`\`\n`;
      }
      report += '\n';
    });
    
    return report;
  }
  
  /**
   * 清理旧的测试结果
   */
  async cleanOldResults(): Promise<void> {
    try {
      if (await this.checkResultsExist()) {
        await fs.rm(this.resultsDir, { recursive: true, force: true });
        console.log('已清理旧的测试结果');
      }
    } catch (error) {
      console.error('清理测试结果失败:', error);
    }
  }
}