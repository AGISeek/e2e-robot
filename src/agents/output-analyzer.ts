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
      
      // 定义各步骤的标识文件
      const stepFiles = {
        websiteAnalysis: 'website-analysis.md',
        testScenarios: 'test-scenarios.md', 
        testCases: 'generated-tests.spec.ts',
        testResults: 'test-results.json',
        calibrationReport: 'calibration-report.md'
      };

      // 检查各步骤文件是否存在
      const hasWebsiteAnalysis = files.includes(stepFiles.websiteAnalysis);
      const hasTestScenarios = files.includes(stepFiles.testScenarios);
      const hasTestCases = files.includes(stepFiles.testCases);
      const hasTestResults = files.includes(stepFiles.testResults);
      const hasCalibrationReport = files.includes(stepFiles.calibrationReport);

      let nextStep: ExecutionStep;
      let analysis: string;

      // 根据现有文件确定下一步
      if (hasCalibrationReport) {
        nextStep = ExecutionStep.CALIBRATION;
        analysis = '发现校准报告，完整流程已完成，可重新执行校准分析';
      } else if (hasTestResults) {
        // 检查测试是否成功，决定是否进行校准
        try {
          const testResultsPath = path.join(this.workDir, stepFiles.testResults);
          const testResultsContent = await fs.readFile(testResultsPath, 'utf-8');
          const testResults = JSON.parse(testResultsContent);
          
          if (testResults.success) {
            nextStep = ExecutionStep.CALIBRATION;
            analysis = '发现成功的测试结果，跳过前4步，直接进行校准分析';
          } else {
            nextStep = ExecutionStep.TEST_EXECUTION;
            analysis = '发现测试结果但执行失败，重新执行测试';
          }
        } catch {
          nextStep = ExecutionStep.TEST_EXECUTION;
          analysis = '发现测试结果文件但无法解析，重新执行测试';
        }
      } else if (hasTestCases) {
        nextStep = ExecutionStep.TEST_EXECUTION;
        analysis = '发现测试用例文件，跳过前3步，使用 Claude MCP 执行测试用例';
      } else if (hasTestScenarios) {
        nextStep = ExecutionStep.TESTCASE_GENERATION;
        analysis = '发现测试场景文件，跳过前2步，从测试用例生成开始';
      } else if (hasWebsiteAnalysis) {
        nextStep = ExecutionStep.SCENARIO_GENERATION;
        analysis = '发现网站分析文件，跳过第1步，从测试场景生成开始';
      } else {
        nextStep = ExecutionStep.WEBSITE_ANALYSIS;
        analysis = '未发现任何产出文件，从网站分析步骤开始';
      }

      return {
        nextStep,
        existingFiles: files,
        analysis
      };

    } catch (error) {
      console.warn(`分析产出目录失败: ${error}, 从第1步开始`);
      return {
        nextStep: ExecutionStep.WEBSITE_ANALYSIS,
        existingFiles: [],
        analysis: '目录分析失败，从网站分析步骤开始'
      };
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
    console.log(`   分析结论: ${result.analysis}`);
    console.log(`   开始步骤: 第${result.nextStep}步 - ${OutputContentAnalyzer.getStepDescription(result.nextStep)}`);
    console.log('');
  }
}