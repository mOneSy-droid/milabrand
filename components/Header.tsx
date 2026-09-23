'use client';

import React from 'react';
import { ArrowLeft, MessageCircle, User as UserIcon } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { triggerHaptic } from '@/lib/telegram-client';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onProfileClick?: () => void;
  onSupportClick?: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onProfileClick,
  onSupportClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-brand-border/60 px-4 py-3 transition-all duration-200">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left: Back button or Avatar */}
        <div className="flex items-center min-w-[40px]">
          {showBack ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                onBack?.();
              }}
              className="flex items-center gap-1 text-sm font-medium text-brand-black hover:text-brand-primary active:scale-95 transition-all -ml-1 p-1 rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                onProfileClick?.();
              }}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-brand-muted hover:bg-gray-200 active:scale-95 transition-all border border-gray-200"
              aria-label="Profile"
            >
              <UserIcon className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Center: Brand Logo or Page Title */}
        <div className="flex-1 flex justify-center items-center">
          {title ? (
            <h1 className="text-base font-semibold text-brand-black tracking-tight line-clamp-1">
              {title}
            </h1>
          ) : (
            <BrandLogo size="sm" withSubtitle={false} />
          )}
        </div>

        {/* Right: Support / Chat icon */}
        <div className="flex items-center justify-end min-w-[40px]">
          <button
            onClick={() => {
              triggerHaptic('light');
              onSupportClick?.();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-brand-black hover:text-brand-primary active:scale-95 transition-all"
            aria-label="Customer Support"
          >
            <MessageCircle className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
