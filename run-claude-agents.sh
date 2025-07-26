#!/bin/bash
# Claude Agents 启动脚本
# 自动从项目根目录运行 claude-agents

# 找到脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 切换到项目根目录
cd "$SCRIPT_DIR"

# 运行 claude-agents
echo "🚀 从项目根目录启动 Claude Agents..."
pnpm claude-agents "$@"