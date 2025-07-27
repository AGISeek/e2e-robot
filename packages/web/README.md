# E2E Robot Web Interface

基于 Next.js + TypeScript + shadcn/ui 构建的 E2E Robot Web 应用界面。

## 🚀 功能特性

- ✨ **智能分析界面**: 简洁优雅的用户界面
- 🤖 **AI 集成**: 基于 Claude AI 的智能测试分析
- 📱 **响应式设计**: 完美适配桌面和移动端
- 🎨 **现代 UI**: 使用 shadcn/ui 组件库
- ⚡ **快速开发**: Next.js 14 + TypeScript

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **状态管理**: React Hooks

## 📁 项目结构

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   └── analyze/       # 分析接口
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   └── ui/                # shadcn/ui 组件
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   └── lib/
│       └── utils.ts           # 工具函数
├── public/                    # 静态资源
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## 🎯 页面功能

### 首页 (`/`)
- **标题**: E2E Robot 大标题展示
- **介绍**: 简洁的功能介绍
- **输入框**: 支持输入网站 URL 或测试需求描述
- **智能分析**: 基于输入内容提供 AI 分析结果
- **功能卡片**: 展示核心功能特性

### API 接口 (`/api/analyze`)
- **POST** `/api/analyze`: 分析用户输入
  - 支持 URL 和文本描述两种输入
  - 集成 E2E Robot agents 系统
  - 返回智能分析结果

## 🚀 开发指南

### 启动开发服务器
```bash
# 从根目录启动
pnpm --filter e2e-robot-web dev

# 或使用快捷命令
pnpm dev:web
```

### 构建生产版本
```bash
pnpm --filter e2e-robot-web build
```

### 启动生产服务器
```bash
pnpm --filter e2e-robot-web start
```

## 🎨 UI 组件

使用 shadcn/ui 组件库，包含：

- **Button**: 按钮组件，支持多种变体
- **Input**: 输入框组件，支持各种类型
- **Card**: 卡片组件，用于内容布局
- **Icons**: Lucide React 图标集

### 添加新组件
```bash
# 如果有 shadcn CLI
npx shadcn-ui@latest add [component-name]

# 或手动创建组件文件
```

## 🔧 配置

### Next.js 配置 (`next.config.mjs`)
- 支持 workspace 包的转译
- ESM 外部模块支持
- 开发时忽略 TypeScript 和 ESLint 错误

### Tailwind 配置 (`tailwind.config.ts`)
- 完整的 shadcn/ui 主题系统
- 响应式断点设置
- 动画和过渡效果

### TypeScript 配置 (`tsconfig.json`)
- 路径别名设置 (`@/*`)
- 严格类型检查
- Next.js 类型支持

## 🌐 与 E2E Robot 集成

### API 集成
- 通过 `/api/analyze` 接口调用 E2E Robot agents
- 支持 `@e2e-robot/core` 和 `@e2e-robot/agents` 包
- 智能识别输入类型（URL vs 描述）

### 数据流
1. 用户在前端输入内容
2. 前端发送 POST 请求到 `/api/analyze`
3. API 路由解析输入并调用相应的 agent
4. 返回分析结果到前端展示

## 📱 响应式设计

- **桌面端**: 完整功能展示，大屏优化
- **平板端**: 适配中等屏幕尺寸
- **移动端**: 触屏优化，紧凑布局

## 🎯 未来计划

- [ ] 添加用户认证系统
- [ ] 实时测试进度展示
- [ ] 测试结果可视化
- [ ] 历史记录管理
- [ ] 批量测试支持
- [ ] 更多 UI 组件集成

## 🤝 开发贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

与主项目保持一致。