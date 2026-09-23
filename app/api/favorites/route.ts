import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { memoryFavorites, getInitialProducts } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);

    if (user) {
      try {
        const favorites = await prisma.favorite.findMany({
          where: { userId: user.id },
          include: {
            product: {
              include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (favorites && favorites.length > 0) {
          const products = favorites.map((f) => {
            const p = f.product;
            const priceNum = Number(p.price);
            const oldPriceNum = p.oldPrice ? Number(p.oldPrice) : null;
            let discountPercentage: number | null = null;

            if (oldPriceNum && oldPriceNum > priceNum) {
              discountPercentage = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
            }

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              categoryId: p.categoryId,
              category: p.category,
              price: priceNum,
              oldPrice: oldPriceNum,
              discountPercentage,
              description: p.description,
              isActive: p.isActive,
              rating: Number(p.rating),
              reviewCount: p.reviewCount,
              images: p.images.map((img) => ({
                id: img.id,
                productId: img.productId,
                telegramFileId: img.telegramFileId,
                sortOrder: img.sortOrder,
              })),
              isFavorite: true,
              createdAt: p.createdAt.toISOString(),
            };
          });

          return NextResponse.json({ ok: true, favorites: products });
        }
      } catch (dbError) {
        console.warn('[DB] Prisma query failed in /api/favorites, using memory favorites:', dbError);
      }
    }
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
  }

  // Memory fallback
  const allProducts = getInitialProducts();
  const prodMap = new Map(allProducts.map((p) => [p.id, p]));
  const favList: any[] = [];

  memoryFavorites.forEach((pid) => {
    const prod = prodMap.get(pid);
    if (prod) {
      favList.push({ ...prod, isFavorite: true });
    }
  });

  return NextResponse.json({ ok: true, favorites: favList });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'productId is required' }, { status: 400 });
    }

    if (user) {
      try {
        const existing = await prisma.favorite.findUnique({
          where: { userId_productId: { userId: user.id, productId } },
        });

        if (existing) {
          await prisma.favorite.delete({ where: { id: existing.id } });
          return NextResponse.json({ ok: true, isFavorite: false });
        } else {
          await prisma.favorite.create({ data: { userId: user.id, productId } });
          return NextResponse.json({ ok: true, isFavorite: true });
        }
      } catch (dbError) {
        console.warn('[DB] Prisma favorite toggle failed, using memory favorites:', dbError);
      }
    }

    // Memory fallback
    if (memoryFavorites.has(productId)) {
      memoryFavorites.delete(productId);
      return NextResponse.json({ ok: true, isFavorite: false });
    } else {
      memoryFavorites.add(productId);
      return NextResponse.json({ ok: true, isFavorite: true });
    }
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'productId is required' }, { status: 400 });
    }

    if (user) {
      try {
        await prisma.favorite.deleteMany({
          where: { userId: user.id, productId },
        });
        return NextResponse.json({ ok: true, message: 'Removed from favorites' });
      } catch (dbError) {
        console.warn('[DB] Prisma favorite delete failed, using memory favorites:', dbError);
      }
    }

    memoryFavorites.delete(productId);
    return NextResponse.json({ ok: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
