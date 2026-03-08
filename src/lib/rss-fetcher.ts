import Parser from 'rss-parser';
import { getDB } from './db';

const rssParser = new Parser();

export interface RssArticle {
  title: string;
  link: string;
  content?: string;
  pubDate?: string;
}

// 抓取所有启用的 RSS 源
export async function fetchAllRss(): Promise<{ source: string; articles: RssArticle[] }[]> {
  const db = getDB();
  
  // 获取启用的 RSS 源
  const sources = db.prepare('SELECT * FROM rss_sources WHERE enabled = 1').all() as any[];
  
  const results = [];
  
  for (const source of sources) {
    try {
      const feed = await rssParser.parseURL(source.url);
      
      const articles: RssArticle[] = feed.items.slice(0, 5).map((item: any) => ({
        title: item.title || 'Untitled',
        link: item.link || item.guid,
        content: item.contentSnippet || item.content,
        pubDate: item.pubDate,
      }));
      
      results.push({
        source: source.name,
        articles,
      });
      
      // 更新最后抓取时间
      db.prepare('UPDATE rss_sources SET last_fetched_at = ?, fetch_count = fetch_count + 1 WHERE id = ?')
        .run(Date.now(), source.id);
        
    } catch (e) {
      console.error(`Failed to fetch ${source.name}:`, e);
      results.push({
        source: source.name,
        articles: [],
      });
    }
  }
  
  return results;
}

// 将 RSS 文章添加到 Inbox
export function addRssToInbox(source: string, article: RssArticle): number | null {
  const db = getDB();
  
  // 检查是否已存在（基于链接）
  const existing = db.prepare('SELECT id FROM contents WHERE source = ?').get(article.link);
  if (existing) {
    return null; // 已存在，跳过
  }
  
  // 添加到 Inbox
  const stmt = db.prepare(`
    INSERT INTO contents (title, status, source, source_title, source_content, created_at, updated_at)
    VALUES (?, 'idea', ?, ?, ?, ?, ?)
  `);
  
  const now = Date.now();
  const result = stmt.run(
    article.title,
    article.link,
    source,
    article.content?.substring(0, 500) || null, // 限制长度
    now,
    now
  );
  
  return result.lastInsertRowid as number;
}
