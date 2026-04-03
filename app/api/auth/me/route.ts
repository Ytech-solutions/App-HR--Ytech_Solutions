import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { normalizeRole } from '@/lib/iam';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      const user = {
        ...sessionData,
        role: normalizeRole(sessionData.role),
      };
      return NextResponse.json({ user });
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
