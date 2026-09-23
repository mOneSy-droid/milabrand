'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  MessageSquare,
  Settings,
  Globe,
  Info,
  Truck,
  RotateCcw,
  Send,
  User as UserIcon,
  ChevronRight,
  Check,
} from 'lucide-react';
import { AppUser } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';

interface ProfileViewProps {
  user: AppUser | null;
  onBack: () => void;
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onBack,
  lang,
  onLanguageChange,
  onLogout,
}) => {
  const t = translations[lang] || translations.uz;
  const [showLangModal, setShowLangModal] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  const langNames: Record<Language, string> = {
    uz: "O'zbekcha",
    ru: 'Русский',
    en: 'English',
  };

  const handleOpenInfo = (title: string, content: string) => {
    triggerHaptic('light');
    setActiveInfoModal(title);
  };

  return (
    <div className="w-full pb-32 animate-fade-in">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="flex items-center gap-1 text-sm font-medium text-brand-black hover:text-brand-primary active:scale-95 transition-all p-1 -ml-1 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs">Ortga</span>
        </button>

        <h1 className="text-base font-bold text-brand-black tracking-tight">
          {t.profile_title}
        </h1>

        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* User Card (Matching Screenshot 4) */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-black">
                {user?.firstName || user?.username || 'MILA Mijoz'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 tracking-tight font-medium">
                {user?.phone || '+998 ** *** ** **'}
              </p>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Tasdiqlangan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Group 1: Orders & Reviews (Matching Screenshot 4) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          <button
            onClick={() => handleOpenInfo(t.my_orders, "Sizda hozircha faol buyurtmalar yo'q.")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Package className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.my_orders}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => handleOpenInfo(t.my_reviews, "Siz hali sharh qoldirmagansiz.")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <MessageSquare className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.my_reviews}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Action Group 2: Settings, Language, About, Delivery, Return, Contact (Matching Screenshot 4) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {/* Settings */}
          <div className="flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Settings className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.settings}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {t.coming_soon}
            </span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowLangModal(true);
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Globe className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.language}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{langNames[lang]}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {/* About us */}
          <button
            onClick={() =>
              handleOpenInfo(
                t.about_us,
                "MILA — ayollar uchun eksklyuziv premium sumkalar va moda aksessuarlarining yetakchi brendi. Biz har bir mahsulotda nafislik, sifat va qulaylikni uyg'unlashtiramiz."
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Info className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.about_us}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Delivery Terms */}
          <button
            onClick={() =>
              handleOpenInfo(
                t.delivery_terms,
                "Toshkent shahri bo'ylab yetkazib berish 24 soat ichida amalga oshiriladi. O'zbekiston viloyatlariga tezkor pochta orqali 2-3 ish kunida yetkaziladi."
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Truck className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.delivery_terms}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Return Policy */}
          <button
            onClick={() =>
              handleOpenInfo(
                t.return_policy,
                "Mahsulot sifatiga kafolat beriladi. Mahsulot o'z ko'rinishini yo'qotmagan holatda 14 kun ichida almashtirib beriladi."
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <RotateCcw className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.return_policy}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Contact us */}
          <button
            onClick={() =>
              handleOpenInfo(
                t.contact_us,
                "Murojaat va takliflar uchun:\nTelegram: @mila_brand_support\nTelefon: +998 71 200 00 00\nIsh vaqti: 09:00 - 20:00"
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <Send className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-xs font-semibold text-brand-black">{t.contact_us}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Red Logout Button (Matching Screenshot 4) */}
        <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm text-center">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onLogout();
            }}
            className="w-full text-xs font-bold text-red-500 hover:text-red-600 py-1 transition-colors"
          >
            {t.logout}
          </button>
        </div>

        {/* Social Networks (Matching Screenshot 4) */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-gray-600 block mb-3 px-1">
            {t.social_networks}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-[#24A1DE] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2 text-[11px] text-gray-400">
          {t.powered_by}
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-brand-black mb-3">Tilni tanlang</h3>
            <div className="space-y-2">
              {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    triggerHaptic('light');
                    onLanguageChange(l);
                    setShowLangModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-semibold ${
                    lang === l
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{langNames[l]}</span>
                  {lang === l && <Check className="w-4 h-4 stroke-[2.5]" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLangModal(false)}
              className="w-full mt-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* General Info Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in text-center">
            <h3 className="text-base font-bold text-brand-black mb-2">{activeInfoModal}</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              MILA Luxury Brand xizmatlaridan foydalanganingiz uchun tashakkur.
            </p>
            <button
              onClick={() => setActiveInfoModal(null)}
              className="w-full bg-brand-primary text-white text-xs font-semibold py-2.5 rounded-2xl"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
