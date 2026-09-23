'use client';

import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';
import ProductCard from './ProductCard';

interface FavoritesViewProps {
  favorites: ProductItem[];
  onProductClick: (product: ProductItem) => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onGoToCatalog: () => void;
  onBack: () => void;
  lang?: Language;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onProductClick,
  onToggleFavorite,
  onAddToCart,
  onUpdateCartQty,
  onGoToCatalog,
  onBack,
  lang = 'uz',
}) => {
  const t = translations[lang] || translations.uz;

  return (
    <div className="w-full pb-28 animate-fade-in">
      {/* Header */}
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
          {t.favorites_title}
        </h1>

        <div className="w-8" />
      </div>

      {favorites.length === 0 ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 text-brand-discount flex items-center justify-center mb-4 shadow-inner">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-base font-bold text-brand-black mb-1">
            {t.favorites_empty_title}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
            {t.favorites_empty_desc}
          </p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onGoToCatalog();
            }}
            className="bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-semibold py-3 px-6 rounded-2xl shadow-sm transition-all"
          >
            {t.go_shopping}
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="grid"
                onProductClick={onProductClick}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onUpdateCartQty={onUpdateCartQty}
                isFavorite={true}
                cartQuantity={product.cartQuantity}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
