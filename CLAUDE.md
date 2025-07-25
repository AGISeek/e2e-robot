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
- `pnpm claude-agents` - Run Claude agents system
- `pnpm test-claude-agents` - Test Claude agents
- `pnpm demo-fixed` - Fixed integration demo with code cleaning
- `pnpm test-code-cleaning` - Test code cleaning functionality
- `pnpm test-safe-executor` - Test safe code execution

### Prerequisites for Claude Integration
- Set `ANTHROPIC_API_KEY` environment variable
- For CLI examples: Install Claude Code CLI with `npm install -g @anthropic-ai/claude-code`

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
- `TestRunner` - Executes tests and collects results
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
├── agents/                    # Claude agents system
│   ├── types.ts              # Shared type definitions
│   ├── orchestrator.ts       # Main orchestration logic
│   ├── website-analyzer.ts   # Website analysis agent
│   ├── scenario-generator.ts # Test scenario generation
│   ├── testcase-generator.ts # Test case creation
│   ├── test-runner.ts        # Test execution
│   └── claude-executor.ts    # Claude API integration
├── claude-agents-main.ts     # Entry point for agents system
validate/others/              # Validation examples
├── index.ts                  # Basic E2ERobot framework
├── claude-playwright-integration.ts # SDK integration
├── safe-code-executor.ts     # Secure code execution
└── [other examples]          # Various integration examples
```

## Development Notes

- All files use ES module syntax (import/export)
- Browser automation runs in non-headless mode by default for demonstration
- Code generation prompts designed to produce clean, executable Playwright code
- Safe execution prevents dangerous code patterns (eval, require, process access)
- Agent system supports 10-minute timeout for complex operations
- Output files generated in `claude-agents-output/` directory
- Chinese comments in integration examples reflect original project documentation