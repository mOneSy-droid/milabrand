import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { memoryCart, getInitialProducts } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);

    if (user) {
      try {
        const items = await prisma.cartItem.findMany({
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

        if (items && items.length > 0) {
          let totalAmount = 0;
          let totalQuantity = 0;

          const formattedItems = items.map((item) => {
            const p = item.product;
            const priceNum = Number(p.price);
            const oldPriceNum = p.oldPrice ? Number(p.oldPrice) : null;
            let discountPercentage: number | null = null;

            if (oldPriceNum && oldPriceNum > priceNum) {
              discountPercentage = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
            }

            totalAmount += priceNum * item.quantity;
            totalQuantity += item.quantity;

            return {
              id: item.id,
              userId: item.userId,
              productId: item.productId,
              quantity: item.quantity,
              selected: true,
              product: {
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
                createdAt: p.createdAt.toISOString(),
              },
            };
          });

          return NextResponse.json({
            ok: true,
            cart: { items: formattedItems, totalQuantity, totalAmount },
          });
        }
      } catch (dbError) {
        console.warn('[DB] Prisma query failed in /api/cart, using memory cart:', dbError);
      }
    }
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
  }

  // Fallback from memoryCart
  const allProducts = getInitialProducts();
  const prodMap = new Map(allProducts.map((p) => [p.id, p]));
  const items: any[] = [];
  let totalAmount = 0;
  let totalQuantity = 0;

  memoryCart.forEach((qty, pid) => {
    const prod = prodMap.get(pid);
    if (prod && qty > 0) {
      totalAmount += prod.price * qty;
      totalQuantity += qty;
      items.push({
        id: `cart-${pid}`,
        userId: 'demo-user',
        productId: pid,
        quantity: qty,
        selected: true,
        product: prod,
      });
    }
  });

  return NextResponse.json({
    ok: true,
    cart: { items, totalQuantity, totalAmount },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'productId is required' }, { status: 400 });
    }

    const validQty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    if (user) {
      try {
        const cartItem = await prisma.cartItem.upsert({
          where: { userId_productId: { userId: user.id, productId } },
          update: { quantity: { increment: validQty } },
          create: { userId: user.id, productId, quantity: validQty },
          include: { product: true },
        });
        return NextResponse.json({ ok: true, cartItem });
      } catch (dbError) {
        console.warn('[DB] Prisma upsert failed in /api/cart, using memory cart:', dbError);
      }
    }

    // Memory fallback
    const current = memoryCart.get(productId) || 0;
    const newQty = current + validQty;
    memoryCart.set(productId, newQty);

    return NextResponse.json({ ok: true, quantity: newQty });
  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ ok: false, error: 'productId and quantity are required' }, { status: 400 });
    }

    if (user) {
      try {
        if (quantity <= 0) {
          await prisma.cartItem.deleteMany({
            where: { userId: user.id, productId },
          });
          return NextResponse.json({ ok: true, quantity: 0, removed: true });
        }

        const updated = await prisma.cartItem.update({
          where: { userId_productId: { userId: user.id, productId } },
          data: { quantity: Math.min(99, quantity) },
        });
        return NextResponse.json({ ok: true, cartItem: updated });
      } catch (dbError) {
        console.warn('[DB] Prisma update failed in /api/cart, using memory cart:', dbError);
      }
    }

    // Memory fallback
    if (quantity <= 0) {
      memoryCart.delete(productId);
      return NextResponse.json({ ok: true, quantity: 0, removed: true });
    }

    const safeQty = Math.min(99, Math.max(1, quantity));
    memoryCart.set(productId, safeQty);
    return NextResponse.json({ ok: true, quantity: safeQty });
  } catch (error) {
    console.error('Error in PUT /api/cart:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const clear = searchParams.get('clear');

    if (user) {
      try {
        if (clear === 'true') {
          await prisma.cartItem.deleteMany({ where: { userId: user.id } });
          return NextResponse.json({ ok: true, message: 'Cart cleared' });
        }
        if (productId) {
          await prisma.cartItem.deleteMany({ where: { userId: user.id, productId } });
          return NextResponse.json({ ok: true, message: 'Item removed' });
        }
      } catch (dbError) {
        console.warn('[DB] Prisma delete failed in /api/cart, using memory cart:', dbError);
      }
    }

    // Memory fallback
    if (clear === 'true') {
      memoryCart.clear();
      return NextResponse.json({ ok: true, message: 'Cart cleared' });
    }

    if (productId) {
      memoryCart.delete(productId);
      return NextResponse.json({ ok: true, message: 'Item removed' });
    }

    return NextResponse.json({ ok: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
