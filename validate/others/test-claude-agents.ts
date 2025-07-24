/**
 * 测试 Claude Agents 系统
 */

import { ClaudeExecutor } from '../../src/agents/claude-executor.js';
import * as path from 'path';

async function testClaudeAgents(): Promise<void> {
  try {
    console.log('🧪 测试 Claude Agents 系统...\n');
    
    const workDir = path.join(process.cwd(), 'test-agents-output');
    const executor = new ClaudeExecutor({ workDir });
    
    // 测试1: 基础 SDK 调用
    console.log('📋 测试1: 基础 SDK 调用');
    const basicResult = await executor.executePrompt(
      '你好！请回复"Hello from Claude Agents!"作为测试。',
      'test-basic.txt'
    );
    console.log(`✅ 基础测试完成，响应长度: ${basicResult.length}\n`);
    
    // 测试2: 使用 Write 工具写文件
    console.log('📋 测试2: 使用 Write 工具写文件');
    const writePrompt = `**重要：请必须使用 Write 工具创建文件！**

请使用 Write 工具创建一个测试文件，内容如下：

# Claude Agents 测试文件

这是通过 Claude Code Write 工具创建的测试文件。

## 测试信息
- 创建时间: 2024年
- 工具: Write 工具
- 状态: 测试成功

**请使用 Write 工具将上述内容保存为文件名 test-write.md**`;
    
    const writeResult = await executor.executePrompt(writePrompt, 'test-write.md');
    console.log(`✅ Write 工具测试完成\n`);
    
    // 测试3: 模拟场景生成使用 Write 工具
    console.log('📋 测试3: 模拟场景生成使用 Write 工具');
    const scenarioPrompt = `请使用 Write 工具创建测试场景文档 test-scenarios.md，内容包含百度网站的3个测试场景：

# 测试场景文档

## 测试场景1: 搜索功能验证
- **描述**: 验证百度搜索功能正常工作
- **步骤**: 
  1. 打开百度首页
  2. 在搜索框输入关键词
  3. 点击搜索按钮
  4. 验证搜索结果

## 测试场景2: 页面加载验证
- **描述**: 验证页面能正常加载
- **步骤**:
  1. 访问百度首页
  2. 检查页面元素加载
  3. 验证页面标题

## 测试场景3: 用户交互验证
- **描述**: 验证基本用户交互功能
- **步骤**:
  1. 点击各种页面元素
  2. 验证响应正常

请使用 Write 工具将上述内容保存为 test-scenarios.md 文件。`;
    
    const scenarioResult = await executor.executePrompt(scenarioPrompt, 'test-scenarios.md');
    console.log(`✅ 场景生成测试完成\n`);
    
    console.log('🎉 所有测试完成！');
    console.log(`📁 输出文件保存在: ${workDir}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testClaudeAgents().catch(console.error);
}

export { testClaudeAgents };