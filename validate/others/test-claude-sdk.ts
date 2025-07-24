/**
 * 测试 Claude Code SDK 基本功能
 */

import { query, type SDKMessage } from '@anthropic-ai/claude-code';

async function testClaudeSDK(): Promise<void> {
  console.log('🧪 开始测试 Claude Code SDK...');
  
  const abortController = new AbortController();
  
  try {
    const prompt = `
你好！请简单回复"Hello from Claude!"，这是一个测试调用。
`;

    console.log('📝 发送提示词:', prompt.trim());
    
    const messages: SDKMessage[] = [];
    
    console.log('🔄 开始查询...');
    for await (const message of query({
      prompt: prompt,
      abortController: abortController,
      options: {
        maxTurns: 1,
      },
    })) {
      console.log('📨 收到消息:', {
        type: message.type,
        timestamp: new Date().toISOString()
      });
      messages.push(message);
      
      // 实时打印消息内容
      if (message.type === 'assistant' && message.message?.content) {
        message.message.content.forEach((content, index) => {
          if (content.type === 'text') {
            console.log(`💬 助手响应 ${index + 1}:`, content.text.substring(0, 200));
          }
        });
      }
    }

    console.log('📊 查询完成，总消息数:', messages.length);
    
    // 详细分析所有消息
    messages.forEach((msg, index) => {
      console.log(`\n📄 消息 ${index + 1}:`);
      console.log('  类型:', msg.type);
      
      if (msg.type === 'assistant') {
        console.log('  内容数量:', msg.message?.content?.length || 0);
        msg.message?.content?.forEach((content, contentIndex) => {
          console.log(`  内容 ${contentIndex + 1}:`, {
            type: content.type,
            length: content.type === 'text' ? content.text?.length : 'N/A'
          });
          if (content.type === 'text' && content.text) {
            console.log(`  文本预览:`, content.text.substring(0, 100) + '...');
          }
        });
      } else if (msg.type === 'user') {
        console.log('  用户消息:', msg.message?.content?.substring(0, 100) + '...');
      } else {
        console.log('  其他类型消息:', JSON.stringify(msg, null, 2));
      }
    });

    // 尝试获取最终响应
    const assistantMessages = messages.filter(msg => msg.type === 'assistant');
    console.log('\n🎯 助手消息数量:', assistantMessages.length);
    
    if (assistantMessages.length > 0) {
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      if (lastAssistant.message?.content?.[0]?.type === 'text') {
        console.log('✅ 最终响应:', lastAssistant.message.content[0].text);
      }
    }
    
    console.log('\n🎉 Claude Code SDK 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testClaudeSDK().catch(console.error);
}

export { testClaudeSDK };