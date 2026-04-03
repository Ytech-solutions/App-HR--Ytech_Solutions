import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { normalizeRole } from '@/lib/iam';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const parsed = JSON.parse(session.value);
    const user = {
      ...parsed,
      role: normalizeRole(parsed.role),
    };
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
