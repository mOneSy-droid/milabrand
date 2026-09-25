'use client';

import React from 'react';
import Image from 'next/image';
import BrandLogo from './BrandLogo';

interface HeroBannerProps {
  children?: React.ReactNode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ children }) => {
  return (
    <div className="relative w-full rounded-b-3xl overflow-hidden bg-gradient-to-br from-[#dbe5f0] via-[#c6d7e8] to-[#a9c2db] pt-2 pb-6 shadow-sm">
      {/* Decorative Luxury Color Block Angle */}
      <div
        className="absolute top-0 right-0 w-3/4 h-full bg-[#8fa9c4]/30 -skew-x-12 translate-x-12 pointer-events-none"
      />

      {/* Brand Subtitle Bar in Hero (Safe from Telegram top controls) */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-dark/70 font-semibold">
          High Fashion Bags
        </span>
        <span className="text-[10px] tracking-wider text-brand-dark/60 font-medium">
          MILA Exclusive
        </span>
      </div>

      {/* Model with Lady Dior Powder Blue Bag */}
      <div className="relative w-full h-[330px] flex items-end justify-center">
        <Image
          src="/brand/hero-model.jpg"
          alt="MILA High Fashion Model with Bag"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 480px"
          className="object-cover object-top"
        />

        {/* Soft bottom vignette gradient for smooth transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Floating children overlay (e.g. SearchBar) */}
      {children && (
        <div className="relative z-20 px-4 -mt-5">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
