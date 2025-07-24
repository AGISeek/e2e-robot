/**
 * 测试安全代码执行器
 */

import { SafeCodeExecutor, testSafeCodeExecutor } from './safe-code-executor.js';

// 主函数
async function main(): Promise<void> {
  console.log('🚀 开始测试安全代码执行器...\n');
  
  // 运行内置测试
  testSafeCodeExecutor();
  
  // 等待测试完成
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n🎉 安全代码执行器测试完成！');
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 