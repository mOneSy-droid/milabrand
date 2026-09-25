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

  // 3. User is not verified: Reset menu button and ask to register first
  try {
    await ctx.api.setChatMenuButton({
      chat_id: from.id,
      menu_button: { type: 'default' },
    });
  } catch (e) {}

  await ctx.reply(
    `✨ <b>MILA Luxury Brand rasmiy botiga xush kelibsiz!</b>\n\n` +
    `Web App do‘konimizga kirish, sumkalar katalogini ko‘rish va xarid qilish uchun avval ro‘yxatdan o‘tishingiz lozim.\n\n` +
    `Iltimos, pastdagi <b>[ 📱 Ro‘yxatdan o‘tish (Telefon raqamni yuborish) ]</b> tugmasini bosing:`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '📱 Ro‘yxatdan o‘tish (Telefon raqamni yuborish)', request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}
