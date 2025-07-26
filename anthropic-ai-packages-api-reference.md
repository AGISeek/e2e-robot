# Anthropic AI Packages API 参考文档

本文档分析了 `node_modules/@anthropic-ai` 下的两个包：`@anthropic-ai/sdk` 和 `@anthropic-ai/claude-code`，并提供了完整的 API 参考。

## 1. @anthropic-ai/sdk

### 基本信息
- **版本**: 0.57.0
- **描述**: The official TypeScript library for the Anthropic API
- **许可证**: MIT
- **仓库**: github:anthropics/anthropic-sdk-typescript
- **类型**: CommonJS/ES Module 双格式支持

### 主要导出

```typescript
// 主要客户端类
export { Anthropic as default } from "./client.js";
export { BaseAnthropic, Anthropic, type ClientOptions, HUMAN_PROMPT, AI_PROMPT } from "./client.js";

// 核心工具类
export { APIPromise } from "./core/api-promise.js";
export { PagePromise } from "./core/pagination.js";
export { type Uploadable, toFile } from "./core/uploads.js";

// 错误处理
export { 
  AnthropicError, APIError, APIConnectionError, APIConnectionTimeoutError, 
  APIUserAbortError, NotFoundError, ConflictError, RateLimitError, 
  BadRequestError, AuthenticationError, InternalServerError, 
  PermissionDeniedError, UnprocessableEntityError 
} from "./core/error.js";
```

### 核心 API 类

#### ClientOptions 接口

```typescript
export interface ClientOptions {
  // API 密钥配置
  apiKey?: string | null | undefined;           // 默认从 process.env['ANTHROPIC_API_KEY']
  authToken?: string | null | undefined;        // 默认从 process.env['ANTHROPIC_AUTH_TOKEN']
  
  // 网络配置
  baseURL?: string | null | undefined;          // 默认从 process.env['ANTHROPIC_BASE_URL']
  timeout?: number | undefined;                 // 请求超时时间(毫秒)
  maxRetries?: number | undefined;              // 最大重试次数，默认 2
  
  // 请求配置
  fetchOptions?: MergedRequestInit | undefined;
  fetch?: Fetch | undefined;                    // 自定义 fetch 实现
  
  // 默认设置
  defaultHeaders?: HeadersLike | undefined;
  defaultQuery?: Record<string, string | undefined> | undefined;
  
  // 安全和日志
  dangerouslyAllowBrowser?: boolean | undefined; // 允许浏览器端使用
  logLevel?: LogLevel | undefined;               // 日志级别
  logger?: Logger | undefined;                   // 自定义日志器
}
```

#### Messages API

```typescript
export declare class Messages extends APIResource {
  batches: BatchesAPI.Batches;
  
  // 创建消息 - 支持流式和非流式
  create(body: MessageCreateParamsNonStreaming, options?: RequestOptions): APIPromise<Message>;
  create(body: MessageCreateParamsStreaming, options?: RequestOptions): APIPromise<Stream<RawMessageStreamEvent>>;
  create(body: MessageCreateParamsBase, options?: RequestOptions): APIPromise<Stream<RawMessageStreamEvent> | Message>;
  
  // 创建消息流
  stream(body: MessageStreamParams, options?: RequestOptions): MessageStream;
  
  // 计算 Token 数量
  countTokens(body: MessageCountTokensParams, options?: RequestOptions): APIPromise<MessageTokensCount>;
}
```

### 主要数据类型

#### 消息相关类型

```typescript
// 基础消息类型
export interface Message {
  id: string;                    // 唯一标识符
  content: ContentBlock[];       // 内容块数组
  model: string;                 // 使用的模型
  role: 'assistant';             // 角色类型
  stop_reason: StopReason;       // 停止原因
  stop_sequence: string | null;  // 停止序列
  type: 'message';               // 类型标识
  usage: Usage;                  // 使用情况统计
}

// 内容块类型
export type ContentBlock = 
  | TextBlock 
  | ThinkingBlock 
  | RedactedThinkingBlock 
  | ToolUseBlock 
  | ServerToolUseBlock 
  | WebSearchToolResultBlock;

export type ContentBlockParam = 
  | TextBlockParam 
  | ImageBlockParam 
  | DocumentBlockParam 
  | ThinkingBlockParam 
  | RedactedThinkingBlockParam 
  | ToolUseBlockParam 
  | ToolResultBlockParam 
  | ServerToolUseBlockParam 
  | WebSearchToolResultBlockParam;
```

#### 工具相关类型

```typescript
// 工具定义
export interface Tool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

// 工具选择
export type ToolChoice = 
  | ToolChoiceAny 
  | ToolChoiceAuto 
  | ToolChoiceNone 
  | ToolChoiceTool;

// 预定义工具
export interface ToolBash20250124 {
  type: 'bash_20250124';
  name?: string;
}

export interface ToolTextEditor20250124 {
  type: 'text_editor_20250124';
  name?: string;
}

export interface WebSearchTool20250305 {
  type: 'web_search_20250305';
  name?: string;
}
```

#### 媒体和文档类型

```typescript
// 图片源
export interface Base64ImageSource {
  data: string;
  media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  type: 'base64';
}

export interface URLImageSource {
  url: string;
  type: 'url';
}

// PDF 源
export interface Base64PDFSource {
  data: string;
  media_type: 'application/pdf';
  type: 'base64';
}

export interface URLPDFSource {
  url: string;
  type: 'url';
}

// 纯文本源
export interface PlainTextSource {
  data: string;
  media_type: 'text/plain';
  type: 'text';
}
```

### 使用示例

```typescript
import Anthropic from '@anthropic-ai/sdk';

// 初始化客户端
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 创建消息
const message = await anthropic.messages.create({
  max_tokens: 1024,
  messages: [{ content: 'Hello, world', role: 'user' }],
  model: 'claude-sonnet-4-20250514',
});

// 流式消息
const stream = anthropic.messages.stream({
  max_tokens: 1024,
  messages: [{ content: 'Hello, world', role: 'user' }],
  model: 'claude-sonnet-4-20250514',
});

for await (const messageStreamEvent of stream) {
  console.log(messageStreamEvent);
}

// Token 计数
const tokenCount = await anthropic.messages.countTokens({
  messages: [{ content: 'Hello, world', role: 'user' }],
  model: 'claude-3-7-sonnet-latest',
});
```

## 2. @anthropic-ai/claude-code

### 基本信息
- **版本**: 1.0.58
- **描述**: 终端中的 Claude AI 编程助手，可以理解代码库、编辑文件、运行命令
- **许可证**: 自定义许可证 (SEE LICENSE IN README.md)
- **主页**: https://github.com/anthropics/claude-code
- **类型**: ES Module
- **Node.js 要求**: >=18.0.0

### 主要导出

```typescript
// 核心查询函数
export function query({ prompt, abortController, options }: Props): Query

// 错误类
export class AbortError extends Error {}

// 类型定义
export type SDKMessage = SDKAssistantMessage | SDKUserMessage | SDKResultMessage | SDKSystemMessage
export type Options = { /* 配置选项 */ }
export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
```

### 核心类型定义

#### Options 配置接口

```typescript
export type Options = {
  abortController?: AbortController;          // 中止控制器
  allowedTools?: string[];                    // 允许的工具列表
  appendSystemPrompt?: string;                // 追加系统提示
  customSystemPrompt?: string;                // 自定义系统提示
  cwd?: string;                              // 工作目录
  disallowedTools?: string[];                // 禁用工具列表
  executable?: 'bun' | 'deno' | 'node';     // 执行环境
  executableArgs?: string[];                 // 执行参数
  maxThinkingTokens?: number;                // 最大思考 token 数
  maxTurns?: number;                         // 最大轮次
  mcpServers?: Record<string, McpServerConfig>; // MCP 服务器配置
  pathToClaudeCodeExecutable?: string;       // Claude Code 可执行文件路径
  permissionMode?: PermissionMode;           // 权限模式
  permissionPromptToolName?: string;         // 权限提示工具名
  continue?: boolean;                        // 是否继续
  resume?: string;                          // 恢复会话
  model?: string;                           // 模型名称
  fallbackModel?: string;                   // 备用模型
  stderr?: (data: string) => void;          // 错误输出处理
}
```

#### MCP 服务器配置

```typescript
// MCP 服务器配置类型
export type McpServerConfig = 
  | McpStdioServerConfig 
  | McpSSEServerConfig  
  | McpHttpServerConfig;

// 标准输入输出服务器
export type McpStdioServerConfig = {
  type?: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

// 服务器发送事件
export type McpSSEServerConfig = {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
}

// HTTP 服务器
export type McpHttpServerConfig = {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}
```

#### 消息类型系统

```typescript
// 用户消息
export type SDKUserMessage = {
  type: 'user';
  message: APIUserMessage;
  parent_tool_use_id: string | null;
  session_id: string;
}

// 助手消息
export type SDKAssistantMessage = {
  type: 'assistant';
  message: APIAssistantMessage;
  parent_tool_use_id: string | null;
  session_id: string;
}

// 结果消息
export type SDKResultMessage = {
  type: 'result';
  subtype: 'success' | 'error_max_turns' | 'error_during_execution';
  duration_ms: number;
  duration_api_ms: number;
  is_error: boolean;
  num_turns: number;
  session_id: string;
  total_cost_usd: number;
  usage: NonNullableUsage;
  result?: string; // 仅在 success 时存在
}

// 系统消息
export type SDKSystemMessage = {
  type: 'system';
  subtype: 'init';
  apiKeySource: ApiKeySource;
  cwd: string;
  session_id: string;
  tools: string[];
  mcp_servers: { name: string; status: string; }[];
  model: string;
  permissionMode: PermissionMode;
}
```

#### 权限模式

```typescript
export type PermissionMode = 
  | 'default'           // 默认模式，需要用户确认
  | 'acceptEdits'       // 自动接受编辑
  | 'bypassPermissions' // 绕过权限检查
  | 'plan'              // 计划模式
```

### Query 接口

```typescript
export interface Query extends AsyncGenerator<SDKMessage, void> {
  /**
   * 中断查询（仅在使用流式输入时支持）
   */
  interrupt(): Promise<void>
}
```

### 使用示例

#### 基本用法

```typescript
import { query } from '@anthropic-ai/claude-code';

// 简单查询
const response = query({ 
  prompt: "Help me write a function",
  options: {}
});

for await (const message of response) {
  console.log(message);
}
```

#### 高级配置

```typescript
import { query, type Options } from '@anthropic-ai/claude-code';

const options: Options = {
  cwd: '/path/to/project',
  permissionMode: 'acceptEdits',
  allowedTools: ['bash', 'text_editor'],
  maxTurns: 10,
  model: 'claude-sonnet-4-20250514',
  mcpServers: {
    myServer: {
      type: 'stdio',
      command: 'node',
      args: ['server.js'],
      env: { NODE_ENV: 'development' }
    }
  }
};

const response = query({
  prompt: "Analyze this codebase and suggest improvements",
  options
});

for await (const message of response) {
  switch (message.type) {
    case 'system':
      console.log('System initialized:', message);
      break;
    case 'assistant':
      console.log('Assistant:', message.message);
      break;
    case 'user':
      console.log('User:', message.message);
      break;
    case 'result':
      console.log('Result:', message);
      break;
  }
}
```

#### 流式输入

```typescript
import { query } from '@anthropic-ai/claude-code';

async function* generatePrompts() {
  yield { 
    type: 'user' as const,
    message: { role: 'user', content: 'First prompt' },
    parent_tool_use_id: null,
    session_id: 'session-1'
  };
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  yield { 
    type: 'user' as const,
    message: { role: 'user', content: 'Second prompt' },
    parent_tool_use_id: null,
    session_id: 'session-1'
  };
}

const response = query({
  prompt: generatePrompts(),
  options: { maxTurns: 5 }
});

// 可以中断流式查询
setTimeout(() => {
  response.interrupt();
}, 5000);

for await (const message of response) {
  console.log(message);
}
```

### CLI 使用

安装为全局命令：

```bash
npm install -g @anthropic-ai/claude-code
```

使用 CLI：

```bash
# 启动 Claude Code
claude

# 在特定目录启动
cd /path/to/project && claude
```

## 3. 两个包的对比

| 特性 | @anthropic-ai/sdk | @anthropic-ai/claude-code |
|------|-------------------|---------------------------|
| **用途** | 直接 API 调用 | 终端编程助手 |
| **接口类型** | REST API 客户端 | 智能代理系统 |
| **主要功能** | 消息创建、流式响应、Token 计数 | 代码理解、文件编辑、命令执行 |
| **工具支持** | 基础工具定义 | 内置编程工具集 |
| **使用场景** | 集成到应用中 | 开发环境辅助 |
| **权限模型** | API 级别 | 文件系统级别 |
| **流式支持** | 消息流 | 完整会话流 |

## 4. 最佳实践

### SDK 使用建议

1. **错误处理**: 使用完整的错误类型进行异常处理
2. **流式响应**: 对于长时间任务使用流式 API
3. **Token 管理**: 使用 `countTokens` 预估成本
4. **重试机制**: 配置合适的 `maxRetries` 值

### Claude Code 使用建议

1. **权限配置**: 根据安全需求选择合适的 `permissionMode`
2. **工具限制**: 使用 `allowedTools` 和 `disallowedTools` 控制功能
3. **MCP 集成**: 通过 MCP 服务器扩展功能
4. **会话管理**: 利用 `resume` 功能继续之前的会话

---

*本文档基于 @anthropic-ai/sdk v0.57.0 和 @anthropic-ai/claude-code v1.0.58 生成*