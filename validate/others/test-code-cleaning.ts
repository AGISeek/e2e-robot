/**
 * 测试代码清理功能
 */

class CodeCleaner {
  /**
   * 清理生成的代码，移除 Markdown 标记
   */
  private cleanGeneratedCode(code: string): string {
    // 移除 Markdown 代码块标记
    let cleanedCode = code
      .replace(/```typescript\s*/gi, '')
      .replace(/```javascript\s*/gi, '')
      .replace(/```js\s*/gi, '')
      .replace(/```\s*$/gm, '')
      .trim();

    // 如果代码为空或只包含空白字符，抛出错误
    if (!cleanedCode || cleanedCode.length === 0) {
      throw new Error('生成的代码为空或无效');
    }

    return cleanedCode;
  }

  /**
   * 测试代码清理功能
   */
  public testCodeCleaning(): void {
    console.log('🧪 测试代码清理功能...\n');

    const testCases = [
      {
        name: '包含 TypeScript 标记的代码',
        input: '```typescript\nawait page.waitForSelector("#kw");\nawait page.fill("#kw", "test");\n```',
        expected: 'await page.waitForSelector("#kw");\nawait page.fill("#kw", "test");'
      },
      {
        name: '包含 JavaScript 标记的代码',
        input: '```javascript\nawait page.click("#button");\nawait page.waitForTimeout(1000);\n```',
        expected: 'await page.click("#button");\nawait page.waitForTimeout(1000);'
      },
      {
        name: '包含 JS 标记的代码',
        input: '```js\nconsole.log("Hello");\n```',
        expected: 'console.log("Hello");'
      },
      {
        name: '纯代码（无标记）',
        input: 'await page.goto("https://example.com");\nawait page.waitForLoadState();',
        expected: 'await page.goto("https://example.com");\nawait page.waitForLoadState();'
      },
      {
        name: '多行代码块',
        input: '```typescript\nawait page.waitForSelector("#kw");\nawait page.fill("#kw", "Claude AI");\nawait page.click("#su");\n```',
        expected: 'await page.waitForSelector("#kw");\nawait page.fill("#kw", "Claude AI");\nawait page.click("#su");'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📝 测试: ${testCase.name}`);
      console.log('输入:');
      console.log(testCase.input);
      
      try {
        const result = this.cleanGeneratedCode(testCase.input);
        console.log('输出:');
        console.log(result);
        
        const isSuccess = result === testCase.expected;
        console.log(`结果: ${isSuccess ? '✅ 通过' : '❌ 失败'}`);
        
        if (!isSuccess) {
          console.log('期望:');
          console.log(testCase.expected);
        }
      } catch (error) {
        console.log(`结果: ❌ 错误 - ${error}`);
      }
      
      console.log('---\n');
    }
  }

  /**
   * 测试错误情况
   */
  public testErrorCases(): void {
    console.log('🚨 测试错误情况...\n');

    const errorCases = [
      {
        name: '空代码',
        input: ''
      },
      {
        name: '只有空白字符',
        input: '   \n  \t  \n  '
      },
      {
        name: '只有标记',
        input: '```typescript\n```'
      }
    ];

    for (const testCase of errorCases) {
      console.log(`📝 测试: ${testCase.name}`);
      console.log('输入:');
      console.log(`"${testCase.input}"`);
      
      try {
        const result = this.cleanGeneratedCode(testCase.input);
        console.log('输出:');
        console.log(result);
        console.log('结果: ❌ 应该抛出错误但没有');
      } catch (error) {
        console.log(`结果: ✅ 正确抛出错误 - ${error}`);
      }
      
      console.log('---\n');
    }
  }
}

// 主函数
function main(): void {
  const cleaner = new CodeCleaner();
  
  console.log('🚀 开始代码清理功能测试...\n');
  
  // 测试正常情况
  cleaner.testCodeCleaning();
  
  // 测试错误情况
  cleaner.testErrorCases();
  
  console.log('🎉 代码清理功能测试完成！');
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CodeCleaner }; 