'use client';

import React, { useState } from 'react';
import { Send, RefreshCw, Smartphone, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { triggerHaptic, getTelegramWebApp } from '@/lib/telegram-client';

interface RegistrationRequiredScreenProps {
  onCheckAgain: () => Promise<void>;
  botUsername?: string;
}

export const RegistrationRequiredScreen: React.FC<RegistrationRequiredScreenProps> = ({
  onCheckAgain,
  botUsername = 'mila_brand_bot',
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleOpenBot = () => {
    triggerHaptic('medium');
    const tg = getTelegramWebApp();
    const cleanUsername = botUsername.replace(/^@/, '');
    const botUrl = `https://t.me/${cleanUsername}?start=register`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(botUrl);
    } else {
      window.location.href = botUrl;
    }
  };

  const handleRefresh = async () => {
    triggerHaptic('light');
    setIsChecking(true);
    await onCheckAgain();
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between items-center px-6 py-10 text-center max-w-md mx-auto">
      {/* Top Brand Header */}
      <div className="pt-8">
        <BrandLogo size="lg" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-dark/60 font-semibold mt-2 block">
          Official Luxury Boutique
        </span>
      </div>

      {/* Central Guard Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-sm w-full my-auto animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary mx-auto mb-4 shadow-inner">
          <Lock className="w-8 h-8 stroke-[1.8]" />
        </div>

        <h2 className="text-base font-bold text-brand-black mb-2">
          Avval ro‘yxatdan o‘ting
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed mb-6">
          MILA eksklyuziv sumkalar katalogiga kirish va buyurtma berish uchun avval Telegram botimizda telefon raqamingizni yuborib ro‘yxatdan o‘tishingiz kerak.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleOpenBot}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>📱 Botda ro‘yxatdan o‘tish</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isChecking}
            className="w-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Tekshirilmoqda...' : '🔄 Qayta tekshirish'}</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-[11px] text-gray-400 pb-2">
        <span>MILA Luxury Brand © 2026</span>
      </div>
    </div>
  );
};

export default RegistrationRequiredScreen;
