import { NextRequest, NextResponse } from 'next/server';
import { getInbox, getPipeline, getAllContents, createContent, deleteContent, updateContentStatus, updateContent } from '@/lib/contents';

// GET /api/contents?type=inbox|pipeline|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'inbox') {
      const contents = getInbox();
      return NextResponse.json(contents);
    }

    if (type === 'pipeline') {
      const pipeline = getPipeline();
      return NextResponse.json(pipeline);
    }

    // 获取所有内容（用于Insights）
    if (type === 'all' || !type) {
      const contents = getAllContents();
      return NextResponse.json(contents);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/contents
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const id = createContent(data);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/contents?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    deleteContent(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH /api/contents?id=xxx
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const data = await request.json();
    
    if (data.status) {
      updateContentStatus(Number(id), data.status);
    } else {
      updateContent(Number(id), data);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
