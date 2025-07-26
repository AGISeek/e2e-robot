/**
 * 交互式配置界面
 * 通过对话方式配置测试站点和测试要求
 */

import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TestConfig } from '@e2e-robot/core';

export class InteractiveConfig {
  private rl: readline.Interface;
  private config: Partial<TestConfig> = {};
  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  /**
   * 启动交互式配置流程
   */
  async startConfiguration(): Promise<TestConfig> {
    console.log('🤖 欢迎使用 Claude Code Agents 测试自动化系统');
    console.log('🔧 让我们通过对话来配置您的测试需求\n');
    
    // 加载已有配置（如果存在）
    await this.loadExistingConfig();
    
    // 开始配置对话
    await this.configureTargetSite();
    await this.configureTestRequirements();
    await this.configureTestTypes();
    await this.configureTestParameters();
    
    // 确认配置
    const finalConfig = await this.confirmConfiguration();
    
    // 保存配置
    await this.saveConfiguration(finalConfig);
    
    this.rl.close();
    return finalConfig;
  }
  
  /**
   * 加载已有配置
   */
  private async loadExistingConfig(): Promise<void> {
    try {
      const configPath = path.join(process.cwd(), 'claude-agents-output', 'test-config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const existingConfig = JSON.parse(configData);
      
      console.log('📋 发现已有配置:');
      console.log(`   网站: ${existingConfig.targetUrl}`);
      console.log(`   站点名: ${existingConfig.siteName}`);
      console.log(`   测试要求: ${existingConfig.testRequirements?.length || 0} 项`);
      
      const useExisting = await this.ask('是否要基于已有配置进行修改？(y/n): ');
      if (useExisting.toLowerCase() === 'y') {
        this.config = existingConfig;
        console.log('✅ 已加载现有配置\n');
      }
    } catch {
      console.log('📝 未发现已有配置，将创建新配置\n');
    }
  }
  
  /**
   * 配置目标站点
   */
  private async configureTargetSite(): Promise<void> {
    console.log('🌐 配置测试站点');
    
    // 获取目标URL
    const currentUrl = this.config.targetUrl || '';
    const urlPrompt = currentUrl ? 
      `请输入目标网站URL (当前: ${currentUrl}): ` : 
      '请输入目标网站URL: ';
    
    const targetUrl = await this.ask(urlPrompt);
    if (targetUrl.trim()) {
      this.config.targetUrl = targetUrl.trim();
    } else if (!this.config.targetUrl) {
      this.config.targetUrl = 'https://www.baidu.com'; // 默认值
    }
    
    // 获取站点名称
    const currentName = this.config.siteName || '';
    const namePrompt = currentName ? 
      `请输入站点名称 (当前: ${currentName}): ` : 
      '请输入站点名称 (用于测试报告): ';
    
    const siteName = await this.ask(namePrompt);
    if (siteName.trim()) {
      this.config.siteName = siteName.trim();
    } else if (!this.config.siteName) {
      // 从URL自动提取站点名
      try {
        const url = new URL(this.config.targetUrl);
        this.config.siteName = url.hostname.replace('www.', '');
      } catch {
        this.config.siteName = '测试站点';
      }
    }
    
    console.log(`✅ 目标站点: ${this.config.targetUrl}`);
    console.log(`✅ 站点名称: ${this.config.siteName}\n`);
  }
  
  /**
   * 配置测试要求
   */
  private async configureTestRequirements(): Promise<void> {
    console.log('📋 配置测试要求');
    console.log('请描述您的测试需求，每行一个要求，输入空行结束:');
    
    const requirements: string[] = [];
    
    // 显示已有要求
    if (this.config.testRequirements && this.config.testRequirements.length > 0) {
      console.log('\n当前已有测试要求:');
      this.config.testRequirements.forEach((req, index) => {
        console.log(`${index + 1}. ${req}`);
      });
      
      const keepExisting = await this.ask('\n是否保留已有要求？(y/n): ');
      if (keepExisting.toLowerCase() === 'y') {
        requirements.push(...this.config.testRequirements);
      }
    }
    
    console.log('\n添加新的测试要求:');
    console.log('💡 示例:');
    console.log('   - 测试首页加载功能');
    console.log('   - 验证搜索功能正常工作');
    console.log('   - 检查用户登录流程');
    console.log('   - 测试页面响应式设计\n');
    
    while (true) {
      const requirement = await this.ask(`要求 ${requirements.length + 1}: `);
      if (!requirement.trim()) break;
      
      requirements.push(requirement.trim());
      console.log(`✅ 已添加: ${requirement.trim()}`);
    }
    
    this.config.testRequirements = requirements;
    
    if (requirements.length === 0) {
      console.log('⚠️ 未指定具体要求，将使用通用测试要求');
      this.config.testRequirements = [
        '测试网站基本功能',
        '验证页面加载正常',
        '检查核心交互元素'
      ];
    }
    
    console.log(`\n✅ 总共配置了 ${this.config.testRequirements.length} 个测试要求\n`);
  }
  
  /**
   * 配置测试类型
   */
  private async configureTestTypes(): Promise<void> {
    console.log('🧪 配置测试类型');
    console.log('请选择需要的测试类型 (多选，用空格分隔，如: 1 2 3):');
    console.log('1. 功能测试 (基础功能验证)');
    console.log('2. 用户体验测试 (UI/UX测试)');
    console.log('3. 响应式测试 (移动端适配)');
    console.log('4. 性能测试 (加载速度测试)');
    console.log('5. 兼容性测试 (跨浏览器测试)');
    console.log('6. 安全测试 (基础安全检查)');
    
    const typeOptions = [
      'functional', 'ux', 'responsive', 'performance', 'compatibility', 'security'
    ];
    
    const typeNames = [
      '功能测试', '用户体验测试', '响应式测试', '性能测试', '兼容性测试', '安全测试'
    ];
    
    const selection = await this.ask('选择 (默认: 1 2): ');
    const selectedIndices = selection.trim() ? 
      selection.split(' ').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < 6) :
      [0, 1]; // 默认选择功能测试和用户体验测试
    
    this.config.testTypes = selectedIndices.map(i => typeOptions[i]).filter(type => type !== undefined);
    
    console.log('✅ 已选择测试类型:');
    selectedIndices.forEach(i => {
      console.log(`   - ${typeNames[i]}`);
    });
    console.log();
  }
  
  /**
   * 配置测试参数
   */
  private async configureTestParameters(): Promise<void> {
    console.log('⚙️ 配置测试参数');
    
    // 最大测试用例数
    const maxCasesStr = await this.ask('最大测试用例数 (默认: 20): ');
    this.config.maxTestCases = maxCasesStr.trim() ? 
      Math.max(1, parseInt(maxCasesStr) || 20) : 20;
    
    // 优先级
    const priorityStr = await this.ask('测试优先级 (low/medium/high, 默认: medium): ');
    const priority = priorityStr.toLowerCase().trim();
    this.config.priority = (['low', 'medium', 'high'].includes(priority) ? priority : 'medium') as 'low' | 'medium' | 'high';
    
    // 超时时间
    const timeoutStr = await this.ask('超时时间 (秒, 默认: 600): ');
    this.config.timeout = timeoutStr.trim() ? 
      Math.max(60, parseInt(timeoutStr) * 1000 || 600000) : 600000;
    
    // 其他默认配置
    this.config.workDir = path.join(process.cwd(), 'claude-agents-output');
    this.config.verbose = true;
    
    console.log(`✅ 最大测试用例: ${this.config.maxTestCases}`);
    console.log(`✅ 测试优先级: ${this.config.priority}`);
    console.log(`✅ 超时时间: ${this.config.timeout / 1000} 秒\n`);
  }
  
  /**
   * 确认配置
   */
  private async confirmConfiguration(): Promise<TestConfig> {
    console.log('📋 配置总结:');
    console.log('=' .repeat(50));
    console.log(`🌐 目标网站: ${this.config.targetUrl}`);
    console.log(`📝 站点名称: ${this.config.siteName}`);
    console.log(`📋 测试要求: ${this.config.testRequirements?.length} 项`);
    this.config.testRequirements?.forEach((req, i) => {
      console.log(`   ${i + 1}. ${req}`);
    });
    console.log(`🧪 测试类型: ${this.config.testTypes?.join(', ')}`);
    console.log(`📊 最大用例: ${this.config.maxTestCases}`);
    console.log(`⚡ 优先级: ${this.config.priority}`);
    console.log(`⏰ 超时时间: ${(this.config.timeout || 600000) / 1000} 秒`);
    console.log('=' .repeat(50));
    
    const confirmed = await this.ask('\n确认以上配置并开始测试？(y/n): ');
    
    if (confirmed.toLowerCase() !== 'y') {
      console.log('❌ 配置已取消');
      process.exit(0);
    }
    
    return this.config as TestConfig;
  }
  
  /**
   * 保存配置到文件
   */
  private async saveConfiguration(config: TestConfig): Promise<void> {
    try {
      const outputDir = path.dirname(config.workDir);
      await fs.mkdir(outputDir, { recursive: true });
      
      const configPath = path.join(config.workDir, 'test-config.json');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
      
      console.log(`\n💾 配置已保存至: ${configPath}`);
    } catch (error) {
      console.warn('⚠️ 保存配置失败:', error);
    }
  }
  
  /**
   * 提问并等待用户输入
   */
  private ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}