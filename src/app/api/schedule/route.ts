import { NextResponse } from 'next/server';
import { getSchedules } from '@/lib/google-sheets';

export async function GET() {
  try {
    const schedules = await getSchedules();
    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch schedules' }, { status: 500 });
  }
}
