import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { getInitialProducts, memoryFavorites, memoryCart } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await getAuthenticatedUser(req);

    try {
      const product = await prisma.product.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (product) {
        let isFavorite = false;
        let cartQuantity = 0;

        if (user) {
          const [fav, cartItem] = await Promise.all([
            prisma.favorite.findUnique({
              where: { userId_productId: { userId: user.id, productId: product.id } },
            }),
            prisma.cartItem.findUnique({
              where: { userId_productId: { userId: user.id, productId: product.id } },
            }),
          ]);

          isFavorite = !!fav;
          cartQuantity = cartItem?.quantity || 0;
        }

        const priceNum = Number(product.price);
        const oldPriceNum = product.oldPrice ? Number(product.oldPrice) : null;
        let discountPercentage: number | null = null;

        if (oldPriceNum && oldPriceNum > priceNum) {
          discountPercentage = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
        }

        return NextResponse.json({
          ok: true,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            category: product.category,
            price: priceNum,
            oldPrice: oldPriceNum,
            discountPercentage,
            description: product.description,
            isActive: product.isActive,
            rating: Number(product.rating),
            reviewCount: product.reviewCount,
            images: product.images.map((img) => ({
              id: img.id,
              productId: img.productId,
              telegramFileId: img.telegramFileId,
              sortOrder: img.sortOrder,
            })),
            isFavorite,
            cartQuantity,
            createdAt: product.createdAt.toISOString(),
          },
        });
      }
    } catch (dbErr) {
      console.warn('[DB] Prisma query failed in /api/products/[id], using mock lookup');
    }

    // Mock fallback
    const allProducts = getInitialProducts();
    const found = allProducts.find((p) => p.id === id || p.slug === id);

    if (!found) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      product: {
        ...found,
        isFavorite: memoryFavorites.has(found.id),
        cartQuantity: memoryCart.get(found.id) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}
