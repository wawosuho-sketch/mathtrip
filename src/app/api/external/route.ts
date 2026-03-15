import { NextResponse } from 'next/server';
import { getExternal } from '@/lib/google-sheets';

export async function GET() {
  try {
    const externals = await getExternal();
    return NextResponse.json({ success: true, data: externals });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch external personnel' }, { status: 500 });
  }
}
