import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { isAdmin } from '@/bot/config';

export async function POST(req: NextRequest) {
  try {
    const { user, isVerified } = await getAuthenticatedUser(req);
    if (!user || !isVerified || !isAdmin(user.telegramId)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, categoryId, price, oldPrice, description, images = [] } = body;

    if (!name || !categoryId || !price) {
      return NextResponse.json({ ok: false, error: 'name, categoryId and price are required' }, { status: 400 });
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        description: description || '',
        isActive: true,
        images: {
          create: images.map((img: { telegramFileId: string; sortOrder?: number }, idx: number) => ({
            telegramFileId: img.telegramFileId,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, isVerified } = await getAuthenticatedUser(req);
    if (!user || !isVerified || !isAdmin(user.telegramId)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, categoryId, price, oldPrice, description, isActive } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Product id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (price !== undefined) updateData.price = Number(price);
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? Number(oldPrice) : null;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error('Error in PUT /api/admin/products:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, isVerified } = await getAuthenticatedUser(req);
    if (!user || !isVerified || !isAdmin(user.telegramId)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Product id is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/products:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
