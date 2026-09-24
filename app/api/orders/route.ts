import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { getAdminIds, BOT_TOKEN } from '@/bot/config';

/**
 * Sends a Telegram notification message to a specific chat/user
 */
async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN || BOT_TOKEN === 'mock_bot_token_for_dev') return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error(`Failed to send Telegram message to ${chatId}:`, err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const effectiveUser = user || {
      id: 'guest',
      firstName: 'Mijoz',
      lastName: null,
      username: null,
      phone: null,
      telegramId: null,
    };

    const body = await req.json();
    const { address = '', notes = '', items: requestedItems } = body;

    let cartItems: any[] = [];
    let totalAmount = 0;

    try {
      cartItems = await prisma.cartItem.findMany({
        where: { userId: effectiveUser.id },
        include: { product: true },
      });
    } catch (e) {
      console.warn('[DB] Prisma findMany cart items failed, using requested items');
    }

    // Fallback if memory cart or requestedItems provided
    if (cartItems.length === 0 && Array.isArray(requestedItems) && requestedItems.length > 0) {
      cartItems = requestedItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ ok: false, error: 'Savatingiz bo‘sh' }, { status: 400 });
    }

    // Calculate total amount
    totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    let orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Try saving Order and OrderItems to database
    try {
      const order = await prisma.order.create({
        data: {
          userId: effectiveUser.id,
          totalAmount,
          phone: effectiveUser.phone || 'Ko‘rsatilmagan',
          address,
          notes,
          status: 'PENDING',
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });
      orderId = order.id;

      // Clear user cart
      await prisma.cartItem.deleteMany({
        where: { userId: effectiveUser.id },
      });
    } catch (dbErr) {
      console.warn('[DB] Prisma order creation failed, proceeding with in-memory order notification');
    }

    // Prepare Telegram message
    const customerName = [effectiveUser.firstName, effectiveUser.lastName].filter(Boolean).join(' ') || 'Mijoz';
    const usernameText = effectiveUser.username ? `@${effectiveUser.username}` : 'Mavjud emas';

    let itemsListText = '';
    cartItems.forEach((item, idx) => {
      const p = item.product;
      const itemTotal = Number(p.price) * item.quantity;
      itemsListText += `${idx + 1}. <b>${p.name}</b>\n   ${item.quantity} ta × ${Number(p.price).toLocaleString('uz-UZ')} = <b>${itemTotal.toLocaleString('uz-UZ')} UZS</b>\n`;
    });

    // 1. Notify Admins
    const adminMessage =
      `🛍 <b>YANGI BUYURTMA! #${orderId.slice(-6)}</b>\n\n` +
      `👤 <b>Mijoz:</b> ${customerName} (${usernameText})\n` +
      `📱 <b>Telefon:</b> <code>${effectiveUser.phone || 'Ko‘rsatilmagan'}</code>\n` +
      `📍 <b>Manzil:</b> ${address || 'Ko‘rsatilmagan'}\n` +
      `📝 <b>Izoh:</b> ${notes || 'Yo‘q'}\n\n` +
      `📦 <b>Mahsulotlar:</b>\n${itemsListText}\n` +
      `💰 <b>JAMI SUMMA:</b> <b>${totalAmount.toLocaleString('uz-UZ')} UZS</b>\n\n` +
      `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    const adminIds = getAdminIds();
    for (const adminId of adminIds) {
      await sendTelegramMessage(adminId, adminMessage);
    }

    // 2. Notify Customer
    const customerMessage =
      `✅ <b>Sizning buyurtmangiz qabul qilindi!</b>\n\n` +
      `Buyurtma raqami: <b>#${orderId.slice(-6)}</b>\n` +
      `Jami summa: <b>${totalAmount.toLocaleString('uz-UZ')} UZS</b>\n\n` +
      `📦 <b>Tanlangan mahsulotlar:</b>\n${itemsListText}\n` +
      `📍 Yetkazib berish manzili: ${address || 'Telefon orqali aniqlanadi'}\n\n` +
      `Menejerimiz tez orada siz bilan bog‘lanadi. MILA Luxury Brand bilan xarid qilganingiz uchun rahmat! 💎`;

    if (effectiveUser.telegramId) {
      await sendTelegramMessage(effectiveUser.telegramId, customerMessage);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      totalAmount,
      message: 'Buyurtmangiz muvaffaqiyatli qabul qilindi!',
    });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user, isVerified, error } = await getAuthenticatedUser(req);
    if (!user || !isVerified) {
      return NextResponse.json({ ok: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    try {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ ok: true, orders });
    } catch (dbErr) {
      console.warn('[DB] Prisma query failed in GET /api/orders');
      return NextResponse.json({ ok: true, orders: [] });
    }
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
