import { NextResponse } from 'next/server';
import { getStudents } from '@/lib/google-sheets';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
  }
}
