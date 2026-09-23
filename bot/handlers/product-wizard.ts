import { Context, InlineKeyboard } from 'grammy';
import prisma from '../../lib/prisma';
import { isAdmin } from '../config';

export interface AddProductWizardState {
  step:
    | 'PHOTO'
    | 'NAME'
    | 'CATEGORY'
    | 'PRICE'
    | 'OLD_PRICE'
    | 'DESCRIPTION'
    | 'EXTRA_PHOTOS'
    | 'CONFIRM';
  images: string[];
  name?: string;
  categoryId?: string;
  categoryName?: string;
  price?: number;
  oldPrice?: number | null;
  description?: string;
}

// In-memory wizard state for admins
const adminWizards = new Map<number, AddProductWizardState>();

export function getWizardState(adminId: number): AddProductWizardState | undefined {
  return adminWizards.get(adminId);
}

export function clearWizardState(adminId: number) {
  adminWizards.delete(adminId);
}

/**
 * Initiates the Add Product flow
 */
export async function startAddProductWizard(ctx: Context) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  adminWizards.set(from.id, {
    step: 'PHOTO',
    images: [],
  });

  await ctx.reply(
    `📸 1-QADAM: Yangi tovarning asosiy rasmini yuboring.\n\nSiz rasmni oddiy Telegram fotosurat yoki fayl/hujjat sifatida yuborishingiz mumkin.`,
    {
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true,
      },
    }
  );
}

/**
 * Extracts telegramFileId from a Photo or Document message
 */
export function extractFileIdFromMessage(ctx: Context): { fileId?: string; error?: string } {
  const msg = ctx.message;
  if (!msg) return { error: 'Xabar topilmadi' };

  if (msg.photo && msg.photo.length > 0) {
    // Pick the highest-resolution photo
    const bestPhoto = msg.photo[msg.photo.length - 1];
    return { fileId: bestPhoto.file_id };
  }

  if (msg.document) {
    const doc = msg.document;
    const mime = doc.mime_type || '';
    if (!mime.startsWith('image/')) {
      return { error: '⚠️ Faqat rasm formatidagi fayllarni yuboring (JPG, PNG, WEBP).' };
    }
    // Limit file size to 20MB
    if (doc.file_size && doc.file_size > 20 * 1024 * 1024) {
      return { error: '⚠️ Rasm hajmi 20MB dan oshmasligi kerak.' };
    }
    return { fileId: doc.file_id };
  }

  return { error: '⚠️ Iltimos, rasm yoki rasm faylini yuboring.' };
}

/**
 * Main message router for the Add Product Wizard
 */
export async function handleWizardStep(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return false;

  const state = adminWizards.get(from.id);
  if (!state) return false;

  const text = ctx.message?.text?.trim();

  // Cancel action
  if (text === '❌ Bekor qilish') {
    adminWizards.delete(from.id);
    await ctx.reply('❌ Tovar qo‘shish bekor qilindi.', {
      reply_markup: {
        keyboard: [
          [{ text: '➕ Tovar qo‘shish' }, { text: '📦 Tovarlar' }],
          [{ text: '🗂 Kategoriyalar' }, { text: '✏️ Tovarni tahrirlash' }],
          [{ text: '🗑 Tovarni o‘chirish' }, { text: '📊 Statistika' }],
        ],
        resize_keyboard: true,
      },
    });
    return true;
  }

  switch (state.step) {
    case 'PHOTO': {
      const { fileId, error } = extractFileIdFromMessage(ctx);
      if (error || !fileId) {
        await ctx.reply(error || 'Iltimos, mahsulot rasmini yuboring.');
        return true;
      }

      state.images.push(fileId);
      state.step = 'NAME';

      await ctx.reply('✅ Asosiy rasm qabul qilindi.\n\n🏷 2-QADAM: Mahsulot nomini kiriting:\n(Masalan: MILA Lady Dior - Powder Blue)');
      return true;
    }

    case 'NAME': {
      if (!text) {
        await ctx.reply('Iltimos, mahsulot nomini matn ko‘rinishida kiriting:');
        return true;
      }

      state.name = text;
      state.step = 'CATEGORY';

      // Load active categories from DB
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      const keyboard = new InlineKeyboard();
      categories.forEach((cat, idx) => {
        keyboard.text(cat.name, `wiz_cat_${cat.id}`);
        if (idx % 2 === 1) keyboard.row();
      });
      keyboard.row().text('➕ Yangi kategoriya', 'wiz_cat_new');

      await ctx.reply('🗂 3-QADAM: Mahsulot kategoriyasini tanlang:', {
        reply_markup: keyboard,
      });
      return true;
    }

    case 'PRICE': {
      if (!text) {
        await ctx.reply('Iltimos, narxni raqamda kiriting:');
        return true;
      }

      const num = parseInt(text.replace(/[^\d]/g, ''), 10);
      if (isNaN(num) || num <= 0) {
        await ctx.reply('⚠️ Noto‘g‘ri narx. Iltimos, musbat raqam kiriting (masalan: 549000):');
        return true;
      }

      state.price = num;
      state.step = 'OLD_PRICE';

      const keyboard = new InlineKeyboard().text('⏭ O‘tkazib yuborish (eski narxsiz)', 'wiz_skip_oldprice');
      await ctx.reply(
        `💰 Asosiy narx: ${num.toLocaleString('uz-UZ')} UZS.\n\n🏷 5-QADAM: Mahsulotning eski narxini kiriting (chegirma ko‘rinishi uchun):\nAgar eski narx bo‘lmasa, pastdagi tugmani bosing:`,
        { reply_markup: keyboard }
      );
      return true;
    }

    case 'OLD_PRICE': {
      if (!text) {
        await ctx.reply('Iltimos, eski narxni raqamda kiriting yoki "O‘tkazib yuborish" tugmasini bosing:');
        return true;
      }

      const num = parseInt(text.replace(/[^\d]/g, ''), 10);
      if (isNaN(num) || num <= 0) {
        await ctx.reply('⚠️ Noto‘g‘ri narx. Iltimos, musbat raqam kiriting:');
        return true;
      }

      state.oldPrice = num;
      state.step = 'DESCRIPTION';

      await ctx.reply('📝 6-QADAM: Mahsulot tavsifini kiriting:\n(Material, o‘lchami, xususiyatlari haqida)');
      return true;
    }

    case 'DESCRIPTION': {
      if (!text) {
        await ctx.reply('Iltimos, tavsif matnini kiriting:');
        return true;
      }

      state.description = text;
      state.step = 'EXTRA_PHOTOS';

      await ctx.reply(
        `🖼 7-QADAM: Qo‘shimcha rasmlar bormi?\n\nSiz yana fotosuratlar yoki fayllar yuborishingiz mumkin.\nTugatish uchun "✅ Tayyor" tugmasini bosing.`,
        {
          reply_markup: {
            keyboard: [[{ text: '✅ Tayyor' }], [{ text: '❌ Bekor qilish' }]],
            resize_keyboard: true,
          },
        }
      );
      return true;
    }

    case 'EXTRA_PHOTOS': {
      if (text === '✅ Tayyor') {
        state.step = 'CONFIRM';
        await showProductPreview(ctx, state);
        return true;
      }

      const { fileId, error } = extractFileIdFromMessage(ctx);
      if (error || !fileId) {
        await ctx.reply(error || 'Iltimos, rasm yuboring yoki "✅ Tayyor" tugmasini bosing.');
        return true;
      }

      state.images.push(fileId);
      await ctx.reply(`✅ Qo‘shimcha rasm qabul qilindi. Jami rasmlar: ${state.images.length} ta.\nYana rasm yuborishingiz yoki "✅ Tayyor" tugmasini bosishingiz mumkin.`);
      return true;
    }

    default:
      return false;
  }
}

/**
 * Shows the preview of the created product before final database persistence
 */
export async function showProductPreview(ctx: Context, state: AddProductWizardState) {
  const discountText =
    state.oldPrice && state.price && state.oldPrice > state.price
      ? `Chegirma: -${Math.round(((state.oldPrice - state.price) / state.oldPrice) * 100)}%`
      : 'Eski narx yo‘q';

  const preview = `💎 MILA PRODUCT PREVIEW\n\n` +
    `📦 Nomi: ${state.name}\n` +
    `🗂 Kategoriya: ${state.categoryName || 'Sumka'}\n` +
    `💰 Narxi: ${(state.price || 0).toLocaleString('uz-UZ')} UZS\n` +
    `🏷 Eski narxi: ${state.oldPrice ? state.oldPrice.toLocaleString('uz-UZ') + ' UZS' : 'Yo‘q'}\n` +
    `📊 ${discountText}\n` +
    `📝 Tavsif: ${state.description}\n` +
    `🖼 Rasmlar soni: ${state.images.length} ta\n\n` +
    `Tasdiqlaysizmi?`;

  const keyboard = new InlineKeyboard()
    .text('✅ Saqlash', 'wiz_save_product')
    .text('❌ Bekor qilish', 'wiz_cancel_product');

  await ctx.reply(preview, { reply_markup: keyboard });
}

/**
 * Handles callback queries for inline wizard buttons (Category selection, Skip, Save, Cancel)
 */
export async function handleWizardCallbackQuery(ctx: Context): Promise<boolean> {
  const callbackData = ctx.callbackQuery?.data;
  const from = ctx.from;
  if (!callbackData || !from || !isAdmin(from.id)) return false;

  const state = adminWizards.get(from.id);

  // Category selection callback
  if (callbackData.startsWith('wiz_cat_')) {
    await ctx.answerCallbackQuery();
    if (!state || state.step !== 'CATEGORY') return true;

    const catId = callbackData.replace('wiz_cat_', '');
    if (catId === 'new') {
      await ctx.reply('Yangi kategoriya yaratish uchun Telegram bot bosh menyusidan "🗂 Kategoriyalar" bo‘limiga kiring.');
      return true;
    }

    const category = await prisma.category.findUnique({ where: { id: catId } });
    if (!category) {
      await ctx.reply('Kategoriya topilmadi.');
      return true;
    }

    state.categoryId = category.id;
    state.categoryName = category.name;
    state.step = 'PRICE';

    await ctx.editMessageText(`✅ Tanlangan kategoriya: ${category.name}`);
    await ctx.reply('💰 4-QADAM: Mahsulot narxini kiriting (UZS):\n(Masalan: 549000)');
    return true;
  }

  // Skip old price
  if (callbackData === 'wiz_skip_oldprice') {
    await ctx.answerCallbackQuery();
    if (!state || state.step !== 'OLD_PRICE') return true;

    state.oldPrice = null;
    state.step = 'DESCRIPTION';

    await ctx.editMessageText('⏭ Eski narx o‘tkazib yuborildi.');
    await ctx.reply('📝 6-QADAM: Mahsulot tavsifini kiriting:\n(Material, o‘lchami, xususiyatlari haqida)');
    return true;
  }

  // Save product to database
  if (callbackData === 'wiz_save_product') {
    await ctx.answerCallbackQuery();
    if (!state || !state.name || !state.categoryId || !state.price) {
      await ctx.reply('⚠️ Xatolik: Barcha maydonlar to‘ldirilmagan.');
      return true;
    }

    try {
      // Generate slug
      const slugBase = state.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

      const product = await prisma.product.create({
        data: {
          name: state.name,
          slug: uniqueSlug,
          categoryId: state.categoryId,
          price: state.price,
          oldPrice: state.oldPrice || null,
          description: state.description || '',
          isActive: true,
          images: {
            create: state.images.map((fileId, idx) => ({
              telegramFileId: fileId,
              sortOrder: idx,
            })),
          },
        },
        include: { images: true },
      });

      adminWizards.delete(from.id);

      await ctx.editMessageText('🎉 Mahsulot muvaffaqiyatli saqlindi!');
      await ctx.reply(
        `✅ "${product.name}" mahsuloti MILA katalogiga qo‘shildi.\nID: ${product.id}\nRasmlar: ${product.images.length} ta saqlandi.`,
        {
          reply_markup: {
            keyboard: [
              [{ text: '➕ Tovar qo‘shish' }, { text: '📦 Tovarlar' }],
              [{ text: '🗂 Kategoriyalar' }, { text: '✏️ Tovarni tahrirlash' }],
              [{ text: '🗑 Tovarni o‘chirish' }, { text: '📊 Statistika' }],
            ],
            resize_keyboard: true,
          },
        }
      );
    } catch (err) {
      console.error('[BOT] Error saving wizard product:', err);
      await ctx.reply('Serverda xatolik yuz berdi. Mahsulot saqlanmadi.');
    }
    return true;
  }

  // Cancel wizard product
  if (callbackData === 'wiz_cancel_product') {
    await ctx.answerCallbackQuery();
    adminWizards.delete(from.id);
    await ctx.editMessageText('❌ Tovar qo‘shish bekor qilindi.');
    return true;
  }

  return false;
}
