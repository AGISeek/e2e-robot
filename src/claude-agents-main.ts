/**
 * Claude Code Agents 主入口
 * 基于 SOLID 原则的测试自动化系统
 */

import { TestAutomationOrchestrator } from './agents/orchestrator.js';
import * as path from 'path';

async function main(): Promise<void> {
  try {
    // 配置
    const config = {
      targetUrl: 'https://www.baidu.com',
      workDir: path.join(process.cwd(), 'claude-agents-output'),
      verbose: true
    };
    
    console.log('🤖 Claude Code Agents 测试自动化系统');
    console.log('📋 基于 SOLID 原则的模块化架构\n');
    
    // 创建协调器并执行
    const orchestrator = new TestAutomationOrchestrator(config);
    await orchestrator.execute();
    
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