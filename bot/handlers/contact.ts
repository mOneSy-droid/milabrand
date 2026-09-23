import { Context } from 'grammy';
import prisma from '../../lib/prisma';
import { WEB_APP_URL } from '../config';

/**
 * Normalizes a phone number to international format, e.g. +998901234567
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
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

  // STRICT VALIDATION: contact.user_id must match message.from.id
  if (!contact.user_id || contact.user_id !== fromUser.id) {
    await ctx.reply(
      '⚠️ Xatolik: Iltimos, faqat o‘zingizning Telegram akkauntingizga tegishli telefon raqamingizni yuboring.\n\nBoshqa shaxsning kontaktini yuborish mumkin emas.',
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

    // Show success message and WebApp button
    await ctx.reply(
      '✅ Telefon raqamingiz tasdiqlandi.\n\nEndi MILA katalogidan foydalanishingiz mumkin.',
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
  } catch (error) {
    console.error('[BOT] Error saving verified user:', error);
    await ctx.reply(
      'Serverda xatolik yuz berdi. Iltimos, birozdan so‘ng /start buyrug‘ini qayta yuboring.'
    );
  }
}
