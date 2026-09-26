'use client';

import React from 'react';
import Image from 'next/image';

interface HeroBannerProps {
  children?: React.ReactNode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ children }) => {
  return (
    <div className="relative w-full rounded-b-3xl overflow-hidden bg-[#c6d7e8] shadow-sm">
      {/* Model with Lady Dior Powder Blue Bag - Pure Clean Fashion Hero */}
      <div className="relative w-full h-[360px] flex items-end justify-center">
        <Image
          src="/brand/hero-model.jpg"
          alt="MILA High Fashion Model with Bag"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 480px"
          className="object-cover object-top"
        />

        {/* Soft bottom vignette gradient for smooth transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Floating children overlay (e.g. SearchBar) */}
      {children && (
        <div className="relative z-20 px-4 -mt-6 pb-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
