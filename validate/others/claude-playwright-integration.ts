/**
 * Claude Code SDK + Playwright 集成示例
 * 
 * 这个脚本演示了如何使用 Claude Code SDK
 * 结合 Playwright 来生成和执行网页自动化操作
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

class ClaudePlaywrightIntegration {
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
      headless: false, // 设置为 true 可以隐藏浏览器窗口
      slowMo: 1000, // 放慢操作速度，便于观察
    });

    const page = await browser.newPage();
    
    // 设置视口大小
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
   * 打开百度网站并使用 Claude 生成操作
   */
  public async openBaiduWithClaude(): Promise<void> {
    try {
      console.log('🚀 开始 Claude Code SDK + Playwright 集成示例...');
      
      // 初始化浏览器
      this.browserSession = await this.initBrowser();
      const { page } = this.browserSession;

      // 打开百度网站
      console.log('📱 正在打开百度网站...');
      await page.goto('https://baidu.com', { waitUntil: 'networkidle' });
      console.log('✅ 百度网站加载完成');

      const currentUrl = page.url();
      console.log('🔗 当前URL:', currentUrl);

      // 等待页面完全加载
      await page.waitForTimeout(2000);

      // 示例1：使用 Claude 生成搜索操作
      console.log('🔍 使用 Claude 生成搜索操作...');
      const searchCode = await this.generatePlaywrightCode(
        '在搜索框中输入"Claude AI"并点击搜索按钮',
        currentUrl
      );
      await this.executePlaywrightCode(searchCode, page);

      // 等待搜索结果加载
      await page.waitForTimeout(3000);

      // 示例2：使用 Claude 生成截图操作
      console.log('📸 使用 Claude 生成截图操作...');
      const screenshotCode = await this.generatePlaywrightCode(
        '截取整个页面的截图并保存为 baidu-claude-search.png',
        page.url()
      );
      await this.executePlaywrightCode(screenshotCode, page);

      // 示例3：使用 Claude 生成页面信息获取操作
      console.log('📊 使用 Claude 生成页面信息获取操作...');
      const infoCode = await this.generatePlaywrightCode(
        '获取页面标题、当前URL和搜索结果数量',
        page.url()
      );
      await this.executePlaywrightCode(infoCode, page);

      console.log('🎉 Claude Code SDK + Playwright 集成示例完成！');

    } catch (error) {
      console.error('❌ 操作失败:', error);
      throw error;
    }
  }

  /**
   * 交互式操作模式
   */
  public async interactiveMode(): Promise<void> {
    if (!this.browserSession) {
      throw new Error('浏览器会话未初始化');
    }

    const { page } = this.browserSession;
    
    console.log('🎮 进入交互式模式...');
    console.log('💡 你可以描述想要执行的操作，Claude 将生成相应的 Playwright 代码');
    console.log('📝 输入 "quit" 退出交互模式');

    // 这里可以扩展为真正的交互式输入
    // 目前使用预设的操作示例
    const actions = [
      '获取页面所有链接的数量',
      '点击第一个搜索结果',
      '返回百度首页',
      '在搜索框中输入"Playwright 自动化"'
    ];

    for (const action of actions) {
      console.log(`\n🔧 执行操作: ${action}`);
      
      try {
        const code = await this.generatePlaywrightCode(action, page.url());
        await this.executePlaywrightCode(code, page);
        await page.waitForTimeout(2000);
      } catch (error) {
        console.error(`❌ 操作失败: ${action}`, error);
      }
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
   * 获取浏览器会话状态
   */
  public getBrowserStatus(): { isActive: boolean } {
    return {
      isActive: this.browserSession !== null
    };
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
    console.log('💡 或者运行: ANTHROPIC_API_KEY="your-api-key" pnpm claude-integration');
    process.exit(1);
  }

  const integration = new ClaudePlaywrightIntegration();
  
  try {
    // 执行基本操作
    await integration.openBaiduWithClaude();
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 执行交互式操作
    await integration.interactiveMode();
    
    // 等待用户查看结果
    console.log('⏳ 等待 10 秒后自动关闭浏览器...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ 集成示例执行失败:', error);
  } finally {
    await integration.closeBrowser();
  }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudePlaywrightIntegration }; 