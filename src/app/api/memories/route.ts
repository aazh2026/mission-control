import { NextRequest, NextResponse } from 'next/server';
import { getAllMemories, createMemory, deleteMemory } from '@/lib/memories';

// GET /api/memories
export async function GET() {
  try {
    const memories = getAllMemories();
    return NextResponse.json(memories);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/memories
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const id = createMemory(data);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/memories?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    deleteMemory(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
