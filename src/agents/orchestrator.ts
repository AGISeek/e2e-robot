/**
 * 测试自动化协调器
 * 协调所有代理完成完整的测试自动化流程
 */

import { AgentConfig } from './types';
import { WebsiteAnalyzer } from './website-analyzer';
import { ScenarioGenerator } from './scenario-generator';
import { TestCaseGenerator } from './testcase-generator';
import { TestRunner } from './test-runner';
import { Calibrator } from './calibrator';
import { ExecutionStep } from './output-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface OrchestratorConfig extends AgentConfig {
  targetUrl: string;
}

export class TestAutomationOrchestrator {
  private config: OrchestratorConfig;
  private websiteAnalyzer: WebsiteAnalyzer;
  private scenarioGenerator: ScenarioGenerator;
  private testCaseGenerator: TestCaseGenerator;
  private testRunner: TestRunner;
  private calibrator: Calibrator;
  
  constructor(config: OrchestratorConfig) {
    this.config = config;
    
    // 初始化所有代理，设置较长的超时时间
    const agentConfig = { ...config, timeout: 600000 }; // 10分钟超时
    this.websiteAnalyzer = new WebsiteAnalyzer(agentConfig);
    this.scenarioGenerator = new ScenarioGenerator(agentConfig);
    this.testCaseGenerator = new TestCaseGenerator(agentConfig);
    this.testRunner = new TestRunner(agentConfig);
    this.calibrator = new Calibrator(agentConfig);
  }
  
  /**
   * 执行完整的测试自动化流程
   */
  async execute(): Promise<void> {
    await this.executeFromStep(ExecutionStep.WEBSITE_ANALYSIS);
  }

  /**
   * 从指定步骤开始执行测试自动化流程
   */
  async executeFromStep(startStep: ExecutionStep): Promise<void> {
    try {
      console.log('🚀 开始自动化测试流程...');
      console.log(`🎯 目标网站: ${this.config.targetUrl}`);
      console.log(`📍 开始步骤: 第${startStep}步`);
      
      // 初始化工作目录
      await this.initializeWorkDirectory();
      
      let analysisFilePath: string | undefined;
      let scenarioFilePath: string | undefined;
      let testCaseFilePath: string | undefined;
      
      // 步骤1: 网站分析
      if (startStep <= ExecutionStep.WEBSITE_ANALYSIS) {
        console.log('\n📊 步骤1: 网站分析');
        console.log('⏳ 这可能需要几分钟时间，请耐心等待...');
        const analysisResult = await this.websiteAnalyzer.execute(this.config.targetUrl);
        if (!analysisResult.success) {
          throw new Error(`网站分析失败: ${analysisResult.error}`);
        }
        console.log(`✅ 网站分析完成: ${analysisResult.filePath}`);
        analysisFilePath = analysisResult.filePath!;
      } else {
        // 使用现有的分析文件
        analysisFilePath = path.join(this.config.workDir, 'website-analysis.md');
        console.log(`📊 跳过步骤1，使用现有分析文件: ${analysisFilePath}`);
      }
      
      // 步骤2: 场景生成
      if (startStep <= ExecutionStep.SCENARIO_GENERATION) {
        console.log('\n📝 步骤2: 测试场景生成');
        console.log('⏳ 正在基于分析结果生成测试场景...');
        const scenarioResult = await this.scenarioGenerator.execute(analysisFilePath);
        if (!scenarioResult.success) {
          throw new Error(`场景生成失败: ${scenarioResult.error}`);
        }
        console.log(`✅ 测试场景生成完成: ${scenarioResult.filePath}`);
        scenarioFilePath = scenarioResult.filePath!;
      } else {
        // 使用现有的场景文件
        scenarioFilePath = path.join(this.config.workDir, 'test-scenarios.md');
        console.log(`📝 跳过步骤2，使用现有场景文件: ${scenarioFilePath}`);
      }
      
      // 步骤3: 测试用例生成
      if (startStep <= ExecutionStep.TESTCASE_GENERATION) {
        console.log('\n⚙️ 步骤3: 测试用例生成');
        console.log('⏳ 正在将测试场景转换为 Playwright 代码...');
        const testCaseResult = await this.testCaseGenerator.execute(scenarioFilePath);
        if (!testCaseResult.success) {
          throw new Error(`测试用例生成失败: ${testCaseResult.error}`);
        }
        console.log(`✅ 测试用例生成完成: ${testCaseResult.filePath}`);
        testCaseFilePath = testCaseResult.filePath!;
      } else {
        // 使用现有的测试用例文件
        testCaseFilePath = path.join(this.config.workDir, 'generated-tests.spec.ts');
        console.log(`⚙️ 跳过步骤3，使用现有测试用例文件: ${testCaseFilePath}`);
      }
      
      // 步骤4: 测试执行
      let testResultsFilePath: string | undefined;
      if (startStep <= ExecutionStep.TEST_EXECUTION) {
        console.log('\n🧪 步骤4: 执行测试 (Claude MCP)');
        console.log('⏳ 正在使用 Claude Executor + Playwright MCP 执行测试...');
        const testResult = await this.testRunner.execute(testCaseFilePath);
        if (!testResult.success) {
          console.warn(`⚠️ 测试执行遇到问题: ${testResult.error}`);
        } else {
          console.log(`✅ 测试执行完成: ${testResult.filePath}`);
          testResultsFilePath = path.join(this.config.workDir, 'test-results.json');
        }
      } else {
        // 使用现有的测试结果文件
        testResultsFilePath = path.join(this.config.workDir, 'test-results.json');
        console.log(`🧪 跳过步骤4，使用现有测试结果文件: ${testResultsFilePath}`);
      }
      
      // 步骤5: 校准 (仅在测试成功时执行)
      if (testResultsFilePath && startStep <= 5) {
        try {
          // 检查测试是否成功
          const testResultsContent = await fs.readFile(testResultsFilePath, 'utf-8');
          const testResults = JSON.parse(testResultsContent);
          
          if (testResults.success) {
            console.log('\n🔧 步骤5: 校准分析');
            console.log('⏳ 正在基于成功的测试结果进行校准分析...');
            const calibrationResult = await this.calibrator.execute(testResultsFilePath);
            if (!calibrationResult.success) {
              console.warn(`⚠️ 校准分析遇到问题: ${calibrationResult.error}`);
            } else {
              console.log(`✅ 校准分析完成: ${calibrationResult.filePath}`);
            }
          } else {
            console.log('\n⚠️ 步骤5: 跳过校准');
            console.log('因为测试未成功执行，跳过校准步骤');
          }
        } catch (error) {
          console.warn(`⚠️ 无法读取测试结果进行校准: ${error}`);
        }
      }
      
      // 总结
      console.log('\n🎉 自动化测试流程完成！');
      console.log(`📁 所有输出文件保存在: ${this.config.workDir}`);
      await this.printSummary();
      
    } catch (error) {
      console.error('\n❌ 自动化测试流程失败:', error);
      throw error;
    }
  }
  
  private async initializeWorkDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.workDir, { recursive: true });
      console.log(`📁 工作目录已准备: ${this.config.workDir}`);
    } catch (error) {
      throw new Error(`初始化工作目录失败: ${error}`);
    }
  }
  
  private async printSummary(): Promise<void> {
    console.log('\n📋 生成的文件:');
    
    const files = [
      { name: 'website-analysis.md', desc: '网站分析' },
      { name: 'test-scenarios.md', desc: '测试场景' },
      { name: 'generated-tests.spec.ts', desc: '测试用例' },
      { name: 'test-results.json', desc: '测试结果 (JSON)' },
      { name: 'test-report.md', desc: '测试报告 (Markdown)' },
      { name: 'calibration-report.md', desc: '校准报告' }
    ];
    
    for (const file of files) {
      const filePath = path.join(this.config.workDir, file.name);
      try {
        await fs.access(filePath);
        console.log(`  ✅ ${file.name} (${file.desc})`);
      } catch {
        console.log(`  ❌ ${file.name} (${file.desc}) - 未找到`);
      }
    }
    
    console.log(`\n💡 提示:`);
    console.log(`   - 使用 Claude MCP 执行测试，支持自动调试修复`);
    console.log(`   - 校准报告基于成功的测试结果生成，用于优化未来的测试`);
    console.log(`   - 重新运行将基于现有文件智能判断从哪个步骤开始`);
  }
}