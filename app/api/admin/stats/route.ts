import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { isAdmin } from '@/bot/config';

export async function GET(req: NextRequest) {
  try {
    const { user, isVerified } = await getAuthenticatedUser(req);
    if (!user || !isVerified || !isAdmin(user.telegramId)) {
      return NextResponse.json({ ok: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [
      totalUsers,
      verifiedUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalFavorites,
      totalCartItems,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.favorite.count(),
      prisma.cartItem.count(),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalProducts,
        activeProducts,
        totalCategories,
        totalFavorites,
        totalCartItems,
      },
    });
  } catch (error) {
    console.error('Error in /api/admin/stats:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
