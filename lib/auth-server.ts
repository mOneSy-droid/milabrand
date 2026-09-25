import { NextRequest } from 'next/server';
import prisma from './prisma';
import { validateTelegramInitData } from './telegram-auth';
import { AppUser } from './types';
import { DEMO_USER } from './mock-data';

/**
 * Extracts and cryptographically verifies Telegram user from Next.js request headers.
 * Resolves verified User from PostgreSQL database, with graceful fallback.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<{
  user: AppUser | null;
  isVerified: boolean;
  error?: string;
}> {
  const initData =
    req.headers.get('x-telegram-init-data') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!initData) {
    // If running in development and no initData provided, return demo user
    if (process.env.NODE_ENV === 'development') {
      try {
        const demoUser = await prisma.user.findFirst({
          where: { isVerified: true },
        });
        if (demoUser) {
          return {
            user: {
              id: demoUser.id,
              telegramId: demoUser.telegramId.toString(),
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              username: demoUser.username,
              phone: demoUser.phone,
              isVerified: demoUser.isVerified,
              createdAt: demoUser.createdAt.toISOString(),
            },
            isVerified: true,
          };
        }
      } catch (e) {
        // Database credentials not configured yet, fallback to DEMO_USER
      }

      return {
        user: DEMO_USER,
        isVerified: true,
      };
    }

    return { user: null, isVerified: false, error: 'Authorization header required' };
  }

  const authResult = validateTelegramInitData(initData);
  if (!authResult.isValid || !authResult.user) {
    return { user: null, isVerified: false, error: authResult.error || 'Invalid Telegram initData' };
  }

  const telegramId = BigInt(authResult.user.id);
  try {
    const dbUser = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!dbUser || !dbUser.isVerified || !dbUser.phone || dbUser.phone.trim() === '') {
      return {
        user: null,
        isVerified: false,
        error: 'MILA do‘koniga kirish uchun avval Telegram botimizda ro‘yxatdan o‘ting.',
      };
    }

    return {
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegramId.toString(),
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        username: dbUser.username,
        phone: dbUser.phone,
        isVerified: dbUser.isVerified,
        createdAt: dbUser.createdAt.toISOString(),
      },
      isVerified: true,
    };
  } catch (err) {
    console.warn('[DB] Prisma query failed in getAuthenticatedUser, using mock demo user');
    return {
      user: {
        ...DEMO_USER,
        telegramId: authResult.user.id.toString(),
        firstName: authResult.user.first_name,
        lastName: authResult.user.last_name || null,
        username: authResult.user.username || null,
      },
      isVerified: true,
    };
  }
}
