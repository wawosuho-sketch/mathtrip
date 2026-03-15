import { NextResponse } from 'next/server';
import { getContacts } from '@/lib/google-sheets';

export async function GET() {
  try {
    const contacts = await getContacts();
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
