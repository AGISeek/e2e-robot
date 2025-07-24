/**
 * Claude Code CLI 简单使用示例
 * 
 * 这个脚本演示了如何直接使用 Claude Code CLI
 * 来生成和执行简单的代码
 */

import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

class ClaudeCLISimple {
  /**
   * 使用 Claude Code CLI 生成代码
   */
  public async generateCode(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const claudeProcess = spawn('claude', [
        '-p', prompt,
        '--output-format', 'json'
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let output = '';
      let errorOutput = '';

      claudeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      claudeProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      claudeProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.result) {
              resolve(result.result);
            } else {
              reject(new Error('无法从 Claude CLI 获取有效结果'));
            }
          } catch (error) {
            reject(new Error(`解析 Claude CLI 输出失败: ${error}`));
          }
        } else {
          reject(new Error(`Claude CLI 执行失败 (${code}): ${errorOutput}`));
        }
      });

      claudeProcess.on('error', (error) => {
        reject(new Error(`启动 Claude CLI 失败: ${error.message}`));
      });
    });
  }

  /**
   * 生成 JavaScript 函数
   */
  public async generateJavaScriptFunction(description: string): Promise<string> {
    const prompt = `
请为以下描述生成一个 JavaScript 函数：

${description}

要求：
1. 只返回函数代码，不要包含解释
2. 使用现代 JavaScript 语法
3. 包含适当的错误处理
4. 添加必要的注释

示例格式：
\`\`\`javascript
function exampleFunction(param) {
  // 函数实现
  return result;
}
\`\`\`
`;

    return this.generateCode(prompt);
  }

  /**
   * 生成 TypeScript 接口
   */
  public async generateTypeScriptInterface(description: string): Promise<string> {
    const prompt = `
请为以下描述生成一个 TypeScript 接口：

${description}

要求：
1. 只返回接口定义，不要包含解释
2. 使用严格的类型定义
3. 包含必要的注释
4. 遵循 TypeScript 最佳实践

示例格式：
\`\`\`typescript
interface ExampleInterface {
  // 属性定义
  property: string;
}
\`\`\`
`;

    return this.generateCode(prompt);
  }

  /**
   * 生成测试用例
   */
  public async generateTestCases(functionName: string, description: string): Promise<string> {
    const prompt = `
请为以下函数生成测试用例：

函数名：${functionName}
函数描述：${description}

要求：
1. 使用 Jest 测试框架
2. 包含多个测试场景
3. 测试正常情况和边界情况
4. 只返回测试代码，不要包含解释

示例格式：
\`\`\`javascript
describe('${functionName}', () => {
  test('should handle normal case', () => {
    // 测试实现
  });
});
\`\`\`
`;

    return this.generateCode(prompt);
  }

  /**
   * 代码审查
   */
  public async reviewCode(code: string): Promise<string> {
    const prompt = `
请对以下代码进行审查：

\`\`\`
${code}
\`\`\`

请提供：
1. 代码质量评估
2. 潜在问题识别
3. 改进建议
4. 最佳实践建议

请用中文回答，格式清晰。
`;

    return this.generateCode(prompt);
  }
}

// 主函数
async function main(): Promise<void> {
  // 检查环境变量
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 请设置 ANTHROPIC_API_KEY 环境变量');
    console.log('💡 使用方法: export ANTHROPIC_API_KEY="your-api-key"');
    process.exit(1);
  }

  // 检查 Claude Code CLI 是否可用
  try {
    const { execSync } = require('child_process');
    execSync('claude --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Claude Code CLI 未安装或不可用');
    console.log('💡 请先安装: npm install -g @anthropic-ai/claude-code');
    process.exit(1);
  }

  const claude = new ClaudeCLISimple();
  
  try {
    console.log('🚀 开始 Claude Code CLI 简单使用示例...\n');

    // 示例1：生成 JavaScript 函数
    console.log('📝 示例1：生成 JavaScript 函数');
    console.log('生成一个计算斐波那契数列的函数...');
    const fibonacciCode = await claude.generateJavaScriptFunction(
      '生成一个计算斐波那契数列的函数，使用递归和迭代两种方式'
    );
    console.log('生成的代码:');
    console.log(fibonacciCode);
    console.log('---\n');

    // 示例2：生成 TypeScript 接口
    console.log('📝 示例2：生成 TypeScript 接口');
    console.log('生成一个用户配置接口...');
    const userConfigInterface = await claude.generateTypeScriptInterface(
      '生成一个用户配置接口，包含用户名、邮箱、偏好设置等属性'
    );
    console.log('生成的接口:');
    console.log(userConfigInterface);
    console.log('---\n');

    // 示例3：生成测试用例
    console.log('📝 示例3：生成测试用例');
    console.log('为斐波那契函数生成测试用例...');
    const testCases = await claude.generateTestCases(
      'fibonacci',
      '计算斐波那契数列的函数'
    );
    console.log('生成的测试用例:');
    console.log(testCases);
    console.log('---\n');

    // 示例4：代码审查
    console.log('📝 示例4：代码审查');
    const sampleCode = `
function calculateSum(a, b) {
  return a + b;
}

function divideNumbers(a, b) {
  return a / b;
}
`;
    console.log('审查示例代码...');
    const review = await claude.reviewCode(sampleCode);
    console.log('代码审查结果:');
    console.log(review);

    console.log('\n🎉 Claude Code CLI 简单使用示例完成！');

  } catch (error) {
    console.error('❌ 示例执行失败:', error);
  }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudeCLISimple }; 