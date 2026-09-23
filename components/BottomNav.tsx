'use client';

import React from 'react';
import { Home, LayoutGrid, ShoppingBag, Heart, User } from 'lucide-react';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';

export type NavTab = 'home' | 'catalog' | 'cart' | 'favorites' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount?: number;
  lang?: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount = 0,
  lang = 'uz',
}) => {
  const t = translations[lang] || translations.uz;

  const tabs: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: t.nav_home, icon: Home },
    { id: 'catalog', label: t.nav_catalog, icon: LayoutGrid },
    { id: 'cart', label: t.nav_cart, icon: ShoppingBag },
    { id: 'favorites', label: t.nav_favorites, icon: Heart },
    { id: 'profile', label: t.nav_profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-brand-border/60 shadow-nav transition-all">
      <div
        className="max-w-md mx-auto flex items-center justify-around px-2 pt-2 pb-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 relative group ${
                isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={tab.label}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                {/* Active Indicator Background Pill for Home (as in Screenshot 1 & 2) */}
                {isActive && tab.id === 'home' && (
                  <span className="absolute -inset-1.5 bg-brand-primary/10 rounded-full -z-10" />
                )}

                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Cart Badge */}
                {tab.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-discount text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-fade-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] tracking-tight mt-1 transition-all ${
                  isActive ? 'font-semibold text-brand-primary' : 'font-normal text-gray-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Dot for non-home active tabs */}
              {isActive && tab.id !== 'home' && (
                <span className="w-1 h-1 bg-brand-primary rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
