/**
 * Claude Code Agents 主入口
 * 基于 SOLID 原则的测试自动化系统
 */

import { TestAutomationOrchestrator, OutputAnalyzer } from '@e2e-robot/agents';
import { InteractiveConfig } from '@e2e-robot/cli';
import { TestConfig } from '@e2e-robot/core';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config(); 

async function main(): Promise<void> {
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    const forceInteractive = args.includes('--interactive');
    const noInteractive = args.includes('--no-interactive');
    
    console.log('🤖 Claude Code Agents 测试自动化系统');
    
    // 首先分析现有的产出目录以确定执行状态
    // 在 monorepo 中，需要找到正确的项目根目录
    const findProjectRoot = (): string => {
      let currentDir = process.cwd();
      
      // 如果当前在 apps/e2e-robot 目录，需要上两级到根目录
      if (currentDir.endsWith('apps/e2e-robot')) {
        return path.join(currentDir, '../../');
      }
      
      // 尝试查找包含 pnpm-workspace.yaml 的目录
      while (currentDir !== path.dirname(currentDir)) {
        try {
          const workspaceFile = path.join(currentDir, 'pnpm-workspace.yaml');
          if (fsSync.existsSync(workspaceFile)) {
            return currentDir;
          }
        } catch {
          // 继续向上查找
        }
        currentDir = path.dirname(currentDir);
      }
      
      // 如果找不到，使用当前目录
      return process.cwd();
    };
    
    const projectRoot = findProjectRoot();
    const defaultWorkDir = path.join(projectRoot, 'claude-agents-output');
    const outputAnalyzer = new OutputAnalyzer(defaultWorkDir);
    const analysisResult = await outputAnalyzer.analyzeOutputContent();
    
    // 打印分析结果
    OutputAnalyzer.logAnalysisResult(analysisResult);
    
    let config: TestConfig;
    
    // 智能决定是否需要交互式配置
    const needsInteractiveConfig = forceInteractive || 
                                 (analysisResult.needsInteractiveConfig && !noInteractive);
    
    if (needsInteractiveConfig) {
      console.log('🔄 启动交互式配置...');
      // 交互式配置
      const interactiveConfig = new InteractiveConfig();
      config = await interactiveConfig.startConfiguration();
    } else if (analysisResult.hasConfiguration && analysisResult.configFilePath) {
      console.log('📄 使用现有配置文件...');
      // 加载现有配置
      try {
        const configContent = await fs.readFile(analysisResult.configFilePath, 'utf-8');
        config = JSON.parse(configContent);
        console.log(`✅ 配置加载成功: ${config.siteName} (${config.targetUrl})`);
        console.log(`🎯 测试要求: ${config.testRequirements.length} 项`);
        console.log(`🧪 测试类型: ${config.testTypes.join(', ')}`);
      } catch (error) {
        console.warn(`⚠️ 配置文件读取失败: ${error}`);
        // 回退到交互式配置
        const interactiveConfig = new InteractiveConfig();
        config = await interactiveConfig.startConfiguration();
      }
    } else {
      // 默认配置（用于自动化场景）
      config = {
        targetUrl: 'https://www.baidu.com',
        siteName: 'baidu.com',
        testRequirements: ['测试网站基本功能', '验证页面加载正常'],
        testTypes: ['functional', 'ux'],
        maxTestCases: 20,
        priority: 'medium',
        workDir: defaultWorkDir,
        verbose: true,
        timeout: 600000
      };
      
      console.log('🔧 使用默认配置');
    }
    
    console.log('\n🚀 开始测试自动化流程...');
    
    // 重新分析产出目录（可能配置目录已更改）
    const finalOutputAnalyzer = new OutputAnalyzer(config.workDir);
    const finalAnalysisResult = await finalOutputAnalyzer.analyzeOutputContent();
    
    // 如果分析结果和之前不同，更新分析结果
    const actualAnalysisResult = config.workDir === defaultWorkDir ? 
                                 analysisResult : finalAnalysisResult;
    
    // 创建协调器配置
    const orchestratorConfig = {
      targetUrl: config.targetUrl,
      workDir: config.workDir,
      verbose: config.verbose,  
      timeout: config.timeout,
      // 传递测试配置给协调器
      testConfig: config
    };
    
    // 显示执行计划
    console.log(`📍 从第${actualAnalysisResult.nextStep}步开始: ${OutputAnalyzer.getStepDescription(actualAnalysisResult.nextStep)}`);
    if (actualAnalysisResult.nextStep > 1) {
      console.log('💡 基于现有文件智能跳过已完成的步骤');
    }
    
    // 创建协调器并从分析得出的步骤开始执行
    const orchestrator = new TestAutomationOrchestrator(orchestratorConfig);
    await orchestrator.executeFromStep(actualAnalysisResult.nextStep);
    
  } catch (error: any) {
    // 检查是否为使用限制错误
    if (isUsageLimitError(error)) {
      console.log('\n🚫 Claude AI 使用限制已达上限');
      console.log('💡 系统已优雅退出，请等待限制重置后再次尝试');
      console.log('📊 您可以查看已生成的部分结果在工作目录中');
      
      // 优雅退出，不显示错误堆栈
      process.exit(0); // 使用 0 表示正常退出
    } else {
      console.error('❌ 系统执行失败:', error);
      process.exit(1);
    }
  }
}

/**
 * 检查错误是否为使用限制相关错误
 */
function isUsageLimitError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = (error.message || '').toLowerCase();
  const errorString = String(error).toLowerCase();
  
  // 检查特定的错误代码和标记
  if (error.code === 'USAGE_LIMIT_REACHED' || error.retryable === false) {
    return true;
  }
  
  // 检查错误消息中的使用限制指示器
  const usageLimitPatterns = [
    'usage limit reached',
    'claude ai usage limit',
    'api usage limit',
    'rate limit',
    'quota exceeded',
    'usage quota',
    'monthly limit',
    'api limit exceeded',
    'claude code process exited with code 1', // Claude Code SDK 特定错误
    'anthropic api error'
  ];
  
  return usageLimitPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorString.includes(pattern)
  );
}

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };