/**
 * 测试自动化协调器
 * 协调所有代理完成完整的测试自动化流程
 */

import { AgentConfig } from './types';
import { WebsiteAnalyzer } from './website-analyzer';
import { ScenarioGenerator } from './scenario-generator';
import { TestCaseGenerator } from './testcase-generator';
import { TestRunner } from './test-runner';
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
  
  constructor(config: OrchestratorConfig) {
    this.config = config;
    
    // 初始化所有代理，设置较长的超时时间
    const agentConfig = { ...config, timeout: 600000 }; // 10分钟超时
    this.websiteAnalyzer = new WebsiteAnalyzer(agentConfig);
    this.scenarioGenerator = new ScenarioGenerator(agentConfig);
    this.testCaseGenerator = new TestCaseGenerator(agentConfig);
    this.testRunner = new TestRunner(agentConfig);
  }
  
  /**
   * 执行完整的测试自动化流程
   */
  async execute(): Promise<void> {
    try {
      console.log('🚀 开始自动化测试流程...');
      console.log(`🎯 目标网站: ${this.config.targetUrl}`);
      
      // 初始化工作目录
      await this.initializeWorkDirectory();
      
      // 步骤1: 网站分析
      console.log('\n📊 步骤1: 网站分析');
      console.log('⏳ 这可能需要几分钟时间，请耐心等待...');
      const analysisResult = await this.websiteAnalyzer.execute(this.config.targetUrl);
      if (!analysisResult.success) {
        throw new Error(`网站分析失败: ${analysisResult.error}`);
      }
      console.log(`✅ 网站分析完成: ${analysisResult.filePath}`);
      
      // 步骤2: 场景生成
      console.log('\n📝 步骤2: 测试场景生成');
      console.log('⏳ 正在基于分析结果生成测试场景...');
      const scenarioResult = await this.scenarioGenerator.execute(analysisResult.filePath!);
      if (!scenarioResult.success) {
        throw new Error(`场景生成失败: ${scenarioResult.error}`);
      }
      console.log(`✅ 测试场景生成完成: ${scenarioResult.filePath}`);
      
      // 步骤3: 测试用例生成
      console.log('\n⚙️ 步骤3: 测试用例生成');
      console.log('⏳ 正在将测试场景转换为 Playwright 代码...');
      const testCaseResult = await this.testCaseGenerator.execute(scenarioResult.filePath!);
      if (!testCaseResult.success) {
        throw new Error(`测试用例生成失败: ${testCaseResult.error}`);
      }
      console.log(`✅ 测试用例生成完成: ${testCaseResult.filePath}`);
      
      // 步骤4: 测试执行
      console.log('\n🧪 步骤4: 执行测试');
      console.log('⏳ 正在使用 Playwright 执行生成的测试...');
      const testResult = await this.testRunner.execute(testCaseResult.filePath!);
      if (!testResult.success) {
        console.warn(`⚠️ 测试执行遇到问题: ${testResult.error}`);
      } else {
        console.log(`✅ 测试执行完成: ${testResult.filePath}`);
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
      'website-analysis.md',
      'test-scenarios.md',
      'generated-tests.spec.ts',
      'test-report.md'
    ];
    
    for (const file of files) {
      const filePath = path.join(this.config.workDir, file);
      try {
        await fs.access(filePath);
        console.log(`  ✅ ${file}`);
      } catch {
        console.log(`  ❌ ${file} (未找到)`);
      }
    }
  }
}