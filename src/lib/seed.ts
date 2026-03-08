import { createContent, updateContentStatus } from './contents';
import { createMemory } from './memories';

export function seedSampleData(): { seeded: boolean; message: string } {
  const { getDB } = require('./db');
  const db = getDB();
  
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM contents');
  const { count } = checkStmt.get() as { count: number };
  
  if (count > 0) return { seeded: false, message: 'Already has content' };
  
  createContent({
    title: 'Anthropic vs 美国国防部：AI 与权力的冲突',
    source: 'https://stratechery.com/feed/',
    sourceTitle: 'Anthropic and Alignment',
    aiSummary: 'AI 公司试图保留决策权，政府要求控制，这是 AI 行业与国家权力冲突的预演',
    aiRelevance: 9,
    aiTags: ['AI', '政策', '权力', 'Anthropic'],
    aiNotes: '值得写一篇深度分析',
  });

  const content2 = createContent({
    title: 'Karpathy 的 microgpt：200 行代码理解 Transformer',
    source: 'http://karpathy.github.io/feed.xml',
    aiSummary: '用极简代码理解 Transformer 内部机制',
    aiRelevance: 8,
    aiTags: ['AI', '工程', '教育'],
    aiOutline: '1. 什么是 microgpt\n2. 核心代码解读',
  });
  updateContentStatus(content2, 'research');

  const content3 = createContent({
    title: '我的内容创作系统 v3.0',
    aiSummary: '重构 Mission Control 的思考与实践',
    aiRelevance: 10,
    aiTags: ['创作者经济', '系统', '生产力'],
    aiDraft: '在过去的一年里...',
  });
  updateContentStatus(content3, 'writing');

  const content4 = createContent({
    title: 'AI Agent 架构设计',
    aiSummary: '用 Karpathy + Linus 的双重视角分析 Agent 系统',
    aiRelevance: 9,
    aiTags: ['AI', '系统架构', 'Agent'],
    myDraft: '设计 AI Agent 系统时...',
  });
  updateContentStatus(content4, 'published');
  
  const now = Date.now();
  db.prepare('UPDATE contents SET published_at = ? WHERE id = ?').run(now - 7 * 24 * 60 * 60 * 1000, content4);

  createMemory({ content: 'Karpathy teaching: 从第一性原理出发', type: 'insight', tags: ['AI', '教育'] });
  createMemory({ content: 'Dan Koe: 独特护城河 = 只有你能看到的视角', type: 'insight', tags: ['创作者经济'] });
  createMemory({ content: '偏好周三 21:00 发布内容', type: 'preference', tags: ['发布策略'] });

  return { seeded: true, message: 'Created 4 contents and 3 memories' };
}
