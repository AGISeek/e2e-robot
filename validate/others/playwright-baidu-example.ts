/**
 * Playwright 百度网站自动化示例
 * 
 * 这个脚本演示了如何使用 Playwright 来打开百度网站
 * 并进行基本的自动化操作
 */

import { chromium, type Browser, type Page } from 'playwright';

interface BrowserSession {
  browser: Browser;
  page: Page;
}

class PlaywrightBaiduExample {
  private browserSession: BrowserSession | null = null;

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
   * 打开百度网站并进行搜索
   */
  public async openBaiduAndSearch(): Promise<void> {
    try {
      console.log('🚀 开始 Playwright 百度示例...');
      
      // 初始化浏览器
      this.browserSession = await this.initBrowser();
      const { page } = this.browserSession;

      // 打开百度网站
      console.log('📱 正在打开百度网站...');
      await page.goto('https://baidu.com', { waitUntil: 'networkidle' });
      console.log('✅ 百度网站加载完成');

      // 等待页面完全加载
      await page.waitForTimeout(2000);

      // 获取页面标题
      const title = await page.title();
      console.log('📄 页面标题:', title);

      // 查找搜索框并输入内容
      console.log('🔍 执行搜索操作...');
      const searchInput = await page.locator('#kw');
      await searchInput.fill('Claude AI');
      console.log('✅ 搜索内容输入完成');

      // 点击搜索按钮
      const searchButton = await page.locator('#su');
      await searchButton.click();
      console.log('✅ 搜索按钮点击完成');

      // 等待搜索结果加载
      await page.waitForTimeout(3000);

      // 获取搜索结果数量
      const resultStats = await page.locator('.nums').textContent();
      console.log('📊 搜索结果统计:', resultStats || '未找到统计信息');

      // 截取页面截图
      console.log('📸 截取页面截图...');
      await page.screenshot({ 
        path: 'baidu-search.png',
        fullPage: true 
      });
      console.log('✅ 截图保存为 baidu-search.png');

      // 获取当前URL
      const currentUrl = page.url();
      console.log('🔗 当前URL:', currentUrl);

      console.log('🎉 所有操作完成！');

    } catch (error) {
      console.error('❌ 操作失败:', error);
      throw error;
    }
  }

  /**
   * 执行更复杂的操作示例
   */
  public async performAdvancedOperations(): Promise<void> {
    if (!this.browserSession) {
      throw new Error('浏览器会话未初始化');
    }

    const { page } = this.browserSession;

    try {
      console.log('🔧 执行高级操作...');

      // 示例1：获取页面元素信息
      const searchInput = await page.locator('#kw');
      const placeholder = await searchInput.getAttribute('placeholder');
      console.log('🔍 搜索框占位符:', placeholder || '未找到占位符');

      // 示例2：检查元素是否可见
      const isVisible = await searchInput.isVisible();
      console.log('👁️ 搜索框是否可见:', isVisible);

      // 示例3：获取页面所有链接
      const links = await page.locator('a').all();
      console.log('🔗 页面链接数量:', links.length);

      // 示例4：模拟键盘操作
      await searchInput.click();
      await page.keyboard.type('Playwright 自动化测试');
      await page.keyboard.press('Enter');
      console.log('⌨️ 键盘操作完成');

      // 等待搜索结果
      await page.waitForTimeout(3000);

      // 示例5：获取搜索结果
      const searchResults = await page.locator('.result').all();
      console.log('📋 搜索结果数量:', searchResults.length);

      // 示例6：点击第一个搜索结果
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        if (firstResult) {
          await firstResult.click();
          console.log('🖱️ 点击第一个搜索结果');
        }
        
        // 等待新页面加载
        await page.waitForTimeout(3000);
        
        // 返回百度首页
        await page.goBack();
        console.log('⬅️ 返回百度首页');
      }

    } catch (error) {
      console.error('❌ 高级操作失败:', error);
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
  const example = new PlaywrightBaiduExample();
  
  try {
    // 执行基本操作
    await example.openBaiduAndSearch();
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 执行高级操作
    await example.performAdvancedOperations();
    
    // 等待用户查看结果
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

export { PlaywrightBaiduExample }; 