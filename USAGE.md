# 使用指南 - Claude Code Agents 测试自动化系统

本指南将详细介绍如何使用 Claude Code Agents 测试自动化系统进行网站测试。

## 🚀 快速上手

### 第一次使用

1. **准备环境**
   ```bash
   # 克隆项目
   git clone <repository-url>
   cd e2e-robot
   
   # 安装依赖
   pnpm install
   
   # 设置 API Key
   export ANTHROPIC_API_KEY="your-anthropic-api-key"
   ```

2. **启动系统**
   ```bash
   pnpm claude-agents
   ```

3. **跟随交互式配置**
   - 输入要测试的网站 URL
   - 描述测试需求
   - 选择测试类型
   - 配置参数
   - 确认并开始

## 📋 配置详细说明

### 网站配置

**目标 URL 输入**
```
请输入目标网站URL: https://www.example.com
```
- 支持 HTTP/HTTPS 协议
- 建议使用完整 URL，包含协议头
- 系统会自动验证 URL 格式

**站点名称**
```
请输入站点名称: Example Website
```
- 用于生成测试报告的标题
- 如果不输入，系统会从 URL 自动提取
- 支持中文和英文

### 测试要求配置

**要求描述**
```
请描述您的测试需求，每行一个要求：
要求 1: 测试首页加载功能
要求 2: 验证搜索功能正常工作
要求 3: 检查用户登录流程
要求 4: 测试产品页面展示
要求 5: [空行结束]
```

**最佳实践**：
- 每个要求应该具体明确
- 描述可测试的功能点
- 避免过于宽泛的描述
- 按优先级排序

**示例要求**：
```
✅ 好的要求：
- 测试用户注册流程是否正常
- 验证搜索结果页面显示正确
- 检查购物车添加商品功能

❌ 避免的要求：
- 测试所有功能
- 检查网站是否好用
- 确保没有问题
```

### 测试类型选择

```
请选择需要的测试类型 (多选，用空格分隔):
1. 功能测试 (基础功能验证)
2. 用户体验测试 (UI/UX测试)
3. 响应式测试 (移动端适配)
4. 性能测试 (加载速度测试)
5. 兼容性测试 (跨浏览器测试)
6. 安全测试 (基础安全检查)

选择: 1 2 3
```

**测试类型详解**：

| 类型 | 适用场景 | 测试内容 |
|------|----------|----------|
| 功能测试 | 所有网站 | 基础功能验证、表单提交、链接跳转 |
| 用户体验测试 | 用户导向网站 | 界面交互、用户流程、易用性 |
| 响应式测试 | 移动端网站 | 不同屏幕尺寸、移动端适配 |
| 性能测试 | 注重性能的网站 | 页面加载速度、资源加载时间 |
| 兼容性测试 | 企业级网站 | 多浏览器支持、版本兼容性 |
| 安全测试 | 涉及用户数据的网站 | 基础安全检查、输入验证 |

### 参数配置

**最大测试用例数**
```
最大测试用例数 (默认: 20): 30
```
- 控制生成的测试用例总数
- 建议范围：10-50
- 复杂网站可适当增加

**测试优先级**
```
测试优先级 (low/medium/high, 默认: medium): high
```
- `low`: 基础测试，覆盖主要功能
- `medium`: 标准测试，平衡覆盖度和深度
- `high`: 详细测试，深度覆盖各种场景

**超时时间**
```
超时时间 (秒, 默认: 600): 900
```
- 单个操作的最大等待时间
- 网络较慢或网站复杂时建议增加
- 建议范围：300-1800 秒

## 🔄 执行流程详解

### 1. 网站分析阶段
```
🔍 步骤1: 网站分析
⏳ 这可能需要几分钟时间，请耐心等待...
```

**系统行为**：
- 访问目标网站
- 分析页面结构和元素
- 识别可交互组件
- 生成分析报告

**输出文件**：`claude-agents-output/website-analysis.md`

### 2. 场景生成阶段
```
📝 步骤2: 测试场景生成
🎯 基于配置的测试要求: 4 项
🧪 测试类型: functional, ux
⏳ 正在基于分析结果生成测试场景...
```

**系统行为**：
- 基于网站分析结果
- 结合用户配置的测试要求
- 根据选择的测试类型生成场景
- 考虑测试优先级

**输出文件**：`claude-agents-output/test-scenarios.md`

### 3. 测试用例生成阶段
```
⚙️ 步骤3: 测试用例生成
⏳ 正在将场景转换为可执行的 Playwright 代码...
```

**系统行为**：
- 将测试场景转换为 Playwright 代码
- 生成结构化的测试文件
- 添加适当的断言和等待

**输出文件**：`claude-agents-output/test-cases.spec.ts`

### 4. 测试执行阶段
```
🚀 步骤4: 测试执行
开始执行测试，首先分析历史测试结果...
```

**智能执行策略**：
- 检查历史测试结果
- 如有失败用例，优先修复
- 逐个测试失败用例
- 最多 10 轮自动调试

**输出文件**：
- `test-results.json` - 详细测试结果
- `test-report.md` - 测试报告

### 5. 结果校准阶段
```
📈 步骤5: 结果校准
⏳ 正在基于成功测试进行系统校准...
```

**系统行为**：
- 分析成功的测试用例
- 生成最佳实践建议
- 提供系统优化建议

**输出文件**：`claude-agents-output/calibration-report.md`

## 🐛 调试和故障排除

### 常见问题

**1. API Key 未设置**
```
❌ 系统执行失败: Error: API key not provided
```
**解决方案**：
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

**2. 网站无法访问**
```
❌ 网站分析失败: 无法访问目标网站
```
**解决方案**：
- 检查网站 URL 是否正确
- 确认网站是否可公开访问
- 检查网络连接

**3. 测试执行失败**
```
❌ 测试执行失败，已达到最大重试次数 10 次
```
**解决方案**：
- 查看 `claude-agents-output/message.log`
- 检查测试用例是否适合目标网站
- 考虑调整超时时间

**4. 生成的测试用例不合适**
```
⚠️ 测试用例与网站实际结构不匹配
```
**解决方案**：
- 重新运行网站分析
- 调整测试要求描述
- 选择更合适的测试类型

### 调试技巧

**1. 查看详细日志**
```bash
# 查看 Claude 交互日志
cat claude-agents-output/message.log

# 查看测试结果
cat claude-agents-output/test-results.json
```

**2. 手动验证测试用例**
```bash
# 单独运行生成的测试
npx playwright test claude-agents-output/test-cases.spec.ts

# 运行特定测试用例
npx playwright test --grep "测试用例名称"
```

**3. 调试模式运行**
```bash
# 设置详细输出
DEBUG=* pnpm claude-agents

# 保留浏览器窗口
PWDEBUG=1 npx playwright test
```

## 📊 结果分析

### 测试报告解读

**test-report.md 包含**：
- 执行概要
- 历史测试结果分析（如有）
- 成功修复的测试用例
- 仍然失败的测试用例
- 执行详细信息
- 建议和总结

**关键指标**：
```markdown
## 执行概要
- **执行状态**: ✅ 通过 / ❌ 失败
- **尝试次数**: 1/10
- **自动调试**: 是 / 否

## 历史测试结果分析
- **上次测试总数**: 15
- **上次失败数量**: 3
- **本轮针对性修复**: 2/3
```

### 配置优化建议

**基于结果优化配置**：

1. **如果测试用例太少**：
   - 增加最大测试用例数
   - 添加更多测试要求
   - 选择更多测试类型

2. **如果测试经常失败**：
   - 增加超时时间
   - 简化测试要求
   - 降低测试优先级

3. **如果执行时间太长**：
   - 减少测试用例数
   - 选择核心测试类型
   - 使用 `--no-interactive` 模式

## 🔧 高级使用

### 批量测试

**配置文件模式**：
```bash
# 创建配置文件
cat > test-config.json << 'EOF'
{
  "targetUrl": "https://www.example.com",
  "siteName": "Example Website",
  "testRequirements": [
    "测试首页加载功能",
    "验证搜索功能正常工作"
  ],
  "testTypes": ["functional", "ux"],
  "maxTestCases": 20,
  "priority": "medium",
  "timeout": 600000,
  "verbose": true
}
EOF

# 使用配置文件运行
pnpm claude-agents --no-interactive
```

### CI/CD 集成

**GitHub Actions 示例**：
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run E2E tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: pnpm claude-agents --no-interactive
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: claude-agents-output/
```

### 自定义配置

**环境变量配置**：
```bash
# 设置工作目录
export CLAUDE_WORK_DIR="/custom/output/path"

# 设置超时时间
export CLAUDE_TIMEOUT="1800"

# 设置详细输出
export CLAUDE_VERBOSE="true"
```

## 📈 最佳实践总结

### 配置策略

1. **渐进式测试**：
   - 首次使用选择简单网站
   - 逐步增加测试复杂度
   - 根据结果调整配置

2. **测试要求编写**：
   - 具体明确，避免模糊
   - 优先核心功能
   - 考虑用户使用场景

3. **类型选择**：
   - 功能测试是基础，建议必选
   - 根据网站特性选择其他类型
   - 避免选择过多类型

### 执行策略

1. **首次执行**：
   - 使用默认参数
   - 观察执行结果
   - 记录问题和建议

2. **调优阶段**：
   - 根据首次结果调整配置
   - 增加或减少测试用例数
   - 调整超时和优先级

3. **生产使用**：
   - 使用稳定的配置
   - 定期清理输出目录
   - 监控执行时间和成功率

### 故障处理

1. **预防性措施**：
   - 定期更新依赖
   - 监控 API 使用情况
   - 备份重要配置

2. **问题诊断**：
   - 查看日志文件
   - 逐步缩小问题范围
   - 使用调试模式

3. **恢复操作**：
   - 清理缓存和临时文件
   - 重置配置到默认值
   - 从简单场景重新开始

---

通过本指南，您应该能够熟练使用 Claude Code Agents 测试自动化系统。如有其他问题，请参考 [README.md](README.md) 或提交 Issue。