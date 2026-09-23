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
    const { name, imageUrl, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Category name is required' }, { status: 400 });
    }

    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl: imageUrl || null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error('Error in POST /api/admin/categories:', error);
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
    const { id, name, imageUrl, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Category id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error('Error in PUT /api/admin/categories:', error);
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
      return NextResponse.json({ ok: false, error: 'Category id is required' }, { status: 400 });
    }

    // Safety: check if active products exist
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { ok: false, error: `Ushbu kategoriyada ${count} ta mahsulot mavjud. Avval mahsulotlarni boshqa kategoriyaga o‘tkazing.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/categories:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
