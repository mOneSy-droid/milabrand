import dotenv from 'dotenv';
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';
export const ADMIN_ID_1 = process.env.ADMIN_ID_1 ? String(process.env.ADMIN_ID_1).trim() : '';
export const ADMIN_ID_2 = process.env.ADMIN_ID_2 ? String(process.env.ADMIN_ID_2).trim() : '';

export function isAdmin(telegramId: number | bigint | string): boolean {
  const idStr = String(telegramId).trim();
  if (!idStr) return false;
  return idStr === ADMIN_ID_1 || idStr === ADMIN_ID_2;
}

export function getAdminIds(): string[] {
  return [ADMIN_ID_1, ADMIN_ID_2].filter(Boolean);
}

/**
 * Returns safe web app URL with HTTPS protocol required by Telegram WebApp
 */
export function getSafeWebAppUrl(): string {
  let url = (process.env.WEB_APP_URL || WEB_APP_URL || '').trim();
  if (!url) {
    url = 'https://milabrand.uz';
  }
  // Telegram strictly enforces HTTPS for Mini Apps (web_app)
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  } else if (!url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
}

/**
 * Returns inline keyboard to open the Web App directly inside Telegram
 */
export function getOpenShopInlineKeyboard(webAppUrl?: string) {
  const url = webAppUrl || getSafeWebAppUrl();

  return [
    [
      {
        text: '🛍 Saytni ochish',
        web_app: { url },
      },
    ],
  ];
}
