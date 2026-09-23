'use client';

import React from 'react';
import { Smartphone, Send, RefreshCw } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import BrandLogo from './BrandLogo';
import { triggerHaptic } from '@/lib/telegram-client';

interface PhoneVerificationModalProps {
  onCheckAgain: () => void;
  botUsername?: string;
  lang?: Language;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  onCheckAgain,
  botUsername = 'mila_brand_bot',
  lang = 'uz',
}) => {
  const t = translations[lang] || translations.uz;

  const handleOpenBot = () => {
    triggerHaptic('medium');
    const url = `https://t.me/${botUsername}`;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl border border-gray-100">
        <div className="mb-4">
          <BrandLogo size="md" />
        </div>

        <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 stroke-[1.8]" />
        </div>

        <h2 className="text-base font-bold text-brand-black mb-2">
          {t.verification_required}
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed mb-6">
          {t.verification_desc}
        </p>

        <div className="space-y-2.5">
          <button
            onClick={handleOpenBot}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{t.open_bot}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onCheckAgain();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-xs font-semibold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.check_again}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;
