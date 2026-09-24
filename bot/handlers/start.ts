import { Context } from 'grammy';
import prisma from '../../lib/prisma';
import { isAdmin, WEB_APP_URL, getSafeWebAppUrl, getOpenShopInlineKeyboard } from '../config';

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
            [{ text: '🛍 MILA Shop (Web App)', ...(getSafeWebAppUrl().startsWith('https://') ? { web_app: { url: getSafeWebAppUrl() } } : {}) }],
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

    const webAppUrl = getSafeWebAppUrl();
    const isHttps = webAppUrl.startsWith('https://');

    if (existingUser && existingUser.isVerified && existingUser.phone) {
      // Set chat menu button to Web App
      try {
        await ctx.api.setChatMenuButton({
          chat_id: from.id,
          menu_button: {
            type: 'web_app',
            text: '🛍 Saytni ochish',
            web_app: { url: webAppUrl },
          },
        });
      } catch (e) {}

      await ctx.reply(
        `Xush kelibsiz, <b>${existingUser.firstName || 'hurmatli mijoz'}</b>!\n\n` +
        `MILA Luxury Fashion katalogini ochish va xaridlarni boshlash uchun quyidagi havola yoki tugmani bosing:\n\n` +
        `🔗 <b>Sayt havolasi:</b> <a href="${webAppUrl}">${webAppUrl}</a>`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: getOpenShopInlineKeyboard(webAppUrl),
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
