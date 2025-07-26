# E2E Robot Monorepo 指南

本项目已转换为 pnpm workspace monorepo 结构，更好地组织代码和依赖管理。

## 📁 项目结构

```
e2e-robot-workspace/
├── packages/                    # 共享包
│   ├── core/                   # 核心类型和工具
│   │   ├── src/
│   │   │   ├── types.ts       # 共享类型定义
│   │   │   └── index.ts       # 主入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── agents/                 # Claude agents 系统
│   │   ├── src/
│   │   │   ├── orchestrator.ts
│   │   │   ├── website-analyzer.ts
│   │   │   ├── scenario-generator.ts
│   │   │   ├── testcase-generator.ts
│   │   │   ├── test-runner.ts
│   │   │   ├── claude-executor.ts
│   │   │   └── index.ts       # 导出所有 agents
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/                    # 命令行工具
│       ├── src/
│       │   ├── interactive-config.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/                       # 应用程序
│   └── e2e-robot/             # 主应用
│       ├── src/
│       │   └── claude-agents-main.ts
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml         # pnpm workspace 配置
├── package.json                # 根项目配置
└── tsconfig.json               # TypeScript 项目引用配置
```

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 构建所有包
```bash
pnpm build
```

### 运行主应用
```bash
# 开发模式
pnpm dev

# 运行 Claude agents 系统
pnpm claude-agents

# 构建并运行
pnpm build && pnpm start
```

## 📦 包管理

### Workspace 包引用
- `@e2e-robot/core` - 核心类型和工具
- `@e2e-robot/agents` - Claude agents 系统
- `@e2e-robot/cli` - 命令行工具
- `e2e-robot` - 主应用程序

### 依赖关系
```
e2e-robot (主应用)
├── @e2e-robot/core
├── @e2e-robot/agents
│   └── @e2e-robot/core
└── @e2e-robot/cli
    └── @e2e-robot/core
```

## 🛠️ 开发命令

### 根级别命令
```bash
# 构建所有包
pnpm build

# 清理所有构建产物
pnpm clean

# 运行主应用
pnpm dev
pnpm claude-agents
pnpm start

# 运行测试（如果有）
pnpm test

# 代码检查（如果配置）
pnpm lint
```

### 单个包命令
```bash
# 构建特定包
pnpm --filter @e2e-robot/core build
pnpm --filter @e2e-robot/agents build

# 开发模式运行特定包
pnpm --filter @e2e-robot/core dev

# 运行主应用
pnpm --filter e2e-robot claude-agents
```

## 🔧 TypeScript 配置

项目使用 TypeScript 项目引用 (Project References) 来管理包之间的依赖关系：

- 根 `tsconfig.json` 定义了所有包的引用
- 每个包都有自己的 `tsconfig.json`
- 支持增量编译和更好的 IDE 支持

## 📝 添加新包

1. 在 `packages/` 或 `apps/` 下创建新目录
2. 添加 `package.json`:
   ```json
   {
     "name": "@e2e-robot/new-package",
     "version": "1.0.0",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "clean": "rm -rf dist"
     },
     "dependencies": {
       "@e2e-robot/core": "workspace:*"
     }
   }
   ```
3. 添加 `tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"],
     "references": [
       { "path": "../core" }
     ]
   }
   ```
4. 更新根 `tsconfig.json` 的 references 数组
5. 运行 `pnpm install` 更新依赖

## 🎯 优势

### 代码组织
- ✅ 清晰的模块边界
- ✅ 可重用的核心包
- ✅ 独立的功能模块

### 依赖管理
- ✅ 共享依赖提升
- ✅ Workspace 内部引用
- ✅ 版本一致性保证

### 开发体验
- ✅ 增量编译
- ✅ 更好的 IDE 支持
- ✅ 类型安全的跨包引用

### 构建性能
- ✅ 并行构建
- ✅ 增量构建
- ✅ 缓存优化

## 🔄 迁移说明

从单体结构迁移到 monorepo：

1. **代码移动**: 将原有代码按功能拆分到不同包中
2. **导入更新**: 更新所有 import 路径使用 workspace 包名
3. **类型导出**: 将共享类型移动到 `@e2e-robot/core`
4. **依赖调整**: 重新组织依赖关系，避免循环依赖

## 📚 相关文档

- [pnpm Workspace 官方文档](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [原项目 README](./README.md)
- [使用指南](./USAGE.md)

---

*此 monorepo 结构旨在提高代码组织性、开发效率和维护性。*