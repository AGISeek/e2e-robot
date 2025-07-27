# E2E Robot 快速启动指南

## 🚀 项目概览

E2E Robot 是基于 Claude AI 的智能端到端测试自动化系统，提供 CLI 和 Web 两种使用方式。

## 📦 项目结构

```
packages/
├── core/                   # 核心类型和工具
├── agents/                 # Claude agents 系统
├── cli/                    # 命令行工具
├── e2e-robot/             # CLI 主应用
└── web/                   # Web 界面应用
```

## ⚡ 快速启动

### 安装依赖
```bash
pnpm install
```

### 构建项目
```bash
pnpm build
```

## 🎯 使用方式

### 1. CLI 版本（开发者推荐）

#### 开发模式
```bash
pnpm dev
# 或
pnpm claude-agents
```

#### 生产模式
```bash
pnpm start
```

#### 功能特点
- ✅ 完整的 Claude agents 系统
- ✅ 智能配置检测和续传
- ✅ 历史测试结果分析
- ✅ 自动化调试和修复
- ✅ 详细的测试报告

### 2. Web 版本（用户友好）

#### 开发模式
```bash
pnpm dev:web
# 访问: http://localhost:3000
```

#### 生产模式
```bash
pnpm start:web
# 访问: http://localhost:3000
```

#### 功能特点
- ✅ 现代化 Web 界面
- ✅ Lovable.dev 风格设计
- ✅ 动态占位符提示
- ✅ 实时 AI 分析反馈
- ✅ 响应式设计

## 🔧 开发命令

### 全局命令
```bash
# 构建所有包
pnpm build

# 构建 Web 应用
pnpm build:web

# 清理构建产物
pnpm clean

# 同时运行所有开发服务
pnpm dev:all
```

### 单包命令
```bash
# 构建特定包
pnpm --filter @e2e-robot/core build
pnpm --filter @e2e-robot/agents build

# 开发特定包
pnpm --filter @e2e-robot/core dev
```

## 🎨 Web 界面特性

### 设计亮点
- 🎨 **现代设计**: 参考 Lovable.dev 的视觉风格
- 🌟 **毛玻璃效果**: 多层透明度和背景模糊
- ⚡ **动态交互**: 占位符轮播、微动画效果
- 📱 **响应式**: 完美适配所有设备
- 🌙 **深色模式**: 自动主题切换支持

### 用户体验
- 🔍 **智能输入**: 自动识别 URL 和文本描述
- 💡 **实时提示**: 5个动态占位符示例
- 📊 **即时反馈**: 分析结果实时展示
- ✨ **流畅动画**: 悬停效果和状态转换

## 🛠️ 配置要求

### 环境变量
```bash
# 必需
ANTHROPIC_API_KEY=your_api_key_here

# 可选
ANTHROPIC_BASE_URL=custom_base_url
```

### 系统要求
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **TypeScript**: >= 5.3.0

## 📝 使用示例

### CLI 模式
```bash
# 启动 CLI 版本
pnpm claude-agents

# 系统会自动：
# 1. 分析现有产出文件
# 2. 智能决定执行步骤
# 3. 提供交互式配置
# 4. 执行完整的 E2E 测试流程
```

### Web 模式
1. 启动 Web 服务：`pnpm dev:web`
2. 打开浏览器访问：http://localhost:3000
3. 在输入框中输入：
   - 网站 URL：`https://example.com`
   - 测试描述：`测试登录功能和购物车流程`
4. 点击分析按钮，获得 AI 生成的测试方案

## 🔍 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理并重新安装
pnpm clean
pnpm install
pnpm build
```

#### 2. Web 应用启动失败
```bash
# 确保先构建
pnpm build:web
pnpm start:web
```

#### 3. 类型错误
```bash
# 检查 TypeScript 配置
pnpm --filter @e2e-robot/core build
```

### 调试模式
```bash
# 启用详细日志
export DEBUG=e2e-robot:*
pnpm claude-agents
```

## 📚 文档索引

- [项目架构](./MONOREPO-GUIDE.md)
- [Web 设计说明](./WEB-DESIGN-UPDATE.md)
- [API 参考](./anthropic-ai-packages-api-reference.md)
- [使用指南](./USAGE.md)

## 🎯 推荐工作流

### 首次使用
1. `pnpm install` - 安装依赖
2. `pnpm build` - 构建项目
3. `pnpm dev:web` - 体验 Web 界面
4. `pnpm claude-agents` - 尝试 CLI 功能

### 日常开发
1. `pnpm dev:web` - Web 开发
2. `pnpm claude-agents` - 功能测试
3. `pnpm build` - 发布前构建

### 生产部署
1. `pnpm build` - 构建所有包
2. `pnpm start:web` - 启动 Web 服务
3. `pnpm start` - 启动 CLI 服务

---

🎉 **开始使用 E2E Robot，体验 AI 驱动的智能测试自动化！**