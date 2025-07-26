# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an E2E testing robot framework built with TypeScript that demonstrates integration between Claude Code SDK/CLI and Playwright for web automation. The project focuses on using Claude AI to generate and execute Playwright automation code dynamically.

## Common Commands

### Development
- `pnpm dev` - Start development server with tsx watch mode
- `pnpm build` - Build TypeScript to dist/ directory using tsc
- `pnpm start` - Run built application from dist/index.js
- `pnpm clean` - Remove dist/ directory

### Example Scripts
- `pnpm simple-test` - Basic Playwright test (opens Baidu)
- `pnpm playwright-example` - Full Playwright automation example
- `pnpm claude-integration` - Claude Code SDK + Playwright integration (requires ANTHROPIC_API_KEY)
- `pnpm claude-code-sdk-example` - Claude CLI + Playwright integration (requires Claude CLI installation)
- `pnpm claude-cli-simple` - Simple Claude CLI usage example
- `pnpm claude-automated-testing` - Automated testing with Claude
- `pnpm test-claude-sdk` - Test Claude SDK functionality
- `pnpm claude-agents` - Run Claude agents system with interactive configuration
- `pnpm test-claude-agents` - Test Claude agents
- `pnpm demo-fixed` - Fixed integration demo with code cleaning
- `pnpm test-code-cleaning` - Test code cleaning functionality
- `pnpm test-safe-executor` - Test safe code execution

### Execution Modes
- `pnpm claude-agents` - Smart execution with automatic config detection
- `pnpm claude-agents --interactive` - Force interactive configuration
- `pnpm claude-agents --no-interactive` - Use default configuration
- **Intelligent Configuration**: System automatically detects existing configuration and execution state

### Prerequisites for Claude Integration
- Set `ANTHROPIC_API_KEY` environment variable
- For CLI examples: Install Claude Code CLI with `npm install -g @anthropic-ai/claude-code`
- **Usage Limit Handling**: System automatically detects and gracefully handles Claude AI usage limits

## Architecture

### Core Classes

**E2ERobot** (`validate/others/index.ts`)
- Main robot framework class with init/start/stop lifecycle
- Provides foundation for E2E test execution
- Interface: `RobotConfig` with name, version, timeout, retries

**ClaudePlaywrightIntegration** (`validate/others/claude-playwright-integration.ts`)
- Integrates Claude Code SDK with Playwright
- Generates Playwright code from natural language descriptions
- Uses `SafeCodeExecutor` for secure code execution
- Key methods: `openBaiduWithClaude()`, `interactiveMode()`, `getBrowserStatus()`

**SafeCodeExecutor** (`validate/others/safe-code-executor.ts`)
- Provides secure execution of generated Playwright code
- Validates and cleans code (removes markdown, checks dangerous patterns)
- Method: `executePlaywrightCode(code, context)`

### Claude Agents System

**TestAutomationOrchestrator** (`src/agents/orchestrator.ts`)
- Coordinates all agents to complete full test automation workflow
- Manages website analysis, scenario generation, test case creation, and execution
- Built on SOLID principles with modular agent architecture

**Agent Hierarchy** (`src/agents/`)
- `BaseAgent` - Abstract base class with common functionality
- `WebsiteAnalyzer` - Analyzes target websites for testable elements
- `ScenarioGenerator` - Creates test scenarios based on analysis
- `TestCaseGenerator` - Generates executable Playwright test cases
- `TestRunner` - Executes tests with intelligent debugging and repair
- `TestResultAnalyzer` - Analyzes test results and identifies failed tests
- `ClaudeExecutor` - Handles Claude API interactions

**Types System** (`src/agents/types.ts`)
- Comprehensive type definitions for all agent interactions
- `AgentConfig`, `AgentResult`, `TestScenario`, `TestStep` interfaces
- Structured data flow between agents

### Key Patterns

1. **Code Generation Flow**: Natural language → Claude AI → Playwright TypeScript code → Safe execution
2. **Browser Session Management**: Browser lifecycle managed within integration classes
3. **Error Handling**: Comprehensive try/catch with cleanup in finally blocks
4. **Security**: Generated code validated and executed in controlled environment
5. **Agent Orchestration**: Multi-step workflow with specialized agents for different tasks
6. **Usage Limit Management**: Intelligent detection and graceful handling of Claude AI quota limits

## Error Handling & Resilience

### Claude AI Usage Limit Handling

**Intelligent Detection**:
- Monitors messages for usage limit indicators during execution
- Detects common limit patterns: "usage limit reached", "quota exceeded", etc.
- Recognizes Claude Code SDK specific errors (exit code 1)

**Graceful Recovery**:
- **No Retries**: System immediately stops when usage limits are detected
- **Clean Exit**: Terminates gracefully without error stack traces
- **Partial Results**: Preserves any work completed before limit reached
- **User Guidance**: Provides clear instructions for resolution

**Implementation Points**:
- `src/agents/claude-executor.ts` - Core limit detection and handling
- `src/agents/orchestrator.ts` - Step-by-step limit checking
- `src/claude-agents-main.ts` - Main process graceful exit handling

**Behavior**: When limits are reached, system exits with status 0 and displays:
```
🚫 Claude AI 使用限制已达上限
💡 系统已优雅退出，请等待限制重置后再次尝试
📊 您可以查看已生成的部分结果在工作目录中
```

### Enhanced Message Display System

**Comprehensive Token Tracking**:
- **Complete Usage Display**: Shows input, output, cache creation, and cache read tokens
- **Format**: `[输入: 4, 输出: 129, 缓存创建: 119910, 缓存读取: 13752, 总计: 133]`
- **Real-time Monitoring**: Live token usage tracking during execution

**Intelligent Error Categorization**:
- **Smart Detection**: Automatically categorizes error types (timeout, visibility, assertion)
- **Clean Display**: Removes ANSI escape sequences for readable output
- **Error Summaries**: Provides human-readable error explanations
- **Example**: `🚨 错误类型: 元素不可见` → `📝 错误摘要: 目标元素不可见或未正确加载`

**Enhanced Debugging Information**:
- **Model Information**: Shows complete model details (`claude-sonnet-4-20250514`)
- **Stop Reasons**: Displays execution termination reasons (`tool_use`, `end_turn`)
- **Session Tracking**: Complete session and tool correlation IDs
- **Statistical Analysis**: Message log analysis with error rates and token statistics

**Implementation**:
- `src/agents/message-display.ts` - Core display logic with ANSI cleaning
- `src/agents/message-analyzer.ts` - Analysis tools for message logs
- Enhanced debugging with `MessageDisplay.displayMessageDebug()`

### Advanced Test Execution Features

6. **Intelligent Test Execution**: Historical result analysis → Failed test identification → Individual test repair → Full suite validation
7. **Automated Debugging**: Up to 10 rounds of test debugging with Claude Code using bash tools

### Smart Configuration Management

**Content-First Analysis**:
- **Output File Priority**: Determines execution step primarily based on existing output files
- **Smart Step Detection**: Automatically identifies the most advanced completed step
- **Configuration on Demand**: Only requires configuration when the next step actually needs it
- **Execution Continuity**: Maximizes execution progress without unnecessary interruptions

**Execution Decision Examples**:

*Scenario 1: Test Cases Available*
```
📊 产出内容分析结果:
   现有文件: generated-tests.spec.ts, test-scenarios.md, website-analysis.md
   配置状态: ❌ 需要配置
   分析结论: 发现测试用例文件，跳过前3步，使用 Claude MCP 执行测试用例
   开始步骤: 第4步 - 执行测试 (Claude MCP)
   交互配置: ✅ 跳过
```

*Scenario 2: Only Website Analysis*
```
📊 产出内容分析结果:
   现有文件: website-analysis.md
   配置状态: ❌ 需要配置
   分析结论: 发现网站分析文件，跳过第1步，从测试场景生成开始，需要配置文件
   开始步骤: 第2步 - 测试场景生成
   交互配置: 🔄 需要
```

**Smart Configuration Requirements**:
- **Step 1 (Website Analysis)**: Only needs `targetUrl`
- **Step 2 (Scenario Generation)**: Requires `targetUrl`, `siteName`, `testRequirements`, `testTypes`
- **Step 3+ (Test Cases, Execution, Calibration)**: Can proceed without new configuration
- **Configuration Priority**: Content-based execution step → Required fields for that step → Interactive prompt if needed

**Implementation**:
- `src/agents/output-analyzer.ts` - Enhanced analysis with config detection
- `src/claude-agents-main.ts` - Smart configuration loading and execution flow
- Configuration persistence in `claude-agents-output/test-config.json`

## TypeScript Configuration

- Target: ES2022, Module: ESNext
- Strict mode enabled with comprehensive type checking
- ES modules (`"type": "module"` in package.json)
- Output directory: `dist/`, Source: `src/`
- Includes strict type checking options: `noUnusedLocals`, `noImplicitReturns`, `exactOptionalPropertyTypes`

## Dependencies

### Core
- `@anthropic-ai/claude-code` - Claude Code SDK for AI integration
- `@anthropic-ai/sdk` - Direct Claude API access
- `playwright` - Browser automation framework
- `@playwright/test` - Playwright testing framework
- `tsx` - TypeScript execution and development
- `dotenv` - Environment variable management

### Development
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

## Project Structure

```
src/
├── agents/                      # Claude agents system
│   ├── types.ts                # Shared type definitions
│   ├── orchestrator.ts         # Main orchestration logic
│   ├── website-analyzer.ts     # Website analysis agent
│   ├── scenario-generator.ts   # Test scenario generation
│   ├── testcase-generator.ts   # Test case creation
│   ├── test-runner.ts          # Intelligent test execution with debugging
│   ├── test-result-analyzer.ts # Test result analysis and failure detection
│   └── claude-executor.ts      # Claude API integration
├── cli/                        # Interactive command line interface
│   └── interactive-config.ts   # Conversational configuration system
├── claude-agents-main.ts       # Entry point for agents system
validate/others/                # Validation examples
├── index.ts                    # Basic E2ERobot framework
├── claude-playwright-integration.ts # SDK integration
├── safe-code-executor.ts       # Secure code execution
└── [other examples]            # Various integration examples
```

## Development Notes

- All files use ES module syntax (import/export)
- Browser automation runs in non-headless mode by default for demonstration
- Code generation prompts designed to produce clean, executable Playwright code
- Safe execution prevents dangerous code patterns (eval, require, process access)
- Agent system supports 10-minute timeout for complex operations
- Output files generated in `claude-agents-output/` directory
- Chinese comments in integration examples reflect original project documentation

## Test Execution Features

### Intelligent Test Execution
- **Historical Analysis**: Automatically analyzes `test-results/` directory for previous test failures
- **Targeted Repair**: Identifies and individually fixes failed test cases before running full suite
- **Smart Strategy**: First-time execution runs complete suite; subsequent runs focus on fixing failures

### Automated Test Debugging
- **Multi-Round Debugging**: Up to 10 rounds of automated test debugging and fixing
- **Individual Test Repair**: Each failed test gets up to 3 repair attempts using targeted prompts
- **Bash Tool Integration**: Uses `npx playwright test` commands via bash tool for execution
- **Selective Testing**: Uses `--grep` flag to test individual cases during repair process

### Test Result Analysis
- **Multiple Format Support**: Parses JSON and XML test result files (Playwright, Jest, JUnit)
- **Failure Detection**: Extracts detailed error information from failed tests
- **Progress Tracking**: Tracks repair success/failure rates and generates comprehensive reports
- **Historical Comparison**: Compares current results with previous runs for improvement tracking

### Execution Workflow
1. **Pre-Execution Analysis**: Check `test-results/` for historical failures
2. **Strategic Execution**: Choose between full suite or targeted repair based on analysis
3. **Individual Repair**: Fix each failed test case with specific error-based prompts
4. **Full Validation**: Run complete test suite after repairs to verify overall success
5. **Comprehensive Reporting**: Generate detailed reports with repair statistics and recommendations

## Interactive Configuration System

### Conversational Setup
- **Interactive CLI**: Guided dialog-based configuration for test requirements
- **Site Configuration**: URL and site name setup through conversation
- **Requirement Specification**: Natural language description of test needs
- **Type Selection**: Multiple test type selection (functional, UX, performance, etc.)
- **Parameter Tuning**: Max test cases, priority levels, and timeout configuration

### Configuration Features
- **Persistence**: Automatic saving to `test-config.json` for reuse
- **Load Previous**: Option to modify existing configurations
- **Validation**: Input validation and sensible defaults
- **Preview**: Configuration summary before execution
- **Flexible Mode**: Interactive (default) or non-interactive with `--no-interactive`

### User Experience
- **Natural Dialog**: Question-answer flow for easy configuration
- **Smart Defaults**: Reasonable fallback values for all settings
- **Help Examples**: Inline examples and suggestions during setup
- **Configuration Review**: Complete summary before starting tests
- **Easy Restart**: Modify and reuse previous configurations