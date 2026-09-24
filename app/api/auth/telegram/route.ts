import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateTelegramInitData } from '@/lib/telegram-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const initData = body.initData || req.headers.get('x-telegram-init-data') || '';

    if (!initData) {
      // In development mode, allow fallback to demo user
      if (process.env.NODE_ENV === 'development') {
        const demo = await prisma.user.findFirst({ where: { isVerified: true } });
        if (demo) {
          return NextResponse.json({
            ok: true,
            verified: true,
            isDevPreview: true,
            user: {
              id: demo.id,
              telegramId: demo.telegramId.toString(),
              firstName: demo.firstName,
              lastName: demo.lastName,
              username: demo.username,
              phone: demo.phone,
              isVerified: demo.isVerified,
              createdAt: demo.createdAt.toISOString(),
            },
          });
        }
      }

      return NextResponse.json(
        { ok: false, verified: false, error: 'Telegram initData is required' },
        { status: 400 }
      );
    }

    // Cryptographic validation
    const authResult = validateTelegramInitData(initData);
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { ok: false, verified: false, error: authResult.error || 'Cryptographic validation failed' },
        { status: 401 }
      );
    }

    const telegramId = BigInt(authResult.user.id);
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { telegramId },
      });
    } catch (e) {
      // Prisma error fallback
    }

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            telegramId,
            firstName: authResult.user.first_name,
            lastName: authResult.user.last_name || null,
            username: authResult.user.username || null,
            phone: '',
            isVerified: true,
          },
        });
      } catch (e) {
        // Fallback
      }
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/telegram:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
