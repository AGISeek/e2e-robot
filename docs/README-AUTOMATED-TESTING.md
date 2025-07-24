# Claude Code SDK 自动化测试生成器

这个脚本演示了如何使用 Claude Code SDK 完成完整的网站测试自动化流程。

## 功能特性

✅ **完全基于 Claude Code SDK** - 所有操作都通过 Claude AI 完成  
✅ **网站元素分析** - 自动识别可交互元素  
✅ **测试场景设计** - AI 生成测试设计文档  
✅ **代码自动生成** - 生成 Playwright 测试代码  
✅ **代码验证修正** - 自动检查和修正代码问题  
✅ **完整报告输出** - 生成详细的执行报告  

## 工作流程

### 1. 网站分析 🌐
- 使用 Playwright 打开目标网站 (https://www.baidu.com)
- 通过 Claude Code SDK 分析页面 HTML
- 识别所有可交互元素（输入框、按钮、链接等）
- 输出元素分析报告 JSON

### 2. 测试场景设计 📝
- 基于元素分析结果，通过 Claude 生成测试场景
- 包括正常流程、边界值、异常情况测试
- 生成详细的测试设计文档 (Markdown)
- 输出结构化的测试场景 JSON

### 3. 测试代码生成 ⚙️
- 根据测试场景和元素信息生成 Playwright 代码
- 使用 TypeScript 和 @playwright/test 框架
- 包含完整的断言、等待和错误处理
- 遵循 Page Object 模式和最佳实践

### 4. 代码验证和修正 🔍
- 通过 Claude 审查生成的测试代码
- 检查语法、API 使用、选择器合理性
- 自动修正发现的问题
- 进行二次验证确保代码质量

### 5. 报告生成 📊
- 生成完整的执行报告
- 包含问题分析和改进建议
- 提供下一步行动计划

## 使用方法

### 前置条件

1. 设置 Claude API Key:
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

2. 安装依赖:
```bash
pnpm install
```

### 运行自动化测试生成器

```bash
pnpm claude-automated-testing
```

## 输出文件

脚本会在 `test-output/` 目录下生成以下文件：

- `element-analysis.json` - 网站可交互元素分析结果
- `test-scenarios.json` - 结构化测试场景数据
- `test-design-document.md` - 详细的测试设计文档
- `generated-test.spec.ts` - 初始生成的测试代码
- `fixed-test.spec.ts` - 修正后的最终测试代码
- `test-execution-report.md` - 完整的执行报告

## 核心实现

### 主要类: `ClaudeAutomatedTesting`

```typescript
class ClaudeAutomatedTesting {
  // 完整的自动化流程
  async runCompleteWorkflow(url: string): Promise<void>
  
  // 网站分析
  async openWebsiteAndAnalyze(url: string): Promise<ElementAnalysis[]>
  
  // 测试场景生成
  async generateTestScenarios(elements: ElementAnalysis[], url: string): Promise<TestScenario[]>
  
  // 测试代码生成
  async generateTestCode(scenarios: TestScenario[], elements: ElementAnalysis[], url: string): Promise<string>
  
  // 代码验证和修正
  async validateAndFixTestCode(testCode: string): Promise<string>
}
```

### 关键特性

1. **智能提示词设计** - 针对每个步骤设计专门的 Claude 提示词
2. **JSON 解析容错** - 自动处理和修正 Claude 返回的格式问题
3. **代码清理机制** - 移除 Markdown 标记，确保代码可执行
4. **迭代验证** - 多轮验证确保最终代码质量
5. **完整文档输出** - 提供可追溯的完整流程记录

## 示例输出

### 元素分析示例
```json
[
  {
    "elementType": "input",
    "selector": "#kw",
    "text": "",
    "attributes": {"id": "kw", "name": "wd", "placeholder": "请输入搜索内容"},
    "interactionPossibilities": ["fill", "click", "focus"]
  }
]
```

### 测试场景示例
```json
[
  {
    "name": "搜索功能正常流程测试",
    "description": "验证用户能够正常使用搜索功能",
    "steps": [
      "打开百度首页",
      "在搜索框中输入测试关键词",
      "点击搜索按钮",
      "验证搜索结果页面加载"
    ],
    "expectedResult": "搜索结果页面成功加载，显示相关搜索结果"
  }
]
```

## 扩展和定制

### 自定义目标网站
修改 `main()` 函数中的 URL：
```typescript
await automation.runCompleteWorkflow('https://your-target-website.com');
```

### 自定义测试场景类型
在 `generateTestScenarios()` 方法中修改提示词，添加特定的测试类型需求。

### 自定义代码风格
在 `generateTestCode()` 方法中调整代码生成提示词，指定特定的编码规范。

## 注意事项

- 确保网络连接稳定，Claude API 调用需要良好的网络环境
- 某些网站可能有反爬虫机制，影响元素分析
- 生成的测试代码需要根据实际项目需求进行调整
- API 调用有使用限制，大量使用时注意成本控制

## 技术架构

```
用户输入 → Claude Code SDK → 网站分析 → 测试设计 → 代码生成 → 验证修正 → 最终输出
    ↓              ↓             ↓         ↓         ↓         ↓         ↓
 目标URL    → AI提示词处理 → 元素识别 → 场景设计 → 代码生成 → 质量检查 → 测试代码
```

这个工具展示了 AI 在测试自动化领域的强大潜力，通过 Claude Code SDK 实现了从需求到代码的完全自动化流程。