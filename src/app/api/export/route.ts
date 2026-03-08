import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// GET /api/export?format=json|markdown
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const db = getDB();

    if (format === 'json') {
      // 导出完整 JSON
      const contents = db.prepare('SELECT * FROM contents ORDER BY created_at DESC').all();
      const memories = db.prepare('SELECT * FROM memories ORDER BY created_at DESC').all();
      const rssSources = db.prepare('SELECT * FROM rss_sources').all();

      return NextResponse.json({
        version: '3.0',
        exportedAt: new Date().toISOString(),
        contents,
        memories,
        rssSources,
      });
    }

    if (format === 'markdown') {
      // 导出为 Markdown
      const contents = db.prepare(
        "SELECT * FROM contents WHERE status = 'published' ORDER BY published_at DESC"
      ).all() as any[];

      let markdown = '# Mission Control 导出\n\n';
      markdown += `生成时间: ${new Date().toLocaleString()}\n\n`;
      markdown += `---\n\n`;

      for (const c of contents) {
        markdown += `# ${c.title}\n\n`;
        if (c.my_draft) {
          markdown += c.my_draft + '\n\n';
        } else if (c.ai_draft) {
          markdown += c.ai_draft + '\n\n';
        }
        if (c.ai_tags) {
          const tags = JSON.parse(c.ai_tags);
          markdown += `标签: ${tags.join(', ')}\n\n`;
        }
        if (c.published_at) {
          markdown += `发布时间: ${new Date(c.published_at).toLocaleDateString()}\n\n`;
        }
        markdown += '---\n\n';
      }

      return new NextResponse(markdown, {
        headers: { 'Content-Type': 'text/markdown' },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
