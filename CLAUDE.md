# CLAUDE.md

本文件为在此代码库中工作的 Claude Code (claude.ai/code) 提供指导。

## 项目概述

这是一个使用 TypeScript 构建的 E2E 测试机器人框架，演示了 Claude Code SDK/CLI 与 Playwright 在 Web 自动化方面的集成。该项目专注于使用 Claude AI 生成和执行 Playwright 自动化代码。

## 常用命令

### 开发
- `pnpm dev` - 使用 tsx watch 模式启动开发服务器
- `pnpm build` - 使用 tsc 将 TypeScript 构建到 dist/ 目录
- `pnpm start` - 从 dist/index.js 运行构建的应用程序
- `pnpm clean` - 删除 dist/ 目录

### 运行示例
- `pnpm simple-test` - 基础 Playwright 测试（打开百度）
- `pnpm playwright-example` - 完整的 Playwright 自动化示例
- `pnpm claude-integration` - Claude Code SDK + Playwright 集成（需要 ANTHROPIC_API_KEY）
- `pnpm claude-code-sdk-example` - Claude CLI + Playwright 集成（需要安装 Claude CLI）
- `pnpm claude-cli-simple` - 简单的 Claude CLI 使用示例
- `pnpm demo-fixed` - 带代码清理的固定集成演示
- `pnpm test-code-cleaning` - 测试代码清理功能
- `pnpm test-safe-executor` - 测试安全代码执行

### Claude 集成的前置条件
- 设置 `ANTHROPIC_API_KEY` 环境变量
- 对于 CLI 示例：使用 `npm install -g @anthropic-ai/claude-code` 安装 Claude Code CLI

## 架构

### 核心类

**E2ERobot** (`src/index.ts`)
- 主要的机器人框架类，包含 init/start/stop 生命周期
- 为 E2E 测试执行提供基础
- 接口：`RobotConfig`，包含 name、version、timeout、retries

**ClaudePlaywrightIntegration** (`src/claude-playwright-integration.ts`)
- 集成 Claude Code SDK 与 Playwright
- 从自然语言描述生成 Playwright 代码
- 使用 `SafeCodeExecutor` 进行安全代码执行
- 方法：`openBaiduWithClaude()`、`interactiveMode()`、`getBrowserStatus()`

**ClaudeCodeSDKExample** (`src/claude-code-sdk-example.ts`)
- 使用 Claude Code CLI（命令行界面）而不是 SDK
- 类似功能但生成 CLI 进程
- 方法：`runBaiduAutomation()`、`runMultiTurnConversation()`

**SafeCodeExecutor** (`src/safe-code-executor.ts`)
- 提供生成的 Playwright 代码的安全执行
- 验证和清理代码（移除 markdown，检查危险模式）
- 方法：`executePlaywrightCode(code, context)`

### 关键模式

1. **代码生成流程**：自然语言 → Claude AI → Playwright TypeScript 代码 → 安全执行
2. **浏览器会话管理**：浏览器生命周期在集成类内管理
3. **错误处理**：在 finally 块中进行全面的 try/catch 清理
4. **安全性**：生成的代码在受控环境中验证和执行

## TypeScript 配置

- 目标：ES2022，模块：ESNext
- 启用严格模式和全面的类型检查
- ES 模块（package.json 中的 `"type": "module"`）
- 输出目录：`dist/`，源码：`src/`

## 依赖项

### 核心
- `@anthropic-ai/claude-code` - 用于 AI 集成的 Claude Code SDK
- `@anthropic-ai/sdk` - 直接 Claude API 访问
- `playwright` - 浏览器自动化框架
- `tsx` - TypeScript 执行和开发

### 开发
- `typescript` - TypeScript 编译器
- `@types/node` - Node.js 类型定义

## 开发说明

- 所有文件使用 ES 模块语法（import/export）
- 集成示例中的中文注释反映了原始项目文档
- 浏览器自动化默认在非无头模式下运行以进行演示
- 代码生成提示旨在产生干净、可执行的 Playwright 代码
- 安全执行防止危险的代码模式（eval、require、process 访问）