'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductItem } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { Language } from '@/lib/i18n';

interface ProductCarouselProps {
  title: string;
  subtitleLink?: string;
  onSubtitleClick?: () => void;
  products: ProductItem[];
  onProductClick: (product: ProductItem) => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onUpdateCartQty: (productId: string, newQty: number, e: React.MouseEvent) => void;
  lang?: Language;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitleLink,
  onSubtitleClick,
  products,
  onProductClick,
  onToggleFavorite,
  onAddToCart,
  onUpdateCartQty,
  lang = 'uz',
}) => {
  if (products.length === 0) return null;

  return (
    <section className="w-full my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-brand-black tracking-tight">
          {title}
        </h2>
        {subtitleLink && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onSubtitleClick?.();
            }}
            className="flex items-center text-xs font-semibold text-brand-primary hover:opacity-80 active:scale-95 transition-all"
          >
            <span>{subtitleLink}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout="carousel"
            onProductClick={onProductClick}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            onUpdateCartQty={onUpdateCartQty}
            isFavorite={product.isFavorite}
            cartQuantity={product.cartQuantity}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
