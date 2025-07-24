/**
 * Claude Code SDK 命令行集成示例
 * 
 * 这个脚本演示了如何使用 Claude Code SDK 的命令行方式
 * 来生成和执行 Playwright 代码
 */

import { spawn } from 'child_process';
import { chromium, type Browser, type Page } from 'playwright';
import * as dotenv from 'dotenv';
import { SafeCodeExecutor } from './safe-code-executor.js';

dotenv.config();

interface BrowserSession {
  browser: Browser;
  page: Page;
}

class ClaudeCodeSDKExample {
  private browserSession: BrowserSession | null = null;
  private codeExecutor: SafeCodeExecutor;

  constructor() {
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
   * 使用 Claude Code CLI 生成 Playwright 代码
   */
  private async generatePlaywrightCodeWithCLI(action: string, currentUrl?: string): Promise<string> {
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
   * 执行生成的 Playwright 代码
   */
  private async executePlaywrightCode(code: string, page: Page): Promise<void> {
    try {
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
   * 使用 Claude Code CLI 进行百度网站自动化
   */
  public async runBaiduAutomation(): Promise<void> {
    try {
      console.log('🚀 开始 Claude Code CLI + Playwright 集成示例...');
      
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

      // 示例1：搜索操作
      console.log('🔍 使用 Claude Code CLI 生成搜索操作...');
      const searchCode = await this.generatePlaywrightCodeWithCLI(
        '在搜索框中输入"Claude AI"并点击搜索按钮',
        currentUrl
      );
      await this.executePlaywrightCode(searchCode, page);

      await page.waitForTimeout(3000);

      // 示例2：截图操作
      console.log('📸 使用 Claude Code CLI 生成截图操作...');
      const screenshotCode = await this.generatePlaywrightCodeWithCLI(
        '截取整个页面的截图并保存为 baidu-claude-search.png',
        page.url()
      );
      await this.executePlaywrightCode(screenshotCode, page);

      // 示例3：页面信息获取
      console.log('📊 使用 Claude Code CLI 生成页面信息获取操作...');
      const infoCode = await this.generatePlaywrightCodeWithCLI(
        '获取页面标题、当前URL和搜索结果数量',
        page.url()
      );
      await this.executePlaywrightCode(infoCode, page);

      console.log('🎉 Claude Code CLI + Playwright 集成示例完成！');

    } catch (error) {
      console.error('❌ 操作失败:', error);
      throw error;
    }
  }

  /**
   * 使用 Claude Code CLI 进行多轮对话
   */
  public async runMultiTurnConversation(): Promise<void> {
    if (!this.browserSession) {
      throw new Error('浏览器会话未初始化');
    }

    const { page } = this.browserSession;
    
    console.log('🎮 开始多轮对话示例...');

    const actions = [
      '获取页面所有链接的数量',
      '点击第一个搜索结果',
      '返回百度首页',
      '在搜索框中输入"Playwright 自动化"'
    ];

    for (const action of actions) {
      console.log(`\n🔧 执行操作: ${action}`);
      
      try {
        const code = await this.generatePlaywrightCodeWithCLI(action, page.url());
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
}

// 主函数
async function main(): Promise<void> {
  // 检查环境变量
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 请设置 ANTHROPIC_API_KEY 环境变量');
    console.log('💡 使用方法: export ANTHROPIC_API_KEY="your-api-key"');
    console.log('💡 或者运行: ANTHROPIC_API_KEY="your-api-key" pnpm claude-code-sdk-example');
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

  const example = new ClaudeCodeSDKExample();
  
  try {
    // 执行基本操作
    await example.runBaiduAutomation();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 执行多轮对话
    await example.runMultiTurnConversation();
    
    console.log('⏳ 等待 10 秒后自动关闭浏览器...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ 示例执行失败:', error);
  } finally {
    await example.closeBrowser();
  }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudeCodeSDKExample }; 