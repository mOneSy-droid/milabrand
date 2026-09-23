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
