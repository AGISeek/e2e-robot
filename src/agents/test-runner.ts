/**
 * 测试执行代理
 * 使用 Playwright 执行生成的测试用例并生成报告
 */

import { BaseAgent, AgentResult, AgentConfig } from './types';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TestRunner extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }
  
  /**
   * 执行测试并生成报告
   */
  async execute(testFilePath: string): Promise<AgentResult> {
    try {
      this.log('开始执行测试用例...');
      
      // 检查测试文件是否存在
      await this.validateTestFile(testFilePath);
      
      // 执行 Playwright 测试
      const testResult = await this.runPlaywrightTests(testFilePath);
      
      // 生成测试报告
      await this.generateTestReport(testResult);
      
      return {
        success: true,
        data: {
          testFile: testFilePath,
          reportFile: path.join(this.config.workDir, 'test-report.md'),
          ...testResult
        },
        filePath: 'test-report.md'
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
  
  private async runPlaywrightTests(testFilePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.log('执行 Playwright 测试...');
      
      // 确保使用项目根目录作为工作目录，而不是 claude-agents-output
      const projectRoot = process.cwd();
      const absoluteTestPath = path.isAbsolute(testFilePath) ? testFilePath : path.join(this.config.workDir, testFilePath);
      
      const testProcess = spawn('npx', ['playwright', 'test', absoluteTestPath, '--reporter=json'], {
        cwd: projectRoot, // 使用项目根目录
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      testProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        if (this.config.verbose) {
          process.stdout.write(chunk);
        }
      });
      
      testProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        if (this.config.verbose) {
          process.stderr.write(chunk);
        }
      });
      
      testProcess.on('close', (code) => {
        try {
          // 尝试解析 JSON 报告
          let testResults = null;
          if (output.trim()) {
            try {
              testResults = JSON.parse(output);
            } catch {
              // 如果不是 JSON 格式，创建基础结果
              testResults = {
                success: code === 0,
                output: output,
                error: errorOutput
              };
            }
          }
          
          resolve({
            exitCode: code,
            success: code === 0,
            results: testResults,
            rawOutput: output,
            errorOutput: errorOutput
          });
        } catch (error) {
          reject(error);
        }
      });
      
      testProcess.on('error', (error) => {
        reject(new Error(`启动 Playwright 失败: ${error.message}`));
      });
    });
  }
  
  private async generateTestReport(testResult: any): Promise<void> {
    const reportContent = this.buildReportContent(testResult);
    const reportPath = path.join(this.config.workDir, 'test-report.md');
    
    await fs.writeFile(reportPath, reportContent, 'utf-8');
    this.log(`测试报告已生成: ${reportPath}`);
  }
  
  private buildReportContent(testResult: any): string {
    const timestamp = new Date().toISOString();
    
    return `# 自动化测试执行报告

## 执行概要
- **执行时间**: ${timestamp}
- **执行状态**: ${testResult.success ? '✅ 通过' : '❌ 失败'}
- **退出码**: ${testResult.exitCode}

## 测试结果
${testResult.success ? '所有测试用例执行成功！' : '部分测试用例执行失败，请查看详细信息。'}

## 详细信息
\`\`\`
${testResult.rawOutput || '无详细输出'}
\`\`\`

${testResult.errorOutput ? `## 错误信息
\`\`\`
${testResult.errorOutput}
\`\`\`` : ''}

## 建议
${testResult.success ? 
  '- 测试通过，网站功能正常\n- 可以考虑添加更多边界情况测试' : 
  '- 检查失败的测试用例\n- 确认网站功能是否正常\n- 更新测试用例或修复发现的问题'}
`;
  }
}