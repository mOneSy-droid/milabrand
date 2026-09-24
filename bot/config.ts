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
 * Returns safe web app URL with proper protocol
 */
export function getSafeWebAppUrl(): string {
  let url = (process.env.WEB_APP_URL || WEB_APP_URL || '').trim();
  if (!url) {
    url = 'https://milabrand.uz';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Returns inline keyboard to open the Web App / site
 */
export function getOpenShopInlineKeyboard(webAppUrl?: string) {
  const url = webAppUrl || getSafeWebAppUrl();
  const isHttps = url.startsWith('https://');

  if (isHttps) {
    return [
      [
        {
          text: '🛍 Saytni ochish (MILA Shop)',
          web_app: { url },
        },
      ],
      [
        {
          text: '🌐 Brauzerda ochish',
          url,
        },
      ],
    ];
  }

  return [
    [
      {
        text: '🛍 Saytni ochish',
        url,
      },
    ],
  ];
}
