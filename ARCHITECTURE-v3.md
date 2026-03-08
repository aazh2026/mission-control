# Mission Control v3.0 - AI-Native Creator OS

## 架构原则 (Karpathy + Linus)

1. **极简数据模型** - 2张表足够，不要6张
2. **AI 原生设计** - 每个环节都有AI辅助，不是事后添加
3. **单人流线** - 删除所有协作/团队功能
4. **事件驱动** - 所有操作记录为事件，可追溯

## 页面结构 (3 Pages)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Inbox   │  │ Pipeline │  │ Insights │
│  (选题)   │  │ (创作)   │  │ (洞察)   │
└──────────┘  └──────────┘  └──────────┘
```

## 数据模型

### Content (统一内容实体)
```typescript
{
  _id: Id<"contents">
  title: string
  status: "idea" | "research" | "writing" | "editing" | "scheduled" | "published"
  
  // 原始内容
  source?: string           // RSS URL 或手动输入
  sourceTitle?: string      // 原始标题
  sourceContent?: string    // 原文（RSS抓取或手动粘贴）
  
  // AI 生成字段
  aiSummary?: string        // 一句话摘要
  aiRelevance?: number      // 相关度评分 1-10
  aiTags?: string[]         // 自动分类标签
  aiOutline?: string        // 大纲建议
  aiDraft?: string          // AI 初稿
  aiNotes?: string          // AI 对内容的分析笔记
  
  // 创作内容
  myDraft?: string          // 我的最终稿件
  platformVersions?: {
    wechat?: string
    xiaohongshu?: string
    twitter?: string
  }
  
  // 发布信息
  scheduledAt?: number
  publishedAt?: number
  publishedUrls?: {
    wechat?: string
    xiaohongshu?: string
    twitter?: string
  }
  
  // 表现数据
  analytics?: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  
  // 关联
  relatedContentIds?: Id<"contents">[]
  memoryIds?: Id<"memories">[]
  
  // 元数据
  createdAt: number
  updatedAt: number
}
```

### Memory (知识库)
```typescript
{
  _id: Id<"memories">
  content: string           // 记忆内容
  type: "insight" | "fact" | "decision" | "preference"
  sourceContentId?: Id<"contents">  // 关联的Content
  tags: string[]
  embedding?: number[]      // 用于语义搜索
  createdAt: number
}
```

### Event (事件流)
```typescript
{
  _id: Id<"events">
  type: "rss_fetch" | "content_create" | "status_change" | 
        "ai_generate" | "publish" | "analytics_update"
  contentId?: Id<"contents">
  payload: object           // 事件详情
  createdAt: number
}
```

## AI 集成点

| 触发条件 | AI Action | 输出 |
|---------|-----------|------|
| RSS 抓取新文章 | `analyzeArticle` | summary, relevance, tags |
| Content 创建 | `generateOutline` | 结构化大纲 |
| 进入 writing 状态 | `generateDraft` | 基于历史风格的初稿 |
| 内容编辑完成 | `optimizeForPlatforms` | 多平台版本 |
| 进入 scheduled | `recommendTime` | 最佳发布时间 |
| 发布后 24h | `analyzePerformance` | 表现分析 |
| 每周日 | `generateWeeklyReport` | 周报+下周建议 |
| 用户搜索记忆 | `semanticSearch` | 相关记忆 + 生成回答 |

## 页面设计

### 1. Inbox 页面
- RSS 源列表（可开关）
- 抓取的文章卡片：标题、AI摘要、相关度评分
- 操作：一键创建 Content / 标记为已读 / 稍后处理

### 2. Pipeline 页面
- 看板：6列状态
- 卡片显示：标题、AI摘要、标签
- 点击展开：大纲、AI初稿、我的编辑
- 操作：状态流转、AI重新生成、发布

### 3. Insights 页面
- 周报卡片（AI生成）
- 数据统计（简单图表）
- 记忆搜索（自然语言）
- 趋势分析（RSS热点 vs 你的覆盖度）

## 删除的功能

- ❌ Team / Office / 数字办公室
- ❌ Cron 管理页面（后台自动）
- ❌ Tasks 独立页面（并入Pipeline）
- ❌ Calendar 独立页面（Pipeline的scheduled列）
- ❌ Publish Center（Pipeline中的发布动作）
- ❌ Settings 页面（配置写入.env）

## 技术栈

- Next.js 15 + TypeScript
- Tailwind CSS
- Convex (数据库 + 实时同步)
- OpenAI API (AI功能)
- RSS 抓取 (后台 Convex Action)
