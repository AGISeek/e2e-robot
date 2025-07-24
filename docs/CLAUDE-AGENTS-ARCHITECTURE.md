# Claude Code Agents 架构文档

基于 SOLID 原则的模块化测试自动化系统，通过 Claude Code 完成完整的测试流程。

## 🏗️ 架构设计

### SOLID 原则应用

- **S** - Single Responsibility: 每个 Agent 只负责一个特定任务
- **O** - Open/Closed: 通过接口扩展功能，无需修改现有代码
- **L** - Liskov Substitution: 所有 Agent 都继承自 BaseAgent
- **I** - Interface Segregation: 精简的接口设计，各司其职
- **D** - Dependency Inversion: 依赖抽象而非具体实现

## 📂 文件结构

```
src/agents/
├── types.ts                 # 类型定义和基础抽象类 (60行)
├── claude-executor.ts       # Claude Code 执行器 (80行)
├── website-analyzer.ts      # 网站分析代理 (70行)
├── scenario-generator.ts    # 场景生成代理 (75行)
├── testcase-generator.ts    # 测试用例生成代理 (80行)
├── test-runner.ts          # 测试执行代理 (95行)
└── orchestrator.ts         # 主协调器 (85行)
```

## 🔄 工作流程

### 1. 网站分析 (WebsiteAnalyzer)
- 🎯 **目标**: 使用 Claude Code + Playwright MCP 分析目标网站
- 📝 **输出**: `website-analysis.md` - 包含页面结构、可交互元素、用户场景分析
- 🔧 **实现**: Claude Code 使用 Playwright MCP 工具访问网站，使用 Write 工具保存分析结果

### 2. 场景生成 (ScenarioGenerator)
- 🎯 **目标**: 基于网站分析生成测试场景文档
- 📝 **输出**: `test-scenarios.md` - 详细的测试场景设计
- 📖 **输入**: 读取 `website-analysis.md`，Claude Code 使用 Write 工具保存场景文档

### 3. 测试用例生成 (TestCaseGenerator)
- 🎯 **目标**: 将测试场景转换为 Playwright 代码
- 📝 **输出**: `generated-tests.spec.ts` - 可执行的测试代码
- 📖 **输入**: 读取 `test-scenarios.md`，Claude Code 使用 Write 工具保存测试代码

### 4. 测试执行 (TestRunner)
- 🎯 **目标**: 执行生成的测试并生成报告
- 📝 **输出**: `test-report.md` - 测试执行结果报告
- ⚙️ **工具**: 直接调用 Playwright 执行测试

## 🚀 使用方法

```bash
# 运行完整的自动化测试流程
pnpm claude-agents
```

## 🔧 核心组件

### BaseAgent 抽象类
```typescript
abstract class BaseAgent {
  protected config: AgentConfig;
  protected log(message: string): void;
  protected logError(error: string): void;
  abstract execute(...args: any[]): Promise<AgentResult>;
}
```

### ClaudeExecutor
- 封装 Claude Code CLI 调用
- 支持超时控制和错误处理
- 实时输出执行过程

### TestAutomationOrchestrator
- 协调所有 Agent 的执行顺序
- 处理 Agent 间的数据传递
- 提供统一的错误处理和日志

## 📊 输出文件

执行完成后在 `claude-agents-output/` 目录生成：

1. **website-analysis.md** - 网站分析报告
2. **test-scenarios.md** - 测试场景设计文档  
3. **generated-tests.spec.ts** - Playwright 测试代码
4. **test-report.md** - 测试执行报告

## ✨ 核心特性

### 🤖 完全基于 Claude Code
- 所有智能分析和生成都通过 Claude Code 完成
- 利用 Playwright MCP 进行网站交互
- 不依赖直接的 SDK 调用

### 🔄 实时输出
- 所有 Claude Code 执行过程实时显示在控制台
- 透明的执行过程，便于调试和监控

### 📁 文件驱动
- 各阶段通过文件传递数据
- 可追溯的完整工作流程
- 支持中断和恢复

### 🛡️ 容错设计
- 每个 Agent 独立的错误处理
- 详细的日志和错误信息
- 优雅的失败处理

## 🔧 扩展性

### 添加新的 Agent
1. 继承 `BaseAgent` 类
2. 实现 `execute` 方法
3. 在 `Orchestrator` 中集成

### 自定义 Claude 提示词
- 每个 Agent 都有独立的提示词构建方法
- 可以根据需要调整提示词策略

### 支持不同测试框架
- 通过修改 `TestCaseGenerator` 支持其他测试框架
- 保持接口不变，替换实现

## 🎯 优势

1. **模块化**: 每个功能独立，易于维护和扩展
2. **可复用**: 各 Agent 可独立使用
3. **透明**: 完整的执行过程可见
4. **智能**: 充分利用 Claude AI 的分析能力
5. **实用**: 生成可直接运行的测试代码

这个架构展示了如何将 AI 能力与传统软件工程最佳实践相结合，创建一个既智能又可维护的测试自动化系统。