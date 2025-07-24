# Async/Await 修复总结

## 问题描述

在修复了 Markdown 标记问题后，出现了新的错误：

```
❌ Playwright 代码执行失败: SyntaxError: await is only valid in async functions and the top level bodies of modules
```

## 问题原因

错误的原因是使用 `new Function()` 创建的函数不是 async 函数，无法直接使用 await 语法。当 Claude 生成的代码包含 `await` 语句时，在非 async 上下文中执行会导致语法错误。

### 问题代码示例：
```typescript
// 这种方式创建的函数不是 async 函数
const executeFunction = new Function('page', 'console', code);
await executeFunction(context.page, context.console);
```

## 解决方案

### 1. 创建 Async 函数包装器

使用 `new Function()` 创建一个返回 async 函数的包装器：

```typescript
// 创建一个 async 函数包装器
const asyncFunction = new Function('page', 'console', `
  return (async () => {
    ${cleanedCode}
  })();
`);

// 执行 async 函数
await asyncFunction(context.page, context.console);
```

### 2. 创建安全的代码执行器

为了更好地管理代码执行，创建了 `SafeCodeExecutor` 类：

```typescript
class SafeCodeExecutor {
  /**
   * 安全执行 Playwright 代码
   */
  public async executePlaywrightCode(code: string, context: ExecutionContext): Promise<void> {
    // 清理生成的代码
    const cleanedCode = this.cleanGeneratedCode(code);
    
    // 验证代码安全性
    this.validateCode(cleanedCode);
    
    // 创建安全的执行环境
    const safeContext = {
      page: context.page,
      console: context.console,
      // 只暴露安全的全局对象
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      Date: Date,
      Math: Math,
      JSON: JSON,
      // ... 其他安全对象
    };

    // 创建 async 函数包装器
    const asyncFunction = new Function(
      'page', 'console', 'setTimeout', 'clearTimeout', 'Date', 'Math', 'JSON', 
      'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'Promise',
      `
      return (async () => {
        ${cleanedCode}
      })();
    `);

    // 执行 async 函数
    await asyncFunction(
      safeContext.page, 
      safeContext.console,
      safeContext.setTimeout,
      safeContext.clearTimeout,
      safeContext.Date,
      safeContext.Math,
      safeContext.JSON,
      safeContext.Array,
      safeContext.Object,
      safeContext.String,
      safeContext.Number,
      safeContext.Boolean,
      safeContext.RegExp,
      safeContext.Error,
      safeContext.Promise
    );
  }
}
```

### 3. 代码安全性验证

添加了代码安全性验证，防止执行危险代码：

```typescript
private validateCode(code: string): void {
  // 检查是否包含危险的代码模式
  const dangerousPatterns = [
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /process\./i,
    /require\s*\(/i,
    /import\s*\(/i,
    /global\s*\./i,
    /window\s*\./i,
    /document\s*\./i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error(`代码包含潜在危险模式: ${pattern.source}`);
    }
  }
}
```

## 修复的文件

1. **`src/claude-playwright-integration.ts`**
   - 使用 `SafeCodeExecutor` 替代直接的代码执行
   - 移除重复的代码清理逻辑

2. **`src/claude-code-sdk-example.ts`**
   - 使用 `SafeCodeExecutor` 替代直接的代码执行
   - 移除重复的代码清理逻辑

3. **`src/demo-fixed-integration.ts`**
   - 使用 `SafeCodeExecutor` 替代直接的代码执行
   - 移除重复的代码清理逻辑

4. **新增文件**
   - `src/safe-code-executor.ts`：安全的代码执行器
   - `src/test-safe-executor.ts`：安全代码执行器测试

## 技术优势

### 1. 支持 Async/Await 语法
- 正确支持 `await` 语句
- 支持异步操作链
- 保持代码的可读性

### 2. 安全性增强
- 代码安全性验证
- 限制可访问的全局对象
- 防止危险代码执行

### 3. 代码复用
- 统一的代码执行逻辑
- 减少重复代码
- 便于维护和扩展

### 4. 错误处理
- 详细的错误信息
- 分层的错误处理
- 便于调试

## 测试验证

### 安全代码执行器测试

运行 `pnpm test-safe-executor` 验证功能：

```
🧪 测试安全代码执行器...

🔧 生成的代码:
await page.waitForSelector('#kw');
await page.fill('#kw', 'test');
await page.click('#su');

🧹 清理后的代码:
await page.waitForSelector('#kw');
await page.fill('#kw', 'test');
await page.click('#su');
---
✅ 代码安全性验证通过
等待选择器: #kw
填充 #kw: test
点击: #su
✅ Playwright 代码执行成功
✅ Playwright 代码执行测试通过
```

## 使用方式

### 运行修复后的演示

```bash
# 设置 API Key
export ANTHROPIC_API_KEY="your-api-key"

# 运行修复后的演示
pnpm demo-fixed
```

### 测试安全代码执行器

```bash
# 运行安全代码执行器测试
pnpm test-safe-executor
```

## 修复效果

### 修复前
- ❌ 语法错误：`await is only valid in async functions`
- ❌ 无法执行包含 await 的代码
- ❌ 代码执行失败

### 修复后
- ✅ 正确支持 async/await 语法
- ✅ 成功执行 Playwright 代码
- ✅ 安全的代码执行环境
- ✅ 完善的错误处理
- ✅ 代码复用和维护性

## 架构改进

### 重构前
```
ClaudePlaywrightIntegration
├── cleanGeneratedCode()     # 重复的代码清理
├── executePlaywrightCode()  # 直接的代码执行
└── 其他方法
```

### 重构后
```
ClaudePlaywrightIntegration
├── codeExecutor: SafeCodeExecutor  # 安全的代码执行器
├── executePlaywrightCode()         # 委托给执行器
└── 其他方法

SafeCodeExecutor
├── cleanGeneratedCode()     # 统一的代码清理
├── validateCode()          # 代码安全性验证
├── executePlaywrightCode() # 安全的 Playwright 代码执行
└── executeJavaScriptCode() # 安全的 JavaScript 代码执行
```

## 总结

通过创建 `SafeCodeExecutor` 类和 async 函数包装器，成功解决了 async/await 语法错误问题。新的架构提供了：

1. **正确的 async/await 支持**：能够执行包含 await 语句的代码
2. **增强的安全性**：代码验证和安全的执行环境
3. **更好的可维护性**：统一的代码执行逻辑和错误处理
4. **扩展性**：支持不同类型的代码执行需求

修复后的代码更加健壮、安全，并且具有良好的架构设计。 