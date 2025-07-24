/**
 * 安全的代码执行器
 * 
 * 提供安全的代码执行功能，支持 async/await 语法
 */

interface ExecutionContext {
  page: any;
  console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
}

class SafeCodeExecutor {
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
   * 验证代码安全性
   */
  private validateCode(code: string): void {
    // 检查是否包含危险的代码模式
    const dangerousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /process\./i,
      /require\s*\(/i,
      /import\s*\(/i,
      /global\s*\./i,
      /window\s*\./i,
      /document\s*\./i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`代码包含潜在危险模式: ${pattern.source}`);
      }
    }
  }

  /**
   * 安全执行 Playwright 代码
   */
  public async executePlaywrightCode(code: string, context: ExecutionContext): Promise<void> {
    try {
      console.log('🔧 生成的代码:');
      console.log(code);
      console.log('---');

      // 清理生成的代码
      const cleanedCode = this.cleanGeneratedCode(code);
      console.log('🧹 清理后的代码:');
      console.log(cleanedCode);
      console.log('---');

      // 验证代码安全性
      this.validateCode(cleanedCode);
      console.log('✅ 代码安全性验证通过');

      // 创建安全的执行环境
      const safeContext = {
        page: context.page,
        console: context.console,
        // 只暴露安全的全局对象
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Date: Date,
        Math: Math,
        JSON: JSON,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Boolean: Boolean,
        RegExp: RegExp,
        Error: Error,
        Promise: Promise
      };

      // 创建 async 函数包装器
      const asyncFunction = new Function(
        'page', 'console', 'setTimeout', 'clearTimeout', 'Date', 'Math', 'JSON', 
        'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'Promise',
        `
        return (async () => {
          ${cleanedCode}
        })();
      `);

      // 执行 async 函数
      await asyncFunction(
        safeContext.page, 
        safeContext.console,
        safeContext.setTimeout,
        safeContext.clearTimeout,
        safeContext.Date,
        safeContext.Math,
        safeContext.JSON,
        safeContext.Array,
        safeContext.Object,
        safeContext.String,
        safeContext.Number,
        safeContext.Boolean,
        safeContext.RegExp,
        safeContext.Error,
        safeContext.Promise
      );
      
      console.log('✅ Playwright 代码执行成功');
    } catch (error) {
      console.error('❌ Playwright 代码执行失败:', error);
      throw error;
    }
  }

  /**
   * 执行简单的 JavaScript 代码
   */
  public async executeJavaScriptCode(code: string, context: Record<string, any> = {}): Promise<any> {
    try {
      console.log('🔧 生成的 JavaScript 代码:');
      console.log(code);
      console.log('---');

      // 清理生成的代码
      const cleanedCode = this.cleanGeneratedCode(code);
      console.log('🧹 清理后的代码:');
      console.log(cleanedCode);
      console.log('---');

      // 验证代码安全性
      this.validateCode(cleanedCode);
      console.log('✅ 代码安全性验证通过');

      // 创建安全的执行环境
      const safeContext = {
        ...context,
        console: {
          log: (...args: unknown[]) => console.log('🌐 执行输出:', ...args),
          error: (...args: unknown[]) => console.error('❌ 执行错误:', ...args)
        },
        // 只暴露安全的全局对象
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Date: Date,
        Math: Math,
        JSON: JSON,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Boolean: Boolean,
        RegExp: RegExp,
        Error: Error,
        Promise: Promise
      };

      // 创建 async 函数包装器
      const asyncFunction = new Function(
        ...Object.keys(safeContext),
        `
        return (async () => {
          ${cleanedCode}
        })();
      `);

      // 执行 async 函数
      const result = await asyncFunction(...Object.values(safeContext));
      
      console.log('✅ JavaScript 代码执行成功');
      return result;
    } catch (error) {
      console.error('❌ JavaScript 代码执行失败:', error);
      throw error;
    }
  }
}

// 测试函数
export function testSafeCodeExecutor(): void {
  const executor = new SafeCodeExecutor();
  
  console.log('🧪 测试安全代码执行器...\n');

  // 测试 Playwright 代码执行
  const playwrightCode = `
await page.waitForSelector('#kw');
await page.fill('#kw', 'test');
await page.click('#su');
  `;

  const mockContext = {
    page: {
      waitForSelector: async (selector: string) => console.log(`等待选择器: ${selector}`),
      fill: async (selector: string, value: string) => console.log(`填充 ${selector}: ${value}`),
      click: async (selector: string) => console.log(`点击: ${selector}`)
    },
    console: {
      log: (...args: unknown[]) => console.log('🌐 浏览器操作:', ...args),
      error: (...args: unknown[]) => console.error('❌ 浏览器错误:', ...args)
    }
  };

  executor.executePlaywrightCode(playwrightCode, mockContext)
    .then(() => console.log('✅ Playwright 代码执行测试通过'))
    .catch(error => console.error('❌ Playwright 代码执行测试失败:', error));

  // 测试 JavaScript 代码执行
  const jsCode = `
const result = Math.max(1, 2, 3);
console.log('最大值:', result);
return result;
  `;

  executor.executeJavaScriptCode(jsCode)
    .then(result => console.log('✅ JavaScript 代码执行测试通过，结果:', result))
    .catch(error => console.error('❌ JavaScript 代码执行测试失败:', error));
}

export { SafeCodeExecutor }; 