import { NextRequest, NextResponse } from 'next/server';
import { seedSampleData } from '@/lib/seed';

// POST /api/seed
export async function POST(request: NextRequest) {
  try {
    const result = seedSampleData();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
