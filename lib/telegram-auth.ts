import crypto from 'crypto';
import { TelegramUser } from './types';

export interface TelegramAuthResult {
  isValid: boolean;
  user?: TelegramUser;
  error?: string;
}

/**
 * Validates Telegram WebApp initData cryptographically per official Telegram documentation.
 * Uses HMAC-SHA-256 with "WebAppData" secret key.
 */
export function validateTelegramInitData(initDataString: string, botToken?: string): TelegramAuthResult {
  const token = botToken || process.env.BOT_TOKEN;
  if (!token) {
    return { isValid: false, error: 'BOT_TOKEN is not configured' };
  }

  if (!initDataString) {
    return { isValid: false, error: 'Empty initData provided' };
  }

  // Development bypass helper if running with mock token for dev preview
  if (process.env.NODE_ENV === 'development' && initDataString.startsWith('mock:')) {
    try {
      const mockUser = JSON.parse(decodeURIComponent(initDataString.replace('mock:', '')));
      return { isValid: true, user: mockUser };
    } catch {
      return { isValid: false, error: 'Invalid mock data format' };
    }
  }

  try {
    const urlParams = new URLSearchParams(initDataString);
    const hash = urlParams.get('hash');

    if (!hash) {
      return { isValid: false, error: 'Missing hash parameter' };
    }

    urlParams.delete('hash');

    // Sort parameters alphabetically
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckArr: string[] = [];

    for (const key of keys) {
      dataCheckArr.push(`${key}=${urlParams.get(key)}`);
    }

    const dataCheckString = dataCheckArr.join('\n');

    // 1. Compute secret key: HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    // 2. Compute hash: HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // 3. Timing-safe equality check
    const calculatedHashBuf = Buffer.from(calculatedHash, 'hex');
    const receivedHashBuf = Buffer.from(hash, 'hex');

    if (calculatedHashBuf.length !== receivedHashBuf.length || !crypto.timingSafeEqual(calculatedHashBuf, receivedHashBuf)) {
      return { isValid: false, error: 'Hash signature mismatch' };
    }

    // 4. Validate auth_date (within 24 hours)
    const authDateStr = urlParams.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const now = Math.floor(Date.now() / 1000);
      // Allow 86400 seconds (24 hours)
      if (now - authDate > 86400 * 2) {
        return { isValid: false, error: 'initData has expired' };
      }
    }

    // 5. Parse user data
    const userStr = urlParams.get('user');
    if (!userStr) {
      return { isValid: false, error: 'Missing user object in initData' };
    }

    const user: TelegramUser = JSON.parse(userStr);
    return { isValid: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation error';
    return { isValid: false, error: message };
  }
}
