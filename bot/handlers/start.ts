import { Context } from 'grammy';
import prisma from '../../lib/prisma';
import { isAdmin, WEB_APP_URL } from '../config';

export async function handleStartCommand(ctx: Context) {
  const from = ctx.from;
  if (!from) return;

  // 1. Check if user is an Admin
  if (isAdmin(from.id)) {
    await ctx.reply(
      `👑 MILA ADMIN PANEL\n\nXush kelibsiz, Admin ${from.first_name || ''}!\nQuyidagi bo‘limlardan birini tanlang:`,
      {
        reply_markup: {
          keyboard: [
            [{ text: '➕ Tovar qo‘shish' }, { text: '📦 Tovarlar' }],
            [{ text: '🗂 Kategoriyalar' }, { text: '✏️ Tovarni tahrirlash' }],
            [{ text: '🗑 Tovarni o‘chirish' }, { text: '📊 Statistika' }],
            [{ text: '🛍 MILA Shop (Web App)', web_app: { url: WEB_APP_URL } }],
          ],
          resize_keyboard: true,
        },
      }
    );
    return;
  }

  // 2. Normal User Flow: Check if already verified in PostgreSQL
  try {
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (existingUser && existingUser.isVerified && existingUser.phone) {
      await ctx.reply(
        `Xush kelibsiz, ${existingUser.firstName || 'hurmatli mijoz'}!\n\nMILA Luxury Fashion katalogini ochish uchun quyidagi tugmani bosing:`,
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text: '🛍 MILA Shop',
                  web_app: { url: WEB_APP_URL },
                },
              ],
            ],
            resize_keyboard: true,
          },
        }
      );
      return;
    }
  } catch (error) {
    console.error('[BOT] Error checking user verification status:', error);
  }

  // 3. User is not verified: Ask for native Telegram contact
  await ctx.reply(
    `MILA Brand'ga xush kelibsiz.\n\nDavom etish uchun telefon raqamingizni tasdiqlang.`,
    {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Telefon nomer tasdiqlash', request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}
