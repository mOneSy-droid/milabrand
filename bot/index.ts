import { Bot } from 'grammy';
import { BOT_TOKEN, isAdmin, getSafeWebAppUrl, getOpenShopInlineKeyboard } from './config';
import prisma from '../lib/prisma';
import { handleStartCommand } from './handlers/start';
import { handleContactMessage } from './handlers/contact';
import {
  handleAdminStats,
  handleAdminProductsList,
  handleAdminCategories,
  handleAdminDeleteProductPrompt,
  handleAdminEditProductPrompt,
  handleAdminCallbackQuery,
  handleAdminActionText,
  clearAdminAction,
} from './handlers/admin';
import {
  startAddProductWizard,
  handleWizardStep,
  handleWizardCallbackQuery,
  clearWizardState,
} from './handlers/product-wizard';

async function bootstrapBot() {
  console.log('🤖 Initializing MILA Telegram Bot...');

  if (!BOT_TOKEN || BOT_TOKEN === 'mock_bot_token_for_dev') {
    console.warn('⚠️ WARNING: Real BOT_TOKEN is not configured in .env.');
    console.warn('To start the live bot, configure BOT_TOKEN in .env and run `npm run bot`.');
    return;
  }

  const bot = new Bot(BOT_TOKEN);

  // Error handling
  bot.catch((err) => {
    console.error('❌ Bot error occurred:', err);
  });

  // /start command
  bot.command('start', handleStartCommand);

  // /cancel command
  bot.command('cancel', async (ctx) => {
    const from = ctx.from;
    if (!from) return;
    clearWizardState(from.id);
    clearAdminAction(from.id);
    await ctx.reply('❌ Barcha faol amallar bekor qilindi.', {
      reply_markup: isAdmin(from.id)
        ? {
            keyboard: [
              [{ text: '➕ Tovar qo‘shish' }, { text: '📦 Tovarlar' }],
              [{ text: '🗂 Kategoriyalar' }, { text: '✏️ Tovarni tahrirlash' }],
              [{ text: '🗑 Tovarni o‘chirish' }, { text: '📊 Statistika' }],
            ],
            resize_keyboard: true,
          }
        : undefined,
    });
  });

  // Native contact sharing
  bot.on('message:contact', handleContactMessage);

  // Admin button actions (Admin Menu)
  bot.hears('➕ Tovar qo‘shish', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearAdminAction(fromId);
      clearWizardState(fromId);
      await startAddProductWizard(ctx);
    }
  });

  bot.hears('📦 Tovarlar', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearWizardState(fromId);
      clearAdminAction(fromId);
      await handleAdminProductsList(ctx, 1);
    }
  });

  bot.hears('🗂 Kategoriyalar', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearWizardState(fromId);
      clearAdminAction(fromId);
      await handleAdminCategories(ctx);
    }
  });

  bot.hears('🗑 Tovarni o‘chirish', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearWizardState(fromId);
      clearAdminAction(fromId);
      await handleAdminDeleteProductPrompt(ctx);
    }
  });

  bot.hears('✏️ Tovarni tahrirlash', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearWizardState(fromId);
      clearAdminAction(fromId);
      await handleAdminEditProductPrompt(ctx);
    }
  });

  bot.hears('📊 Statistika', async (ctx) => {
    const fromId = ctx.from?.id || 0;
    if (isAdmin(fromId)) {
      clearWizardState(fromId);
      clearAdminAction(fromId);
      await handleAdminStats(ctx);
    }
  });

  // Callback query routing
  bot.on('callback_query:data', async (ctx) => {
    const handledByWizard = await handleWizardCallbackQuery(ctx);
    if (!handledByWizard) {
      await handleAdminCallbackQuery(ctx);
    }
  });

  // Generic message routing (Photos, Documents, Text input for wizards & admin actions & client fallback)
  bot.on(['message:text', 'message:photo', 'message:document'], async (ctx) => {
    // 1. Check if admin is currently in Add Product wizard
    const handledByWizard = await handleWizardStep(ctx);
    if (handledByWizard) return;

    // 2. Check if admin is in single-step action (new category, edit price, edit description)
    const handledByAdminAction = await handleAdminActionText(ctx);
    if (handledByAdminAction) return;

    // 3. Fallback for regular customer messages
    const from = ctx.from;
    if (from && !isAdmin(from.id)) {
      try {
        const user = await prisma.user.findUnique({
          where: { telegramId: BigInt(from.id) },
        });
        const webAppUrl = getSafeWebAppUrl();

        if (user && user.isVerified && user.phone) {
          await ctx.reply(
            `Hurmatli <b>${user.firstName || 'mijoz'}</b>!\n\n` +
            `MILA Luxury Brand sumkalar katalogini ko‘rish va xarid qilish uchun quyidagi havola orqali saytni ochishingiz mumkin:\n\n` +
            `🔗 <b>Sayt havolasi:</b> <a href="${webAppUrl}">${webAppUrl}</a>\n\n` +
            `Savollar yoki alohida buyurtmalar bo‘yicha: @milabranduz`,
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: getOpenShopInlineKeyboard(webAppUrl),
              },
            }
          );
        } else {
          await ctx.reply(
            `✨ MILA Luxury Brand do‘konidan to‘liq foydalanish uchun iltimos, avval ro‘yxatdan o‘ting.\n\n` +
            `Pastdagi <b>[ 📱 Ro‘yxatdan o‘tish (Telefon raqamni yuborish) ]</b> tugmasini bosing:`,
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
      } catch (e) {
        console.error('[BOT] Error in fallback text handler:', e);
      }
    }
  });

  console.log('🚀 MILA Telegram Bot is running...');
  bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} started successfully!`);
    },
  });
}

bootstrapBot().catch((err) => {
  console.error('Fatal bot bootstrap error:', err);
});
