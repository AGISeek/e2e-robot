import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 为 Claude Code Agents 生成的测试提供配置
 */
export default defineConfig({
  // 测试目录
  testDir: './claude-agents-output',
  
  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器配置
  reporter: [
    ['html'],
    ['json', { outputFile: './claude-agents-output/test-results.json' }]
  ],
  
  // 全局测试配置
  use: {
    baseURL: 'https://www.baidu.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },

  // 项目配置 - 支持多种设备
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web 服务器配置（如果需要）
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});