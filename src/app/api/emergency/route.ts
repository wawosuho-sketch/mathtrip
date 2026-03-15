import { NextResponse } from 'next/server';
import { getEmergencyContacts } from '@/lib/google-sheets';

export async function GET() {
  try {
    const contacts = await getEmergencyContacts();
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch emergency contacts' }, { status: 500 });
  }
}
