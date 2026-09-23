import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { getInitialProducts, memoryFavorites, memoryCart } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const sortParam = searchParams.get('sort') || 'popular';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
  const skip = (page - 1) * limit;

  // Optional user context for favorite and cart status
  const { user } = await getAuthenticatedUser(req);

  try {
    // Build Prisma where clause
    const where: any = { isActive: true };

    if (categoryParam && categoryParam !== 'all') {
      where.OR = [
        { categoryId: categoryParam },
        { category: { slug: categoryParam } },
      ];
    }

    if (searchParam && searchParam.trim()) {
      const term = searchParam.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    let orderBy: any = [{ createdAt: 'desc' }];
    if (sortParam === 'price_asc') {
      orderBy = [{ price: 'asc' }];
    } else if (sortParam === 'price_desc') {
      orderBy = [{ price: 'desc' }];
    } else if (sortParam === 'popular') {
      orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    if (products && products.length > 0) {
      let userFavorites = new Set<string>();
      let userCartMap = new Map<string, number>();

      if (user) {
        const productIds = products.map((p) => p.id);
        const [favs, cartItems] = await Promise.all([
          prisma.favorite.findMany({
            where: { userId: user.id, productId: { in: productIds } },
            select: { productId: true },
          }),
          prisma.cartItem.findMany({
            where: { userId: user.id, productId: { in: productIds } },
            select: { productId: true, quantity: true },
          }),
        ]);

        userFavorites = new Set(favs.map((f) => f.productId));
        cartItems.forEach((c) => userCartMap.set(c.productId, c.quantity));
      }

      const formatted = products.map((p) => {
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
          isFavorite: userFavorites.has(p.id),
          cartQuantity: userCartMap.get(p.id) || 0,
          createdAt: p.createdAt.toISOString(),
        };
      });

      return NextResponse.json({
        ok: true,
        products: formatted,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }
  } catch (error) {
    console.warn('[DB] Prisma query failed in /api/products, using mock products:', error);
  }

  // Graceful fallback from mock products
  let mockList = getInitialProducts();

  if (categoryParam && categoryParam !== 'all' && categoryParam !== 'cat-sumka' && categoryParam !== 'sumka') {
    mockList = [];
  }

  if (searchParam && searchParam.trim()) {
    const term = searchParam.trim().toLowerCase();
    mockList = mockList.filter(
      (p) => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term))
    );
  }

  if (sortParam === 'price_asc') {
    mockList.sort((a, b) => a.price - b.price);
  } else if (sortParam === 'price_desc') {
    mockList.sort((a, b) => b.price - a.price);
  }

  // Attach memory favorites and cart quantities
  const enhancedList = mockList.map((p) => ({
    ...p,
    isFavorite: memoryFavorites.has(p.id),
    cartQuantity: memoryCart.get(p.id) || 0,
  }));

  const total = enhancedList.length;
  const paginated = enhancedList.slice(skip, skip + limit);

  return NextResponse.json({
    ok: true,
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
