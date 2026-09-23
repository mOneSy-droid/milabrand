import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { INITIAL_CATEGORIES } from '@/lib/mock-data';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json({ ok: true, categories });
    }
  } catch (error) {
    console.warn('[DB] Database connection error in /api/categories, serving initial categories:', error);
  }

  return NextResponse.json({
    ok: true,
    categories: INITIAL_CATEGORIES,
  });
}
