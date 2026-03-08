import { NextRequest, NextResponse } from 'next/server';
import { updateContentStatus } from '@/lib/contents';

// PATCH /api/contents/batch - 批量更新
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { ids, status } = data;
    
    if (!Array.isArray(ids) || !status) {
      return NextResponse.json(
        { error: 'ids (array) and status required' },
        { status: 400 }
      );
    }

    // 批量更新
    const results = [];
    for (const id of ids) {
      try {
        updateContentStatus(Number(id), status);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false, error: String(e) });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    
    return NextResponse.json({
      success: true,
      total: ids.length,
      updated: successCount,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
