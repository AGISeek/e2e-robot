/**
 * 产出内容分析器
 * 分析产出目录文件，确定应该从哪一步开始执行
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export enum ExecutionStep {
  WEBSITE_ANALYSIS = 1,
  SCENARIO_GENERATION = 2,
  TESTCASE_GENERATION = 3,
  TEST_EXECUTION = 4,
  CALIBRATION = 5
}

export interface OutputAnalysisResult {
  nextStep: ExecutionStep;
  existingFiles: string[];
  analysis: string;
  hasConfiguration: boolean;
  configFilePath?: string | undefined;
  needsInteractiveConfig: boolean;
}

export class OutputContentAnalyzer {
  private workDir: string;

  constructor(workDir: string) {
    this.workDir = workDir;
  }

  /**
   * 分析产出目录，确定下一步应该执行的步骤
   */
  async analyzeOutputContent(): Promise<OutputAnalysisResult> {
    try {
      // 确保工作目录存在
      await fs.mkdir(this.workDir, { recursive: true });

      // 获取目录中的所有文件
      const files = await fs.readdir(this.workDir);
      
      // 定义各步骤的标识文件和配置文件
      const stepFiles = {
        websiteAnalysis: 'website-analysis.md',
        testScenarios: 'test-scenarios.md', 
        testCases: 'generated-tests.spec.ts',
        testResults: 'test-results.json',
        calibrationReport: 'calibration-report.md',
        configuration: 'test-config.json'
      };

      // 检查各步骤文件是否存在
      const hasWebsiteAnalysis = files.includes(stepFiles.websiteAnalysis);
      const hasTestScenarios = files.includes(stepFiles.testScenarios);
      const hasTestCases = files.includes(stepFiles.testCases);
      const hasTestResults = files.includes(stepFiles.testResults);
      const hasCalibrationReport = files.includes(stepFiles.calibrationReport);
      const hasConfiguration = files.includes(stepFiles.configuration);

      let nextStep: ExecutionStep;
      let analysis: string = '';
      let needsInteractiveConfig: boolean;
      let configFilePath: string | undefined;

      // 首先基于产出内容确定执行进度和下一步
      if (hasCalibrationReport) {
        nextStep = ExecutionStep.CALIBRATION;
        analysis = '发现校准报告，完整流程已完成，可重新执行校准分析';
        needsInteractiveConfig = false; // 校准步骤不需要新配置
      } else if (hasTestResults) {
        // 检查测试是否成功，决定是否进行校准
        try {
          const testResultsPath = path.join(this.workDir, stepFiles.testResults);
          const testResultsContent = await fs.readFile(testResultsPath, 'utf-8');
          const testResults = JSON.parse(testResultsContent);
          
          // 检查测试是否成功 - 支持多种格式
          let isTestSuccessful = false;
          
          if (typeof testResults.success === 'boolean') {
            // TestRunner格式：直接有success字段
            isTestSuccessful = testResults.success;
          } else if (testResults.stats) {
            // Playwright原生格式：检查stats字段
            const stats = testResults.stats;
            isTestSuccessful = stats.unexpected === 0 && stats.expected > 0;
          } else if (testResults.suites) {
            // Playwright原生格式：检查所有测试的状态
            const allTests = this.extractAllTests(testResults.suites);
            const failedTests = allTests.filter(test => test.status !== 'expected');
            isTestSuccessful = allTests.length > 0 && failedTests.length === 0;
          }
          
          if (isTestSuccessful) {
            nextStep = ExecutionStep.CALIBRATION;
            analysis = '发现成功的测试结果，跳过前4步，直接进行校准分析';
            needsInteractiveConfig = false; // 校准步骤不需要新配置
          } else {
            nextStep = ExecutionStep.TEST_EXECUTION;
            analysis = '发现测试结果但执行失败，重新执行测试';
            needsInteractiveConfig = false; // 可以直接重试测试
          }
        } catch {
          nextStep = ExecutionStep.TEST_EXECUTION;
          analysis = '发现测试结果文件但无法解析，重新执行测试';
          needsInteractiveConfig = false; // 可以直接重试测试
        }
      } else if (hasTestCases) {
        nextStep = ExecutionStep.TEST_EXECUTION;
        analysis = '发现测试用例文件，跳过前3步，使用 Claude MCP 执行测试用例';
        needsInteractiveConfig = false; // 有测试用例可以直接执行
      } else if (hasTestScenarios) {
        nextStep = ExecutionStep.TESTCASE_GENERATION;
        analysis = '发现测试场景文件，跳过前2步，从测试用例生成开始';
        needsInteractiveConfig = false; // 有场景可以生成测试用例
      } else if (hasWebsiteAnalysis) {
        nextStep = ExecutionStep.SCENARIO_GENERATION;
        analysis = '发现网站分析文件，跳过第1步，从测试场景生成开始';
        // 场景生成需要测试要求配置，检查是否有配置
        needsInteractiveConfig = !hasConfiguration;
      } else {
        nextStep = ExecutionStep.WEBSITE_ANALYSIS;
        analysis = '未发现任何产出文件，从网站分析步骤开始';
        // 网站分析需要目标URL，检查是否有配置
        needsInteractiveConfig = !hasConfiguration;
      }

      // 检查配置文件（仅在需要时）
      if (hasConfiguration) {
        configFilePath = path.join(this.workDir, stepFiles.configuration);
        try {
          const configContent = await fs.readFile(configFilePath, 'utf-8');
          const config = JSON.parse(configContent);
          
          // 根据执行步骤验证所需的配置字段
          const hasRequiredFields = this.validateConfigForStep(config, nextStep);
          
          if (hasRequiredFields) {
            needsInteractiveConfig = false;
            analysis += '，配置文件有效';
          } else {
            needsInteractiveConfig = true;
            analysis += '，配置文件不完整，需要重新配置';
            configFilePath = undefined;
          }
        } catch {
          needsInteractiveConfig = true;
          analysis += '，配置文件无法解析，需要重新配置';
          configFilePath = undefined;
        }
      } else if (needsInteractiveConfig) {
        analysis += '，需要配置文件';
      }

      return {
        nextStep,
        existingFiles: files,
        analysis,
        hasConfiguration: hasConfiguration && !needsInteractiveConfig,
        configFilePath: hasConfiguration && !needsInteractiveConfig ? configFilePath : undefined,
        needsInteractiveConfig
      };

    } catch (error) {
      console.warn(`分析产出目录失败: ${error}, 从第1步开始`);
      return {
        nextStep: ExecutionStep.WEBSITE_ANALYSIS,
        existingFiles: [],
        analysis: '目录分析失败，从网站分析步骤开始',
        hasConfiguration: false,
        configFilePath: undefined,
        needsInteractiveConfig: true
      };
    }
  }

  /**
   * 从Playwright suites中提取所有测试用例
   */
  private extractAllTests(suites: any[]): any[] {
    const tests: any[] = [];
    
    const extractFromSuite = (suite: any) => {
      if (suite.specs) {
        suite.specs.forEach((spec: any) => {
          if (spec.tests) {
            tests.push(...spec.tests);
          }
        });
      }
      if (suite.suites) {
        suite.suites.forEach(extractFromSuite);
      }
    };
    
    suites.forEach(extractFromSuite);
    return tests;
  }

  /**
   * 根据执行步骤验证配置文件是否包含必要字段
   */
  private validateConfigForStep(config: any, step: ExecutionStep): boolean {
    if (!config) return false;
    
    switch (step) {
      case ExecutionStep.WEBSITE_ANALYSIS:
        // 网站分析只需要目标URL
        return !!config.targetUrl;
        
      case ExecutionStep.SCENARIO_GENERATION:
        // 场景生成需要目标URL和测试要求
        return !!(config.targetUrl && 
                 config.siteName && 
                 Array.isArray(config.testRequirements) && 
                 config.testRequirements.length > 0 &&
                 Array.isArray(config.testTypes) &&
                 config.testTypes.length > 0);
        
      case ExecutionStep.TESTCASE_GENERATION:
      case ExecutionStep.TEST_EXECUTION:
      case ExecutionStep.CALIBRATION:
        // 这些步骤可以使用现有的产出文件，不强制要求配置
        return true;
        
      default:
        return false;
    }
  }

  /**
   * 获取步骤描述
   */
  static getStepDescription(step: ExecutionStep): string {
    switch (step) {
      case ExecutionStep.WEBSITE_ANALYSIS:
        return '网站分析';
      case ExecutionStep.SCENARIO_GENERATION:
        return '测试场景生成';
      case ExecutionStep.TESTCASE_GENERATION:
        return '测试用例生成';
      case ExecutionStep.TEST_EXECUTION:
        return '执行测试 (Claude MCP)';
      case ExecutionStep.CALIBRATION:
        return '校准分析';
      default:
        return '未知步骤';
    }
  }

  /**
   * 打印分析结果
   */
  static logAnalysisResult(result: OutputAnalysisResult): void {
    console.log('📊 产出内容分析结果:');
    console.log(`   现有文件: ${result.existingFiles.length > 0 ? result.existingFiles.join(', ') : '无'}`);
    console.log(`   配置状态: ${result.hasConfiguration ? '✅ 已配置' : '❌ 需要配置'}`);
    if (result.configFilePath) {
      console.log(`   配置文件: ${result.configFilePath}`);
    }
    console.log(`   分析结论: ${result.analysis}`);
    console.log(`   开始步骤: 第${result.nextStep}步 - ${OutputContentAnalyzer.getStepDescription(result.nextStep)}`);
    console.log(`   交互配置: ${result.needsInteractiveConfig ? '🔄 需要' : '✅ 跳过'}`);
    console.log('');
  }
}