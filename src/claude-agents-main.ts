/**
 * Claude Code Agents 主入口
 * 基于 SOLID 原则的测试自动化系统
 */

import { TestAutomationOrchestrator } from './agents/orchestrator.js';
import { OutputContentAnalyzer } from './agents/output-analyzer.js';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config(); 

async function main(): Promise<void> {
  try {
    // 配置
    const config = {
      targetUrl: 'https://www.baidu.com',
      workDir: path.join(process.cwd(), 'claude-agents-output'),
      verbose: true,
      timeout: 600000
    };
    
    console.log('🤖 Claude Code Agents 测试自动化系统');
    
    // 使用产出内容分析器分析现有文件
    const outputAnalyzer = new OutputContentAnalyzer(config.workDir);
    const analysisResult = await outputAnalyzer.analyzeOutputContent();
    
    // 打印分析结果
    OutputContentAnalyzer.logAnalysisResult(analysisResult);
    
    // 创建协调器并从分析得出的步骤开始执行
    const orchestrator = new TestAutomationOrchestrator(config);
    await orchestrator.executeFromStep(analysisResult.nextStep);
    
  } catch (error) {
    console.error('❌ 系统执行失败:', error);
    process.exit(1);
  }
}

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };