import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// POST /api/import
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = getDB();

    // 开始事务
    db.exec('BEGIN TRANSACTION');

    try {
      // 导入 contents
      if (data.contents && Array.isArray(data.contents)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO contents (
            id, title, status, source, source_title, source_content,
            ai_summary, ai_relevance, ai_tags, ai_outline, ai_draft, ai_notes,
            my_draft, platform_versions, scheduled_at, published_at, published_urls,
            analytics, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const c of data.contents) {
          stmt.run(
            c.id,
            c.title,
            c.status,
            c.source || null,
            c.source_title || null,
            c.source_content || null,
            c.ai_summary || null,
            c.ai_relevance || null,
            c.ai_tags || null,
            c.ai_outline || null,
            c.ai_draft || null,
            c.ai_notes || null,
            c.my_draft || null,
            c.platform_versions || null,
            c.scheduled_at || null,
            c.published_at || null,
            c.published_urls || null,
            c.analytics || null,
            c.created_at,
            c.updated_at
          );
        }
      }

      // 导入 memories
      if (data.memories && Array.isArray(data.memories)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO memories (id, content, type, source_content_id, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const m of data.memories) {
          stmt.run(m.id, m.content, m.type, m.source_content_id || null, m.tags || null, m.created_at);
        }
      }

      // 导入 rss_sources
      if (data.rssSources && Array.isArray(data.rssSources)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO rss_sources (id, name, url, enabled, last_fetched_at, fetch_count)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const s of data.rssSources) {
          stmt.run(s.id, s.name, s.url, s.enabled, s.last_fetched_at || null, s.fetch_count || 0);
        }
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
