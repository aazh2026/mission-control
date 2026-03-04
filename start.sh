#!/bin/bash
# Mission Control 启动脚本

cd /Users/openclaw/.openclaw/workspace/mission-control-app

echo "🚀 启动 Mission Control..."
echo ""
echo "步骤 1: 启动 Convex 后端 (按提示操作)"
echo "   - 选择: Start without an account (本地运行)"
echo "   - 输入: y (Continue)"
echo ""

# 在后台启动 convex
npx convex dev &
CONVEX_PID=$!

# 等待 convex 初始化
sleep 15

echo ""
echo "步骤 2: 启动 Next.js 前端..."
echo "   访问: http://localhost:3000"
echo ""

npm run dev

# 清理
kill $CONVEX_PID 2>/dev/null
