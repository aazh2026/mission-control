# 🚀 Mission Control - OpenClaw 任务控制台

基于 TermMax 文章构建的 OpenClaw 任务控制台，使用 Next.js + Convex 全栈技术栈。

## 6 大组件

1. **📝 Tasks Board** - 任务看板：追踪谁在做什么、卡在哪里
2. **🔄 Content Pipeline** - 内容流水线：Idea → Script → Visual → Publish
3. **📅 Calendar** - 日历：定时任务排程与审计
4. **🧠 Memory** - 记忆库：可搜索的历史记录
5. **👥 Team** - 团队结构：Sub-agents 组织管理
6. **🏢 Office** - 数字办公室：实时状态仪表板

## 快速开始

### 1. 安装依赖
```bash
cd mission-control-app
npm install
```

### 2. 配置 Convex
```bash
# 登录 Convex
npx convex dev

# 首次运行会提示创建新项目，按提示操作
```

### 3. 配置环境变量
```bash
# 复制示例文件
cp .env.local.example .env.local

# Convex 会自动填充 NEXT_PUBLIC_CONVEX_URL
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 数据库 Schema

Convex schema 定义了以下表：
- `tasks` - 任务
- `pipelineItems` - 内容流水线项目
- `scheduledTasks` - 定时任务
- `memories` - 记忆
- `teamMembers` - 团队成员
- `agentStatus` - Agent 状态

## 功能特性

### Tasks Board
- 创建/编辑/删除任务
- 拖拽式状态变更 (todo → in_progress → done → blocked)
- 优先级设置 (P0/P1/P2/P3)
- 分配给 User 或 Agent

### Content Pipeline
- 四阶段流水线：灵感 → 脚本 → 视觉 → 发布
- 脚本编辑器
- 阶段推进
- 优先级管理

### Calendar
- Cron 定时任务管理
- 执行历史追踪
- 状态控制 (active/paused/completed)

### Memory
- 全文搜索
- 分类标签 (decision/preference/context/lesson)
- 来源追踪

### Team
- Sub-agents 组织
- 角色分类 (developer/writer/designer/researcher)
- 状态管理
- 工具清单

### Office
- 可视化办公室布局
- Agent 实时状态
- 工位分配

## 部署

### Vercel 部署
```bash
npm i -g vercel
vercel --prod
```

记得在 Vercel 控制台添加 `NEXT_PUBLIC_CONVEX_URL` 环境变量。

## 技术栈

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Convex (Serverless Database + Functions)
- **State Management**: Convex React Client

## 参考

- [TermMax 原文](https://mp.weixin.qq.com/s/KgzpV2lkg6A4TreAT4Cubw)
- [Convex 文档](https://docs.convex.dev)
- [Next.js 文档](https://nextjs.org/docs)
