import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRss, addRssToInbox } from '@/lib/rss-fetcher';

// POST /api/rss/fetch
export async function POST(request: NextRequest) {
  try {
    const results = await fetchAllRss();
    
    let addedCount = 0;
    const added: string[] = [];
    
    for (const { source, articles } of results) {
      for (const article of articles) {
        const id = addRssToInbox(source, article);
        if (id) {
          addedCount++;
          added.push(article.title);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      fetched: results.reduce((sum, r) => sum + r.articles.length, 0),
      added: addedCount,
      articles: added,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
