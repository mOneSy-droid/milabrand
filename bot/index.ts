import { Bot } from 'grammy';
import { BOT_TOKEN, isAdmin } from './config';
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
} from './handlers/admin';
import {
  startAddProductWizard,
  handleWizardStep,
  handleWizardCallbackQuery,
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

  // Native contact sharing
  bot.on('message:contact', handleContactMessage);

  // Admin button actions (Admin Menu)
  bot.hears('➕ Tovar qo‘shish', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
      await startAddProductWizard(ctx);
    }
  });

  bot.hears('📦 Tovarlar', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
      await handleAdminProductsList(ctx, 1);
    }
  });

  bot.hears('🗂 Kategoriyalar', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
      await handleAdminCategories(ctx);
    }
  });

  bot.hears('🗑 Tovarni o‘chirish', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
      await handleAdminDeleteProductPrompt(ctx);
    }
  });

  bot.hears('✏️ Tovarni tahrirlash', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
      await handleAdminEditProductPrompt(ctx);
    }
  });

  bot.hears('📊 Statistika', async (ctx) => {
    if (isAdmin(ctx.from?.id || 0)) {
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

  // Generic message routing (Photos, Documents, Text input for wizards & admin actions)
  bot.on(['message:text', 'message:photo', 'message:document'], async (ctx) => {
    // 1. Check if admin is currently in Add Product wizard
    const handledByWizard = await handleWizardStep(ctx);
    if (handledByWizard) return;

    // 2. Check if admin is in single-step action (new category, edit price)
    const handledByAdminAction = await handleAdminActionText(ctx);
    if (handledByAdminAction) return;
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
