import { Context } from 'grammy';
import prisma from '../../lib/prisma';
import { WEB_APP_URL, getSafeWebAppUrl, getOpenShopInlineKeyboard } from '../config';

/**
 * Normalizes a phone number to international format, e.g. +998901234567
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let digits = rawPhone.replace(/[^\d]/g, '');
  if (digits.length === 9) {
    digits = '998' + digits;
  }
  return '+' + digits;
}

/**
 * Handles incoming native Telegram contact messages
 */
export async function handleContactMessage(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.contact || !message.from) {
    return;
  }

  const contact = message.contact;
  const fromUser = message.from;

  // STRICT VALIDATION: If contact is tied to a user_id, it must match the sender's id
  if (contact.user_id && contact.user_id !== fromUser.id) {
    await ctx.reply(
      '⚠️ Xatolik: Iltimos, faqat o‘zingizning Telegram akkauntingizga tegishli telefon raqamingizni yuboring.\n\nBoshqa shaxsning kontaktini yuborish mumkin emas.',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Ro‘yxatdan o‘tish (Telefon raqamni yuborish)', request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
    return;
  }

  const normalizedPhone = normalizePhoneNumber(contact.phone_number);

  try {
    // Save or update user in PostgreSQL
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(fromUser.id) },
      update: {
        firstName: fromUser.first_name || contact.first_name,
        lastName: fromUser.last_name || contact.last_name || null,
        username: fromUser.username || null,
        phone: normalizedPhone,
        isVerified: true,
      },
      create: {
        telegramId: BigInt(fromUser.id),
        firstName: fromUser.first_name || contact.first_name,
        lastName: fromUser.last_name || contact.last_name || null,
        username: fromUser.username || null,
        phone: normalizedPhone,
        isVerified: true,
      },
    });

    console.log(`[BOT] User registered/verified: ${user.telegramId} (${normalizedPhone})`);

    const webAppUrl = getSafeWebAppUrl();
    const isHttps = webAppUrl.startsWith('https://');

    // 1. Try setting native Telegram Web App menu button
    try {
      await ctx.api.setChatMenuButton({
        chat_id: fromUser.id,
        menu_button: {
          type: 'web_app',
          text: '🛍 Saytni ochish',
          web_app: { url: webAppUrl },
        },
      });
    } catch (e) {
      // Ignored
    }

    // 2. Update persistent reply keyboard to "Saytni ochish" (Web App)
    await ctx.reply('✅ Telefon raqamingiz muvaffaqiyatli tasdiqlandi!', {
      reply_markup: {
        keyboard: [
          [
            {
              text: '🛍 Saytni ochish',
              web_app: { url: webAppUrl },
            },
          ],
        ],
        resize_keyboard: true,
      },
    });

    // 3. Send interactive open button
    await ctx.reply(
      `🎉 <b>Tabriklaymiz, ro‘yxatdan muvaffaqiyatli o‘tdingiz!</b>\n\n` +
      `MILA Luxury Brand do‘konimizga xush kelibsiz.\n` +
      `Eksklyuziv sumkalar to‘plamini ko‘rish va xarid qilish uchun pastdagi <b>[ 🛍 Saytni ochish ]</b> tugmasini bosing:`,
      {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: {
          inline_keyboard: getOpenShopInlineKeyboard(webAppUrl),
        },
      }
    );
  } catch (error) {
    console.error('[BOT] Error saving verified user:', error);
    await ctx.reply(
      'Serverda xatolik yuz berdi. Iltimos, birozdan so‘ng /start buyrug‘ini qayta yuboring.'
    );
  }
}
