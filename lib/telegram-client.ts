'use client';

// Types for window.Telegram.WebApp
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    auth_date?: string;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  close: () => void;
  expand: () => void;
  ready: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * Safely retrieves Telegram.WebApp object if running in browser
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

/**
 * Initializes Telegram Mini App environment
 */
export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      // Disable vertical swipe gestures to prevent pull-down collapse & minimize chevron
      if (typeof (tg as any).disableVerticalSwipes === 'function') {
        (tg as any).disableVerticalSwipes();
      }
      // Set Telegram header and background colors to clean white
      if (typeof (tg as any).setHeaderColor === 'function') {
        (tg as any).setHeaderColor('#ffffff');
      } else {
        tg.headerColor = '#ffffff';
      }
      if (typeof (tg as any).setBackgroundColor === 'function') {
        (tg as any).setBackgroundColor('#ffffff');
      } else {
        tg.backgroundColor = '#ffffff';
      }
    } catch (e) {
      console.warn('Error initializing Telegram WebApp:', e);
    }
  }
}

/**
 * Triggers light haptic feedback on Telegram mobile
 */
export function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'soft' = 'light') {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(style);
    } catch {
      // Ignore if not supported on platform
    }
  }
}

/**
 * Triggers success/error haptic notification
 */
export function triggerHapticNotification(type: 'success' | 'error' | 'warning') {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.notificationOccurred(type);
    } catch {
      // Ignore
    }
  }
}
