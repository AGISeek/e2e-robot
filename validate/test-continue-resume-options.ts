/**
 * 测试 Claude Code SDK 的 continue 和 resume 选项
 * 验证这些选项是否能实现会话保持功能
 */

import { query, type SDKMessage } from "@anthropic-ai/claude-code";

interface TestScenario {
  name: string;
  description: string;
  firstQueryOptions: any;
  secondQueryOptions: any;
}

interface QueryResult {
  scenarioName: string;
  queryName: string;
  prompt: string;
  options: any;
  messages: SDKMessage[];
  extractedContent: string;
  sessionId?: string;
}

async function testContinueResumeOptions(): Promise<void> {
  console.log('🧪 开始测试 Claude Code SDK 的 continue 和 resume 选项...\n');

  // 定义测试场景
  const scenarios: TestScenario[] = [
    {
      name: '场景1: 基础 continue 选项测试',
      description: '第二次查询使用 continue: true',
      firstQueryOptions: { maxTurns: 3 },
      secondQueryOptions: { maxTurns: 3, continue: true }
    },
    {
      name: '场景2: resume 选项测试',
      description: '第二次查询使用 resume: sessionId',
      firstQueryOptions: { maxTurns: 3 },
      secondQueryOptions: { maxTurns: 3, resume: '' } // sessionId 将在运行时填入
    },
    {
      name: '场景3: continue + resume 组合测试',
      description: '第二次查询同时使用 continue: true 和 resume: sessionId',
      firstQueryOptions: { maxTurns: 3 },
      secondQueryOptions: { maxTurns: 3, continue: true, resume: '' } // sessionId 将在运行时填入
    }
  ];

  const allResults: QueryResult[] = [];

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`${'='.repeat(60)}`);

    try {
      let capturedSessionId: string | null = null;

      // 第一次查询：设置身份信息
      console.log('\n📝 第一次 Query: 设置身份信息');
      console.log('提示词: "我是张三"');
      console.log(`选项: ${JSON.stringify(scenario.firstQueryOptions)}`);
      console.log('-'.repeat(40));

      const firstQueryMessages: SDKMessage[] = [];
      let firstQueryContent = '';

      for await (const message of query({
        prompt: "我是张三",
        abortController: new AbortController(),
        options: scenario.firstQueryOptions,
      })) {
        firstQueryMessages.push(message);
        
        // 捕获 sessionId
        if (message.session_id && !capturedSessionId) {
          capturedSessionId = message.session_id;
          console.log(`📋 捕获到 sessionId: ${capturedSessionId}`);
        }
        
        // 提取文本内容
        if (message.type === 'assistant' && message.message?.content) {
          message.message.content.forEach((content) => {
            if (content.type === 'text' && content.text) {
              firstQueryContent += content.text;
            }
          });
        }
      }

      allResults.push({
        scenarioName: scenario.name,
        queryName: '第一次Query - 设置身份',
        prompt: '我是张三',
        options: scenario.firstQueryOptions,
        messages: firstQueryMessages,
        extractedContent: firstQueryContent.trim(),
        sessionId: capturedSessionId || undefined
      });

      console.log('✅ 第一次 Query 完成');

      // 等待一秒钟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 准备第二次查询的选项（如果需要 sessionId）
      const secondQueryOptions = { ...scenario.secondQueryOptions };
      if (secondQueryOptions.resume === '' && capturedSessionId) {
        secondQueryOptions.resume = capturedSessionId;
        console.log(`🔄 将使用 resume: ${capturedSessionId}`);
      }

      // 第二次查询：测试身份记忆
      console.log('\n📝 第二次 Query: 测试身份记忆');
      console.log('提示词: "我是谁?"');
      console.log(`选项: ${JSON.stringify(secondQueryOptions)}`);
      console.log('-'.repeat(40));

      const secondQueryMessages: SDKMessage[] = [];
      let secondQueryContent = '';

      for await (const message of query({
        prompt: "我是谁?",
        abortController: new AbortController(),
        options: secondQueryOptions,
      })) {
        secondQueryMessages.push(message);
        
        // 提取文本内容
        if (message.type === 'assistant' && message.message?.content) {
          message.message.content.forEach((content) => {
            if (content.type === 'text' && content.text) {
              secondQueryContent += content.text;
            }
          });
        }
      }

      allResults.push({
        scenarioName: scenario.name,
        queryName: '第二次Query - 测试记忆',
        prompt: '我是谁?',
        options: secondQueryOptions,
        messages: secondQueryMessages,
        extractedContent: secondQueryContent.trim(),
        sessionId: capturedSessionId || undefined
      });

      console.log('✅ 第二次 Query 完成');

    } catch (error) {
      console.error(`❌ ${scenario.name} 执行失败:`, error);
    }
  }

  // 打印详细结果
  printDetailedResults(allResults);

  // 分析会话保持结果
  analyzeSessionPersistence(allResults);
}

/**
 * 打印详细的查询结果
 */
function printDetailedResults(results: QueryResult[]): void {
  console.log('\n\n📊 详细查询结果');
  console.log('=' .repeat(80));

  const groupedResults = groupResultsByScenario(results);

  for (const [scenarioName, scenarioResults] of Object.entries(groupedResults)) {
    console.log(`\n🎯 ${scenarioName}`);
    console.log('=' .repeat(60));

    scenarioResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.queryName}`);
      console.log(`   提示词: "${result.prompt}"`);
      console.log(`   选项: ${JSON.stringify(result.options)}`);
      console.log(`   消息数量: ${result.messages.length}`);
      console.log(`   提取内容长度: ${result.extractedContent.length} 字符`);
      console.log(`   SessionId: ${result.sessionId || 'N/A'}`);
      
      console.log(`\n   📄 完整提取内容:`);
      if (result.extractedContent) {
        const truncatedText = result.extractedContent.length > 200 
          ? result.extractedContent.substring(0, 200) + '...'
          : result.extractedContent;
        console.log(`   "${truncatedText}"`);
      } else {
        console.log('   (无文本内容)');
      }
      
      // 分析消息中的 session_id
      const sessionIds = [...new Set(result.messages.map(m => m.session_id))];
      console.log(`   实际消息中的 Session ID: [${sessionIds.join(', ')}]`);
      
      console.log('\n' + '-'.repeat(50));
    });
  }
}

/**
 * 按场景分组结果
 */
function groupResultsByScenario(results: QueryResult[]): Record<string, QueryResult[]> {
  return results.reduce((groups, result) => {
    if (!groups[result.scenarioName]) {
      groups[result.scenarioName] = [];
    }
    groups[result.scenarioName].push(result);
    return groups;
  }, {} as Record<string, QueryResult[]>);
}

/**
 * 分析会话保持结果
 */
function analyzeSessionPersistence(results: QueryResult[]): void {
  console.log('\n\n🔍 会话保持分析');
  console.log('=' .repeat(80));

  const groupedResults = groupResultsByScenario(results);

  for (const [scenarioName, scenarioResults] of Object.entries(groupedResults)) {
    if (scenarioResults.length < 2) {
      console.log(`\n❌ ${scenarioName}: 测试数据不足，无法分析会话保持`);
      continue;
    }

    const firstResult = scenarioResults[0];
    const secondResult = scenarioResults[1];

    console.log(`\n🎯 ${scenarioName}`);
    console.log('-'.repeat(60));

    const firstResponse = firstResult.extractedContent.toLowerCase();
    const secondResponse = secondResult.extractedContent.toLowerCase();

    // 检查第二次响应是否包含名字"张三"
    const nameInSecondResponse = secondResponse.includes('张三') || 
                                  secondResponse.includes('张') ||
                                  secondResponse.includes('三');

    console.log(`第一次响应: "${firstResponse.substring(0, 100)}${firstResponse.length > 100 ? '...' : ''}"`);
    console.log(`第二次响应: "${secondResponse.substring(0, 100)}${secondResponse.length > 100 ? '...' : ''}"`);

    console.log('\n📋 分析结果:');
    
    if (nameInSecondResponse) {
      console.log('✅ 会话保持测试: 成功');
      console.log('   第二次响应中包含了"张三"相关信息');
    } else {
      console.log('❌ 会话保持测试: 失败'); 
      console.log('   第二次响应中没有包含"张三"相关信息');
    }

    // Session ID 分析
    console.log('\n🆔 Session ID 分析:');
    const firstSessionIds = [...new Set(firstResult.messages.map(m => m.session_id))];
    const secondSessionIds = [...new Set(secondResult.messages.map(m => m.session_id))];
    
    console.log(`第一次查询 session_id: [${firstSessionIds.join(', ')}]`);
    console.log(`第二次查询 session_id: [${secondSessionIds.join(', ')}]`);
    
    const hasCommonSessionId = firstSessionIds.some(id => secondSessionIds.includes(id));
    if (hasCommonSessionId) {
      console.log('✅ 发现相同的 Session ID - 可能使用了同一会话');
    } else {
      console.log('❌ 没有相同的 Session ID - 使用了不同的会话');
    }

    // 选项分析
    console.log('\n⚙️ 选项效果分析:');
    console.log(`第一次查询选项: ${JSON.stringify(firstResult.options)}`);
    console.log(`第二次查询选项: ${JSON.stringify(secondResult.options)}`);
    
    const usedContinue = secondResult.options.continue === true;
    const usedResume = secondResult.options.resume;
    
    console.log(`使用了 continue: ${usedContinue ? '是' : '否'}`);
    console.log(`使用了 resume: ${usedResume ? `是 (${usedResume})` : '否'}`);
  }

  // 总结
  console.log('\n\n📝 测试总结');
  console.log('=' .repeat(80));
  
  const scenarios = Object.keys(groupedResults);
  console.log(`总测试场景数: ${scenarios.length}`);
  
  let successCount = 0;
  for (const [scenarioName, scenarioResults] of Object.entries(groupedResults)) {
    if (scenarioResults.length >= 2) {
      const secondResponse = scenarioResults[1].extractedContent.toLowerCase();
      const nameInSecondResponse = secondResponse.includes('张三') || 
                                    secondResponse.includes('张') ||
                                    secondResponse.includes('三');
      if (nameInSecondResponse) {
        successCount++;
        console.log(`✅ ${scenarioName}: 成功`);
      } else {
        console.log(`❌ ${scenarioName}: 失败`);
      }
    }
  }
  
  console.log(`\n总成功率: ${successCount}/${scenarios.length} (${((successCount/scenarios.length)*100).toFixed(1)}%)`);
  
  if (successCount > 0) {
    console.log('\n🎉 发现了有效的会话保持方法！');
  } else {
    console.log('\n😞 所有测试方法都未能实现会话保持');
  }
}

// 主函数执行
async function main(): Promise<void> {
  await testContinueResumeOptions();
}

// 执行测试
main().catch(console.error);

export { testContinueResumeOptions };