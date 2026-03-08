import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyStats, getPipelineStats, getContentTags, seedRssSources } from '@/lib/rss';

// GET /api/rss?type=stats|tags|weekly
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'weekly') {
      const stats = getWeeklyStats();
      return NextResponse.json(stats);
    }

    if (type === 'pipeline') {
      const stats = getPipelineStats();
      return NextResponse.json(stats);
    }

    if (type === 'tags') {
      const tags = getContentTags();
      return NextResponse.json(tags);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/rss - 初始化数据
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'seed') {
      const result = seedRssSources();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
