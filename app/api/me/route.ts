import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const { user, isVerified, error } = await getAuthenticatedUser(req);

    if (!user || !isVerified) {
      return NextResponse.json({ ok: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
