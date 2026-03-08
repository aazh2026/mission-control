# Mission Control v3.0

AI-Native Creator OS - 基于 Karpathy + Linus 双重视角重构

## 架构原则

1. **极简数据模型** - 从 6 张表简化到 3 张表
2. **AI 原生设计** - 每个环节都有 AI 辅助
3. **单人流线** - 删除所有协作/团队功能
4. **事件驱动** - 所有操作记录为事件流

## 页面结构 (3 Pages)

| 页面 | 功能 |
|------|------|
| **Inbox** | RSS 抓取 + AI 分析 + 选题决策 |
| **Pipeline** | 看板流 + AI 辅助创作 |
| **Insights** | AI 周报 + 数据洞察 + 知识库搜索 |

## 数据模型

```
contents      - 统一内容实体 (idea → published)
memories      - 知识库
events        - 事件流 (可追溯)
rssSources    - RSS 源配置
```

## 快速开始

```bash
# 安装依赖
npm install

# 配置 Convex
npx convex dev

# 初始化数据（在 Convex Dashboard 运行）
# 调用 seed.seedRssSources 和 seed.seedSampleContent

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 技术栈

- Next.js 15 + TypeScript
- Tailwind CSS
- Convex (数据库 + 实时同步)

## AI 集成点

| 触发条件 | AI Action |
|---------|-----------|
| RSS 抓取 | 分析文章、生成摘要、评分相关度 |
| 进入 writing | 生成大纲、初稿 |
| 进入 editing | 多平台版本转换 |
| 发布后 | 表现分析、周报生成 |
| 搜索记忆 | 语义检索、生成回答 |

## 对比 v2.0

| 指标 | v2.0 | v3.0 |
|-----|:----:|:----:|
| 页面数量 | 13 | 3 |
| 数据库表 | 6 | 3 |
| 功能聚焦 | 分散 | 创作流 |
| AI 集成 | 后期添加 | 原生设计 |
