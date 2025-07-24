# E2E Robot

一个基于TypeScript的端到端测试机器人框架，使用tsx进行开发和构建。

## 功能特性

- 🚀 基于TypeScript的现代化开发体验
- ⚡ 使用tsx进行快速开发和构建
- 🔧 严格的类型检查和ES模块支持
- 📦 简洁的项目结构和配置

## 项目结构

```
e2e-robot/
├── src/
│   ├── index.ts                          # 主入口文件
│   ├── simple-baidu-test.ts              # 简单百度测试
│   ├── playwright-baidu-example.ts       # 完整 Playwright 示例
│   ├── claude-playwright-integration.ts  # Claude Code SDK + Playwright 集成
│   ├── claude-code-sdk-example.ts        # Claude Code CLI + Playwright 集成
│   ├── claude-cli-simple.ts              # Claude Code CLI 简单使用示例
│   ├── test-code-cleaning.ts             # 代码清理功能测试
│   └── demo-fixed-integration.ts         # 修复后的集成演示
├── dist/                 # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目文档
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动开发服务器，支持热重载：

```bash
pnpm dev
```

### 构建项目

构建生产版本：

```bash
pnpm build
```

### 运行生产版本

```bash
pnpm start
```

### Playwright 示例

#### 简单测试
快速测试 Playwright 是否能正常打开百度网站：

```bash
pnpm simple-test
```

#### 完整示例
运行完整的 Playwright 百度网站自动化示例：

```bash
pnpm playwright-example
```

#### Claude Code SDK + Playwright 集成
使用 Claude Code SDK 生成 Playwright 代码并执行（需要设置 API Key）：

```bash
# 设置 API Key
export ANTHROPIC_API_KEY="your-api-key"

# 运行 SDK 集成示例
pnpm claude-integration
```

#### Claude Code CLI + Playwright 集成
使用 Claude Code CLI 命令行方式生成 Playwright 代码并执行（需要安装 CLI）：

```bash
# 安装 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 设置 API Key
export ANTHROPIC_API_KEY="your-api-key"

# 运行 CLI 集成示例
pnpm claude-code-sdk-example
```

#### Claude Code CLI 简单使用示例
使用 Claude Code CLI 进行代码生成和审查：

```bash
# 安装 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 设置 API Key
export ANTHROPIC_API_KEY="your-api-key"

# 运行简单使用示例
pnpm claude-cli-simple
```

#### 修复后的集成演示
运行修复后的集成演示，展示代码清理功能：

```bash
# 设置 API Key
export ANTHROPIC_API_KEY="your-api-key"

# 运行修复后的演示
pnpm demo-fixed
```

#### 代码清理功能测试
测试代码清理功能是否正常工作：

```bash
# 运行代码清理测试
pnpm test-code-cleaning
```

### 清理构建文件

```bash
pnpm clean
```

## 开发指南

### 脚本说明

- `pnpm dev`: 使用tsx watch模式启动开发服务器
- `pnpm build`: 使用tsc构建生产版本
- `pnpm start`: 运行构建后的生产版本
- `pnpm simple-test`: 运行简单的百度网站测试
- `pnpm playwright-example`: 运行完整的 Playwright 示例
- `pnpm claude-integration`: 运行 Claude Code SDK + Playwright 集成示例
- `pnpm claude-code-sdk-example`: 运行 Claude Code CLI + Playwright 集成示例
- `pnpm claude-cli-simple`: 运行 Claude Code CLI 简单使用示例
- `pnpm demo-fixed`: 运行修复后的集成演示
- `pnpm test-code-cleaning`: 运行代码清理功能测试
- `pnpm clean`: 清理dist目录

### TypeScript配置

项目使用严格的TypeScript配置：

- 目标: ES2022
- 模块: ESNext
- 严格模式: 启用
- 类型检查: 严格

### 代码规范

- 使用ES模块语法
- 严格的类型定义
- 清晰的代码注释
- 遵循TypeScript最佳实践

## 核心类

### E2ERobot

主要的机器人类，提供以下功能：

- `init()`: 初始化机器人
- `start()`: 启动机器人
- `stop()`: 停止机器人
- `getStatus()`: 获取机器人状态

### PlaywrightBaiduExample

Playwright 百度网站自动化示例类：

- `openBaiduAndSearch()`: 打开百度网站并执行搜索
- `performAdvancedOperations()`: 执行高级操作
- `closeBrowser()`: 关闭浏览器会话
- `getBrowserStatus()`: 获取浏览器状态

### ClaudePlaywrightIntegration

Claude Code SDK + Playwright 集成类：

- `openBaiduWithClaude()`: 使用 Claude Code SDK 生成代码操作百度网站
- `interactiveMode()`: 交互式操作模式
- `closeBrowser()`: 关闭浏览器会话
- `getBrowserStatus()`: 获取浏览器状态
- `abort()`: 中止当前操作

### ClaudeCodeSDKExample

Claude Code CLI + Playwright 集成类：

- `runBaiduAutomation()`: 使用 Claude Code CLI 进行百度网站自动化
- `runMultiTurnConversation()`: 多轮对话示例
- `closeBrowser()`: 关闭浏览器会话
- `getBrowserStatus()`: 获取浏览器状态

### ClaudeCLISimple

Claude Code CLI 简单使用类：

- `generateCode()`: 使用 Claude Code CLI 生成代码
- `generateJavaScriptFunction()`: 生成 JavaScript 函数
- `generateTypeScriptInterface()`: 生成 TypeScript 接口
- `generateTestCases()`: 生成测试用例
- `reviewCode()`: 代码审查

### RobotConfig

机器人配置接口：

```typescript
interface RobotConfig {
  name: string;      // 机器人名称
  version: string;   // 版本号
  timeout: number;   // 超时时间(ms)
  retries: number;   // 重试次数
}
```

## 扩展开发

### 添加新的测试场景

在`src/index.ts`的`run()`方法中添加你的E2E测试逻辑：

```typescript
private async run(): Promise<void> {
  console.log('🏃 Running E2E tests...');
  
  // 添加你的测试场景
  await this.runLoginTest();
  await this.runNavigationTest();
  await this.runDataValidationTest();
}
```

### 添加新的依赖

```bash
pnpm add <package-name>        # 添加生产依赖
pnpm add -D <package-name>     # 添加开发依赖
```

## 技术栈

- **TypeScript**: 5.3.0
- **tsx**: 4.6.0 (TypeScript执行器)
- **Playwright**: 1.54.1 (浏览器自动化)
- **Anthropic Claude Code SDK**: 1.0.58 (AI代码生成)
- **Anthropic Claude API**: 0.57.0 (备用API)
- **Node.js**: 类型定义支持

## 许可证

ISC 