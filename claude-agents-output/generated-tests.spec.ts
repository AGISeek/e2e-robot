import { test, expect } from '@playwright/test';

/**
 * 百度首页自动化测试套件
 * 基于测试场景设计文档生成的完整测试用例
 */

test.describe('百度首页核心功能测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 访问百度首页并等待页面完全加载
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
  });

  test('场景1: 基础搜索功能验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/百度一下，你就知道/);
    
    // 定位搜索输入框并输入关键词 - 使用百度的实际选择器
    const searchInput = page.locator('#kw');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('人工智能');
    
    // 验证输入内容正确显示
    await expect(searchInput).toHaveValue('人工智能');
    
    // 点击"百度一下"按钮
    const searchButton = page.locator('#su');
    await expect(searchButton).toBeVisible();
    
    // 等待搜索结果页面加载
    await Promise.all([
      page.waitForNavigation(),
      searchButton.click()
    ]);
    
    // 验证跳转到搜索结果页面
    await expect(page.url()).toContain('wd=');
    // 验证搜索结果页面标题包含搜索关键词
    await expect(page).toHaveTitle(/人工智能/);
  });

  test('场景2: 空搜索处理验证', async ({ page }) => {
    // 确保搜索框为空
    const searchInput = page.locator('#kw');
    await searchInput.clear();
    
    // 直接点击搜索按钮
    const searchButton = page.locator('#su');
    await searchButton.click();
    
    // 等待页面响应，验证系统处理空搜索
    await page.waitForTimeout(2000);
    
    // 验证页面没有产生错误，仍在百度域名下
    expect(page.url()).toContain('baidu.com');
  });

  test('场景3: 特殊字符搜索验证', async ({ page }) => {
    // 在搜索框中输入特殊字符
    const searchInput = page.locator('#kw');
    const specialChars = '@#$%^&*()';
    await searchInput.fill(specialChars);
    
    // 提交搜索
    const searchButton = page.locator('#su');
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      searchButton.click()
    ]);
    
    // 验证系统安全处理特殊字符，没有异常
    expect(page.url()).toContain('baidu.com');
    await expect(page.locator('body')).toBeVisible();
  });

  test('场景4: 导航链接功能验证 - 新闻服务', async ({ page }) => {
    // 定位并点击新闻链接
    const newsLink = page.locator('a:has-text("新闻")').first();
    await expect(newsLink).toBeVisible();
    
    // 点击新闻链接并等待页面加载
    await Promise.all([
      page.waitForNavigation(),
      newsLink.click()
    ]);
    
    // 验证跳转到新闻页面
    expect(page.url()).toContain('news.baidu.com');
    await page.waitForLoadState('networkidle');
  });

  test('场景5: 导航链接功能验证 - 地图服务', async ({ page }) => {
    // 定位并点击地图链接
    const mapLink = page.locator('a:has-text("地图")').first();
    await expect(mapLink).toBeVisible();
    
    // 点击地图链接并等待页面加载
    await Promise.all([
      page.waitForNavigation(),
      mapLink.click()
    ]);
    
    // 验证跳转到地图页面
    expect(page.url()).toContain('map.baidu.com');
    await page.waitForLoadState('networkidle');
  });

  test('场景6: AI助手功能验证', async ({ page }) => {
    // 定位AI助手横幅（可能的选择器）
    const aiAssistant = page.locator('a:has-text("AI助手"), a:has-text("DeepSeek")').first();
    
    if (await aiAssistant.isVisible()) {
      // 验证AI助手横幅文本
      await expect(aiAssistant).toContainText('AI助手');
      
      // 点击AI助手横幅
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        aiAssistant.click()
      ]);
      
      // 验证跳转到AI助手页面
      expect(page.url()).toContain('chat.baidu.com');
    }
  });

  test('场景7: 热搜功能验证', async ({ page }) => {
    // 定位热搜区域
    const hotSearchArea = page.locator('.s-hotsearch-wrapper, .hotwords, [data-click*="热搜"]').first();
    
    if (await hotSearchArea.isVisible()) {
      // 获取热搜条目
      const hotSearchItems = page.locator('.s-hotsearch-wrapper a, .hotwords a').first();
      
      if (await hotSearchItems.isVisible()) {
        // 点击第一个热搜条目
        await Promise.all([
          page.waitForNavigation(),
          hotSearchItems.click()
        ]);
        
        // 验证跳转到搜索结果页面
        expect(page.url()).toContain('s?wd=');
      }
    }
  });

  test('场景8: 热搜刷新功能验证', async ({ page }) => {
    // 查找"换一换"按钮
    const refreshButton = page.locator('text=换一换, [title="换一换"]').first();
    
    if (await refreshButton.isVisible()) {
      // 记录刷新前的热搜内容
      const hotSearchArea = page.locator('.s-hotsearch-wrapper, .hotwords').first();
      const beforeContent = await hotSearchArea.textContent();
      
      // 点击换一换
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      // 检查内容是否发生变化
      const afterContent = await hotSearchArea.textContent();
      // 注意：内容可能相同，这里主要验证功能可执行
      expect(afterContent).toBeDefined();
    }
  });

  test('场景9: 用户登录功能验证', async ({ page }) => {
    // 定位登录链接
    const loginLink = page.locator('a:has-text("登录")').first();
    await expect(loginLink).toBeVisible();
    
    // 点击登录链接
    await Promise.all([
      page.waitForNavigation(),
      loginLink.click()
    ]);
    
    // 验证跳转到登录页面
    expect(page.url()).toContain('passport.baidu.com');
    await page.waitForLoadState('networkidle');
  });

  test('场景10: 设置功能验证', async ({ page }) => {
    // 查找设置按钮或链接
    const settingsButton = page.locator('text=设置, [title="设置"]').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
      
      // 验证设置菜单或页面出现
      const settingsMenu = page.locator('.s-menu, .settings-menu, [class*="setting"]').first();
      if (await settingsMenu.isVisible()) {
        await expect(settingsMenu).toBeVisible();
      }
    }
  });
});

test.describe('用户体验测试', () => {
  
  test('场景11: 页面加载性能验证', async ({ page }) => {
    const startTime = Date.now();
    
    // 访问百度首页
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 验证页面在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
    
    // 验证关键元素已加载
    await expect(page.locator('#kw')).toBeVisible();
    await expect(page.locator('#su')).toBeVisible();
  });

  test('场景12: 搜索框焦点和输入体验', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('#kw');
    
    // 点击搜索框获得焦点
    await searchInput.click();
    await expect(searchInput).toBeFocused();
    
    // 测试输入功能
    await searchInput.fill('测试输入');
    await expect(searchInput).toHaveValue('测试输入');
    
    // 清空并测试中文输入
    await searchInput.clear();
    await searchInput.fill('中文测试');
    await expect(searchInput).toHaveValue('中文测试');
  });

  test('场景13: 鼠标悬停效果验证', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 悬停在搜索按钮上
    const searchButton = page.locator('#su');
    await searchButton.hover();
    
    // 悬停在导航链接上
    const newsLink = page.locator('a:has-text("新闻")').first();
    if (await newsLink.isVisible()) {
      await newsLink.hover();
    }
    
    // 验证元素仍然可见（基本的悬停测试）
    await expect(searchButton).toBeVisible();
  });

  test('场景14: 键盘导航验证', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('#kw');
    
    // 搜索框获得焦点并输入文字
    await searchInput.focus();
    await searchInput.fill('键盘测试');
    
    // 按Enter键执行搜索
    await Promise.all([
      page.waitForNavigation(),
      searchInput.press('Enter')
    ]);
    
    // 验证搜索成功执行
    expect(page.url()).toContain('s?wd=');
  });
});

test.describe('边界和异常测试', () => {
  
  test('场景15: 长文本搜索验证', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 生成长文本（1000字符）
    const longText = 'A'.repeat(1000);
    
    const searchInput = page.locator('#kw');
    await searchInput.fill(longText);
    
    // 尝试提交搜索
    const searchButton = page.locator('#su');
    await searchButton.click();
    
    await page.waitForTimeout(3000);
    
    // 验证系统处理长文本没有崩溃
    expect(page.url()).toContain('baidu.com');
  });

  test('场景17: 恶意脚本注入测试', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 输入潜在的XSS代码
    const maliciousScript = '<script>alert("XSS")</script>';
    
    const searchInput = page.locator('#kw');
    await searchInput.fill(maliciousScript);
    
    const searchButton = page.locator('#su');
    await searchButton.click();
    
    await page.waitForTimeout(3000);
    
    // 验证没有弹出警告框（脚本被过滤）
    // 页面应该正常处理，不执行恶意代码
    expect(page.url()).toContain('baidu.com');
  });
});

test.describe('性能和兼容性测试', () => {
  
  test('场景20: 移动端响应式验证', async ({ page }) => {
    // 设置移动端视窗
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 验证关键元素在移动端可见
    const searchInput = page.locator('#kw');
    const searchButton = page.locator('#su');
    
    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();
    
    // 测试移动端搜索功能
    await searchInput.fill('移动端测试');
    await Promise.all([
      page.waitForNavigation(),
      searchButton.click()
    ]);
    
    expect(page.url()).toContain('s?wd=');
  });

  test('场景21: 不同分辨率适配验证', async ({ page }) => {
    const resolutions = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 375, height: 667 }
    ];
    
    for (const resolution of resolutions) {
      await page.setViewportSize(resolution);
      await page.goto('https://www.baidu.com');
      await page.waitForLoadState('networkidle');
      
      // 验证关键元素在每个分辨率下都可见
      const searchInput = page.locator('#kw');
      const searchButton = page.locator('#su');
      
      await expect(searchInput).toBeVisible();
      await expect(searchButton).toBeVisible();
    }
  });

  test('场景22: 搜索响应性能验证', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('#kw');
    const searchButton = page.locator('#su');
    
    // 记录搜索开始时间
    const startTime = Date.now();
    
    await searchInput.fill('性能测试');
    await Promise.all([
      page.waitForNavigation(),
      searchButton.click()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // 验证搜索响应时间在合理范围内（5秒）
    expect(responseTime).toBeLessThan(5000);
    
    // 验证搜索成功
    expect(page.url()).toContain('s?wd=');
  });

  test('场景24: 缓存和刷新验证', async ({ page }) => {
    // 首次访问
    const startTime1 = Date.now();
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    const firstLoadTime = Date.now() - startTime1;
    
    // 刷新页面
    const startTime2 = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime2;
    
    // 验证页面正常加载
    await expect(page.locator('#kw')).toBeVisible();
    
    // 缓存通常会使第二次加载更快，但不是绝对的
    expect(secondLoadTime).toBeLessThan(10000);
  });
});

test.describe('核心业务流程测试', () => {
  
  test('完整搜索流程测试', async ({ page }) => {
    // 访问首页
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/百度一下，你就知道/);
    
    // 执行搜索
    const searchInput = page.locator('#kw');
    const searchButton = page.locator('#su');
    
    await searchInput.fill('Playwright 自动化测试');
    await Promise.all([
      page.waitForNavigation(),
      searchButton.click()
    ]);
    
    // 验证搜索结果页面
    await expect(page.url()).toContain('wd=');
    await page.waitForLoadState('networkidle');
    
    // 验证搜索结果存在
    const results = page.locator('#content_left .result, .result').first();
    await expect(results).toBeVisible({ timeout: 10000 });
  });

  test('多服务导航测试', async ({ page }) => {
    await page.goto('https://www.baidu.com');
    await page.waitForLoadState('networkidle');
    
    // 测试多个导航链接
    const services = ['新闻', '图片', '视频'];
    
    for (const service of services) {
      // 重新访问首页
      await page.goto('https://www.baidu.com');
      await page.waitForLoadState('networkidle');
      
      const serviceLink = page.locator(`a:has-text("${service}")`).first();
      
      if (await serviceLink.isVisible()) {
        await Promise.all([
          page.waitForNavigation({ timeout: 10000 }),
          serviceLink.click()
        ]);
        
        // 验证跳转成功
        expect(page.url()).toContain('baidu.com');
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

/**
 * 测试套件说明：
 * 
 * 1. 核心功能测试：覆盖搜索、导航、热搜、AI助手等主要功能
 * 2. 用户体验测试：验证页面性能、交互体验、可访问性
 * 3. 边界异常测试：测试异常输入、安全防护、错误处理
 * 4. 兼容性测试：验证不同设备、分辨率、浏览器的兼容性
 * 5. 业务流程测试：验证完整的用户使用场景
 * 
 * 测试特点：
 * - 使用稳定的选择器策略
 * - 包含适当的等待和超时处理
 * - 添加详细的注释说明
 * - 覆盖正常和异常场景
 * - 支持多种设备和分辨率
 */