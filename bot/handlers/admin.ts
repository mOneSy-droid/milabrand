import { Context, InlineKeyboard } from 'grammy';
import prisma from '../../lib/prisma';
import { isAdmin } from '../config';

// Active admin interaction state for single-step edits (e.g. creating category, editing price)
interface AdminActionState {
  type: 'NEW_CATEGORY' | 'EDIT_PRICE' | 'EDIT_DESC';
  targetId?: string;
}

const adminActions = new Map<number, AdminActionState>();

export function getAdminAction(adminId: number) {
  return adminActions.get(adminId);
}

export function clearAdminAction(adminId: number) {
  adminActions.delete(adminId);
}

/**
 * Handles "📊 Statistika"
 */
export async function handleAdminStats(ctx: Context) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  const [
    totalUsers,
    verifiedUsers,
    totalProducts,
    activeProducts,
    totalCategories,
    totalFavorites,
    totalCartItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.favorite.count(),
    prisma.cartItem.count(),
  ]);

  const message =
    `📊 MILA DO‘KON STATISTIKASI\n\n` +
    `👥 Jami foydalanuvchilar: ${totalUsers} ta\n` +
    `✅ Tasdiqlangan foydalanuvchilar: ${verifiedUsers} ta\n\n` +
    `📦 Jami mahsulotlar: ${totalProducts} ta\n` +
    `🟢 Faol mahsulotlar: ${activeProducts} ta\n` +
    `🗂 Kategoriyalar soni: ${totalCategories} ta\n\n` +
    `❤️ Sevimlilar soni: ${totalFavorites} ta\n` +
    `🛒 Savatdagi tovarlar: ${totalCartItems} ta\n\n` +
    `Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

  await ctx.reply(message);
}

/**
 * Handles "📦 Tovarlar" - Lists products with pagination and actions
 */
export async function handleAdminProductsList(ctx: Context, page = 1) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  const pageSize = 5;
  const skip = (page - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: true, images: true },
    }),
    prisma.product.count(),
  ]);

  if (products.length === 0) {
    await ctx.reply('📦 Hozircha do‘konda tovarlar mavjud emas.');
    return;
  }

  const totalPages = Math.ceil(total / pageSize);
  let text = `📦 TOVARLAR RO‘YXATI (Sahifa ${page}/${totalPages})\n\n`;

  const keyboard = new InlineKeyboard();

  products.forEach((p, idx) => {
    const statusIcon = p.isActive ? '🟢' : '🔴';
    text += `${skip + idx + 1}. ${statusIcon} ${p.name}\n`;
    text += `   Narx: ${Number(p.price).toLocaleString('uz-UZ')} UZS | Kat: ${p.category.name}\n`;
    text += `   Rasmlar: ${p.images.length} ta\n\n`;

    keyboard
      .text(`👁 ${p.name.slice(0, 14)}...`, `adm_view_${p.id}`)
      .text(p.isActive ? '🔴 O‘chirish' : '🟢 Yoqish', `adm_toggle_${p.id}`)
      .row();
  });

  // Pagination row
  const navRow: Array<{ text: string; data: string }> = [];
  if (page > 1) {
    navRow.push({ text: '⬅️ Oldingi', data: `adm_prod_page_${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: 'Keyingi ➡️', data: `adm_prod_page_${page + 1}` });
  }

  if (navRow.length > 0) {
    navRow.forEach((btn) => keyboard.text(btn.text, btn.data));
    keyboard.row();
  }

  await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Handles "🗂 Kategoriyalar"
 */
export async function handleAdminCategories(ctx: Context) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  let text = `🗂 DO‘KON KATEGORIYALARI\n\n`;
  const keyboard = new InlineKeyboard();

  categories.forEach((cat) => {
    const statusIcon = cat.isActive ? '🟢 Faol' : '⏳ Tez kunda';
    text += `• ${cat.name} (${cat.slug}) — ${statusIcon}\n`;
    text += `  Mahsulotlar soni: ${cat._count.products} ta\n\n`;

    keyboard
      .text(`${cat.name} (${cat.isActive ? 'Faol' : 'Kutilmoqda'})`, `cat_toggle_${cat.id}`)
      .row();
  });

  keyboard.text('➕ Yangi kategoriya yaratish', 'cat_create_new');

  await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Handles "🗑 Tovarni o‘chirish"
 */
export async function handleAdminDeleteProductPrompt(ctx: Context) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  if (products.length === 0) {
    await ctx.reply('O‘chirish uchun tovarlar mavjud emas.');
    return;
  }

  const keyboard = new InlineKeyboard();
  products.forEach((p) => {
    keyboard.text(`🗑 ${p.name.slice(0, 25)}`, `adm_del_confirm_${p.id}`).row();
  });

  await ctx.reply('Qaysi tovarni butunlay o‘chirmoqchisiz?', {
    reply_markup: keyboard,
  });
}

/**
 * Handles "✏️ Tovarni tahrirlash"
 */
export async function handleAdminEditProductPrompt(ctx: Context) {
  const from = ctx.from;
  if (!from || !isAdmin(from.id)) return;

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  if (products.length === 0) {
    await ctx.reply('Tahrirlash uchun tovarlar mavjud emas.');
    return;
  }

  const keyboard = new InlineKeyboard();
  products.forEach((p) => {
    keyboard.text(`✏️ ${p.name.slice(0, 25)}`, `adm_edit_options_${p.id}`).row();
  });

  await ctx.reply('Tahrirlash uchun tovarni tanlang:', {
    reply_markup: keyboard,
  });
}

/**
 * Handles Admin Callback Queries
 */
export async function handleAdminCallbackQuery(ctx: Context): Promise<boolean> {
  const data = ctx.callbackQuery?.data;
  const from = ctx.from;
  if (!data || !from || !isAdmin(from.id)) return false;

  // Pagination for products
  if (data.startsWith('adm_prod_page_')) {
    await ctx.answerCallbackQuery();
    const page = parseInt(data.replace('adm_prod_page_', ''), 10);
    await handleAdminProductsList(ctx, page);
    return true;
  }

  // Toggle product active status
  if (data.startsWith('adm_toggle_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_toggle_', '');
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) {
        await prisma.product.update({
          where: { id },
          data: { isActive: !product.isActive },
        });
        await ctx.editMessageText(
          `✅ "${product.name}" holati o‘zgartirildi: ${!product.isActive ? '🟢 Faol' : '🔴 Nofaol'}`
        );
      }
    } catch (err) {
      console.error('[BOT] Error toggling product status:', err);
    }
    return true;
  }

  // View product
  if (data.startsWith('adm_view_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_view_', '');
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, images: true },
      });
      if (product) {
        const details =
          `💎 MILA TOVAR TAFSILOTLARI\n\n` +
          `📦 Nomi: ${product.name}\n` +
          `🗂 Kategoriya: ${product.category?.name || 'Mavjud emas'}\n` +
          `💰 Narxi: ${Number(product.price).toLocaleString('uz-UZ')} UZS\n` +
          `🏷 Eski narxi: ${product.oldPrice ? Number(product.oldPrice).toLocaleString('uz-UZ') + ' UZS' : 'Yo‘q'}\n` +
          `🟢 Holati: ${product.isActive ? '🟢 Faol (Do‘konda ko‘rinadi)' : '🔴 Nofaol (Yashiringan)'}\n` +
          `🖼 Rasmlar soni: ${product.images.length} ta\n` +
          `📝 Tavsif: ${product.description || 'Yo‘q'}\n\n` +
          `ID: ${product.id}`;

        const keyboard = new InlineKeyboard()
          .text('💰 Narxini o‘zgartirish', `adm_change_price_${product.id}`)
          .text('📝 Tavsifni o‘zgartirish', `adm_change_desc_${product.id}`)
          .row()
          .text(product.isActive ? '🔴 Yashirish' : '🟢 Yoqish', `adm_toggle_${product.id}`)
          .text('🗑 Tovarni o‘chirish', `adm_del_confirm_${product.id}`);

        await ctx.reply(details, { reply_markup: keyboard });
      }
    } catch (err) {
      console.error('[BOT] Error viewing product:', err);
    }
    return true;
  }

  // Edit options menu for product
  if (data.startsWith('adm_edit_options_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_edit_options_', '');
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, images: true },
      });
      if (!product) {
        await ctx.reply('Mahsulot topilmadi.');
        return true;
      }

      const details =
        `✏️ MAHSULOTNI TAHRIRLASH\n\n` +
        `📦 Nomi: ${product.name}\n` +
        `🗂 Kategoriya: ${product.category?.name || 'Mavjud emas'}\n` +
        `💰 Narxi: ${Number(product.price).toLocaleString('uz-UZ')} UZS\n` +
        `🏷 Eski narxi: ${product.oldPrice ? Number(product.oldPrice).toLocaleString('uz-UZ') + ' UZS' : 'Yo‘q'}\n` +
        `🟢 Holati: ${product.isActive ? '🟢 Faol (Ko‘rinadi)' : '🔴 Nofaol (Yashiringan)'}\n` +
        `📝 Tavsif: ${product.description || 'Yo‘q'}\n\n` +
        `Quyidagi amallardan birini tanlang:`;

      const keyboard = new InlineKeyboard()
        .text('💰 Narxni o‘zgartirish', `adm_change_price_${product.id}`)
        .text('📝 Tavsifni o‘zgartirish', `adm_change_desc_${product.id}`)
        .row()
        .text(product.isActive ? '🔴 Yashirish' : '🟢 Faollashtirish', `adm_toggle_${product.id}`)
        .text('🗑 Tovarni o‘chirish', `adm_del_confirm_${product.id}`)
        .row()
        .text('❌ Bekor qilish', 'adm_edit_cancel');

      await ctx.reply(details, { reply_markup: keyboard });
    } catch (err) {
      console.error('[BOT] Error opening edit options:', err);
    }
    return true;
  }

  // Edit description trigger
  if (data.startsWith('adm_change_desc_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_change_desc_', '');
    adminActions.set(from.id, { type: 'EDIT_DESC', targetId: id });
    await ctx.reply('Mahsulot uchun yangi tavsif matnini kiriting:');
    return true;
  }

  // Edit cancel
  if (data === 'adm_edit_cancel') {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('❌ Tahrirlash bekor qilindi.');
    return true;
  }

  // Delete confirmation
  if (data.startsWith('adm_del_confirm_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_del_confirm_', '');
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        await ctx.reply('Tovar topilmadi.');
        return true;
      }

      const keyboard = new InlineKeyboard()
        .text('❌ Bekor qilish', 'adm_del_cancel')
        .text('🗑 Ha, o‘chirish', `adm_del_exec_${product.id}`);

      await ctx.reply(
        `⚠️ Ushbu mahsulotni ("${product.name}") butunlay o‘chirishni tasdiqlaysizmi?\n\nBu amalni ortga qaytarib bo‘lmaydi.`,
        { reply_markup: keyboard }
      );
    } catch (err) {
      console.error('[BOT] Error in delete confirm:', err);
    }
    return true;
  }

  // Delete execution
  if (data.startsWith('adm_del_exec_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_del_exec_', '');
    try {
      await prisma.product.delete({ where: { id } });
      await ctx.editMessageText('🗑 Mahsulot muvaffaqiyatli o‘chirildi.');
    } catch (err) {
      console.error('[BOT] Error executing product delete:', err);
      await ctx.editMessageText('⚠️ Mahsulotni o‘chirishda xatolik yoki allaqachon o‘chirilgan.');
    }
    return true;
  }

  if (data === 'adm_del_cancel') {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('❌ O‘chirish bekor qilindi.');
    return true;
  }

  // Create new category prompt
  if (data === 'cat_create_new') {
    await ctx.answerCallbackQuery();
    adminActions.set(from.id, { type: 'NEW_CATEGORY' });
    await ctx.reply('Yangi kategoriya nomini kiriting (masalan: Aksessuarlar):');
    return true;
  }

  // Toggle category active
  if (data.startsWith('cat_toggle_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('cat_toggle_', '');
    try {
      const cat = await prisma.category.findUnique({ where: { id } });
      if (cat) {
        await prisma.category.update({
          where: { id },
          data: { isActive: !cat.isActive },
        });
        await ctx.editMessageText(`✅ "${cat.name}" holati o‘zgartirildi: ${!cat.isActive ? '🟢 Faol' : '⏳ Tez kunda'}`);
      }
    } catch (err) {
      console.error('[BOT] Error toggling category:', err);
    }
    return true;
  }

  // Edit price trigger
  if (data.startsWith('adm_change_price_')) {
    await ctx.answerCallbackQuery();
    const id = data.replace('adm_change_price_', '');
    adminActions.set(from.id, { type: 'EDIT_PRICE', targetId: id });
    await ctx.reply('Mahsulot uchun yangi narxni kiriting (faqat raqam, masalan: 590000):');
    return true;
  }

  return false;
}

/**
 * Handles incoming text messages when admin is in single-step action (e.g. creating category, editing price)
 */
export async function handleAdminActionText(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  const text = ctx.message?.text?.trim();
  if (!from || !text || !isAdmin(from.id)) return false;

  const action = adminActions.get(from.id);
  if (!action) return false;

  // Guard against menu button clicks or commands consuming the action
  const MENU_COMMANDS = [
    '➕ Tovar qo‘shish',
    '📦 Tovarlar',
    '🗂 Kategoriyalar',
    '✏️ Tovarni tahrirlash',
    '🗑 Tovarni o‘chirish',
    '📊 Statistika',
    '❌ Bekor qilish',
  ];

  if (MENU_COMMANDS.includes(text) || text.startsWith('/')) {
    adminActions.delete(from.id);
    return false;
  }

  if (action.type === 'NEW_CATEGORY') {
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const newCat = await prisma.category.create({
        data: {
          name: text,
          slug: `${slug}-${Date.now().toString(36)}`,
          isActive: true,
        },
      });
      adminActions.delete(from.id);
      await ctx.reply(`🎉 Yangi kategoriya yaratildi: "${newCat.name}"`);
    } catch (err) {
      console.error(err);
      await ctx.reply('Kategoriya yaratishda xatolik yuz berdi.');
    }
    return true;
  }

  if (action.type === 'EDIT_PRICE' && action.targetId) {
    const num = parseInt(text.replace(/[^\d]/g, ''), 10);
    if (isNaN(num) || num <= 0) {
      await ctx.reply('Noto‘g‘ri narx. Iltimos, musbat raqam kiriting (masalan: 590000):');
      return true;
    }

    try {
      const updated = await prisma.product.update({
        where: { id: action.targetId },
        data: { price: num },
      });
      adminActions.delete(from.id);
      await ctx.reply(`✅ "${updated.name}" narxi ${num.toLocaleString('uz-UZ')} UZS ga yangilandi.`);
    } catch (err) {
      console.error(err);
      await ctx.reply('Narxni yangilashda xatolik yuz berdi.');
    }
    return true;
  }

  if (action.type === 'EDIT_DESC' && action.targetId) {
    try {
      const updated = await prisma.product.update({
        where: { id: action.targetId },
        data: { description: text },
      });
      adminActions.delete(from.id);
      await ctx.reply(`✅ "${updated.name}" mahsuloti tavsifi yangilandi.`);
    } catch (err) {
      console.error(err);
      await ctx.reply('Tavsifni yangilashda xatolik yuz berdi.');
    }
    return true;
  }

  return false;
}
