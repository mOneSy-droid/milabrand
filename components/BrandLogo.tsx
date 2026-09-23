import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  withSubtitle = true,
}) => {
  const sizeClasses = {
    sm: { title: 'text-xl tracking-[0.3em]', sub: 'text-[7px] tracking-[0.35em]' },
    md: { title: 'text-2xl tracking-[0.35em]', sub: 'text-[8px] tracking-[0.4em]' },
    lg: { title: 'text-4xl tracking-[0.4em]', sub: 'text-[10px] tracking-[0.45em]' },
  };

  const selected = sizeClasses[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <span
        className={`font-serif font-medium text-brand-black leading-none uppercase ${selected.title}`}
        style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif" }}
      >
        MILA
      </span>
      {withSubtitle && (
        <span
          className={`font-sans font-semibold text-brand-muted/80 uppercase mt-0.5 ${selected.sub}`}
        >
          BRAND
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
