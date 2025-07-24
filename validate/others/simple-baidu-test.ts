/**
 * 简单的百度网站测试脚本
 * 
 * 这个脚本用于快速测试 Playwright 是否能正常打开百度网站
 */

import { chromium } from 'playwright';

async function simpleBaiduTest(): Promise<void> {
  console.log('🚀 开始简单的百度网站测试...');
  
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    slowMo: 2000, // 放慢操作速度
  });

  try {
    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('📱 正在打开百度网站...');
    await page.goto('https://baidu.com', { waitUntil: 'networkidle' });
    console.log('✅ 百度网站加载完成');
    
    // 获取页面标题
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    // 等待5秒让用户观察
    console.log('⏳ 等待 5 秒...');
    await page.waitForTimeout(5000);
    
    console.log('🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
    console.log('🛑 浏览器已关闭');
  }
}

// 运行测试
simpleBaiduTest().catch(console.error); 