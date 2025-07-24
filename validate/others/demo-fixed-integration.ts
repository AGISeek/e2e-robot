/**
 * 修复后的 Claude Code SDK + Playwright 集成演示
 * 
 * 这个脚本演示了修复后的集成功能，包括代码清理和错误处理
 */

import { query, type SDKMessage } from '@anthropic-ai/claude-code';
import { chromium, type Browser, type Page } from 'playwright';
import * as dotenv from 'dotenv';
import { SafeCodeExecutor } from './safe-code-executor.js';

dotenv.config();

interface BrowserSession {
  browser: Browser;
  page: Page;
}

class FixedClaudeIntegration {
  private browserSession: BrowserSession | null = null;
  private abortController: AbortController;
  private codeExecutor: SafeCodeExecutor;

  constructor() {
    this.abortController = new AbortController();
    this.codeExecutor = new SafeCodeExecutor();
  }

  /**
   * 初始化浏览器会话
   */
  private async initBrowser(): Promise<BrowserSession> {
    console.log('🌐 启动浏览器...');
    
    const browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ 浏览器启动成功');
    return { browser, page };
  }



  /**
   * 使用 Claude Code SDK 生成 Playwright 代码
   */
  private async generatePlaywrightCode(action: string, currentUrl?: string): Promise<string> {
    const prompt = `
你是一个网页自动化专家。请为以下操作生成 Playwright TypeScript 代码：

当前页面：${currentUrl || 'https://baidu.com'}
操作描述：${action}

请生成简洁、高效的 Playwright 代码，包含必要的错误处理。
代码应该：
1. 使用 async/await 语法
2. 包含适当的等待和错误处理
3. 只返回可执行的代码，不要包含任何 Markdown 标记或解释
4. 使用 page 对象进行操作
5. 不要包含 \`\`\`typescript 或 \`\`\` 标记

直接返回代码，格式如下：
await page.waitForSelector('#element');
await page.fill('#element', 'value');
await page.click('#button');
`;

    try {
      const messages: SDKMessage[] = [];
      
      for await (const message of query({
        prompt: prompt,
        abortController: this.abortController,
        options: {
          maxTurns: 1,
        },
      })) {
        messages.push(message);
      }

      // 获取最后一条助手消息的内容
      const lastAssistantMessage = messages
        .filter(msg => msg.type === 'assistant')
        .pop();

      if (lastAssistantMessage && lastAssistantMessage.type === 'assistant') {
        const content = lastAssistantMessage.message.content[0];
        if (content && content.type === 'text') {
          return content.text;
        }
      }
      
      throw new Error('无法获取有效的代码生成结果');
    } catch (error) {
      console.error('❌ Claude Code SDK 调用失败:', error);
      throw error;
    }
  }

  /**
   * 执行生成的 Playwright 代码
   */
  private async executePlaywrightCode(code: string, page: Page): Promise<void> {
    try {
      // 创建一个安全的执行上下文
      const context = {
        page,
        console: {
          log: (...args: unknown[]) => console.log('🌐 浏览器操作:', ...args),
          error: (...args: unknown[]) => console.error('❌ 浏览器错误:', ...args)
        }
      };

      // 使用安全的代码执行器
      await this.codeExecutor.executePlaywrightCode(code, context);
    } catch (error) {
      console.error('❌ Playwright 代码执行失败:', error);
      throw error;
    }
  }

  /**
   * 演示修复后的功能
   */
  public async demonstrateFixedFunctionality(): Promise<void> {
    try {
      console.log('🚀 开始修复后的 Claude Code SDK + Playwright 集成演示...');
      
      // 初始化浏览器
      this.browserSession = await this.initBrowser();
      const { page } = this.browserSession;

      // 打开百度网站
      console.log('📱 正在打开百度网站...');
      await page.goto('https://baidu.com', { waitUntil: 'networkidle' });
      console.log('✅ 百度网站加载完成');

      const currentUrl = page.url();
      console.log('🔗 当前URL:', currentUrl);

      await page.waitForTimeout(2000);

      // 演示1：搜索操作
      console.log('\n🔍 演示1：搜索操作');
      console.log('使用 Claude 生成搜索"Claude AI"的代码...');
      const searchCode = await this.generatePlaywrightCode(
        '在搜索框中输入"Claude AI"并点击搜索按钮',
        currentUrl
      );
      await this.executePlaywrightCode(searchCode, page);

      await page.waitForTimeout(3000);

      // 演示2：获取页面信息
      console.log('\n📊 演示2：获取页面信息');
      console.log('使用 Claude 生成获取页面信息的代码...');
      const infoCode = await this.generatePlaywrightCode(
        '获取页面标题和当前URL',
        page.url()
      );
      await this.executePlaywrightCode(infoCode, page);

      // 演示3：截图操作
      console.log('\n📸 演示3：截图操作');
      console.log('使用 Claude 生成截图代码...');
      const screenshotCode = await this.generatePlaywrightCode(
        '截取整个页面的截图并保存为 demo-screenshot.png',
        page.url()
      );
      await this.executePlaywrightCode(screenshotCode, page);

      console.log('\n🎉 修复后的集成演示完成！');
      console.log('✅ 所有操作都成功执行，没有出现代码执行错误');

    } catch (error) {
      console.error('❌ 演示失败:', error);
      throw error;
    }
  }

  /**
   * 关闭浏览器会话
   */
  public async closeBrowser(): Promise<void> {
    if (this.browserSession) {
      console.log('🛑 关闭浏览器...');
      await this.browserSession.browser.close();
      this.browserSession = null;
      console.log('✅ 浏览器已关闭');
    }
  }

  /**
   * 中止当前操作
   */
  public abort(): void {
    this.abortController.abort();
    console.log('🛑 操作已中止');
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

  const demo = new FixedClaudeIntegration();
  
  try {
    // 执行演示
    await demo.demonstrateFixedFunctionality();
    
    // 等待用户查看结果
    console.log('\n⏳ 等待 5 秒后自动关闭浏览器...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ 演示执行失败:', error);
  } finally {
    await demo.closeBrowser();
  }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FixedClaudeIntegration }; 