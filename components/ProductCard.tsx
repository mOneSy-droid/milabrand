'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Plus, Minus, ShoppingBag, Star } from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';

interface ProductCardProps {
  product: ProductItem;
  onProductClick: (product: ProductItem) => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onUpdateCartQty: (productId: string, newQty: number, e: React.MouseEvent) => void;
  isFavorite?: boolean;
  cartQuantity?: number;
  lang?: Language;
  layout?: 'grid' | 'carousel';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onToggleFavorite,
  onAddToCart,
  onUpdateCartQty,
  isFavorite = false,
  cartQuantity = 0,
  lang = 'uz',
  layout = 'grid',
}) => {
  const t = translations[lang] || translations.uz;

  // Resolve image URL
  const primaryImage = product.images?.[0];
  let imageUrl = '/brand/category-bags.jpg';

  if (primaryImage) {
    if (primaryImage.telegramFileId.startsWith('local:')) {
      const filename = primaryImage.telegramFileId.replace('local:', '');
      imageUrl = `/products/${filename}`;
    } else {
      imageUrl = `/api/images/${primaryImage.id}`;
    }
  }

  const containerClasses =
    layout === 'carousel'
      ? 'w-[180px] flex-shrink-0'
      : 'w-full';

  return (
    <div
      onClick={() => onProductClick(product)}
      className={`group relative bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer ${containerClasses}`}
    >
      {/* Top Media Area */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 mb-3">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Brand Subtle Watermark as seen in Screenshot 2 */}
        <span className="absolute bottom-1.5 inset-x-0 text-center text-[8px] font-medium text-gray-400/80 tracking-wider pointer-events-none select-none">
          milabrand.uz
        </span>

        {/* Favorite Button (White Circle in Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('medium');
            onToggleFavorite(product.id, e);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 hover:text-brand-discount active:scale-90 transition-all z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? 'fill-brand-discount text-brand-discount'
                : 'text-gray-600 stroke-[1.8]'
            }`}
          />
        </button>
      </div>

      {/* Pricing & Discount Row (as in Screenshot 2) */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Old Price + Discount Tag */}
          <div className="flex items-center gap-2 mb-0.5">
            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through font-normal">
                {product.oldPrice.toLocaleString('uz-UZ')} UZS
              </span>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="text-[11px] font-bold text-brand-discount">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          {/* Current Price */}
          <div className="text-[15px] font-bold text-brand-black tracking-tight leading-tight">
            {product.price.toLocaleString('uz-UZ')} {t.currency}
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-gray-800 mt-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {product.name}
          </h3>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1 mt-1.5 mb-3 text-[11px] text-gray-500">
            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span className="font-semibold text-gray-700">5.0</span>
            <span className="text-[10px] text-gray-400">({t.no_reviews})</span>
          </div>
        </div>

        {/* Action Button: Buy or Stepper (as in Screenshot 2) */}
        <div className="mt-auto pt-1" onClick={(e) => e.stopPropagation()}>
          {cartQuantity === 0 ? (
            <button
              onClick={(e) => {
                triggerHaptic('medium');
                onAddToCart(product.id, e);
              }}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-semibold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{t.buy_button}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full bg-gray-100 rounded-2xl p-1 border border-gray-200">
              <button
                onClick={(e) => {
                  triggerHaptic('light');
                  onUpdateCartQty(product.id, cartQuantity - 1, e);
                }}
                className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-brand-black active:scale-90 transition-transform font-bold text-sm"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>

              <span className="text-xs font-bold text-brand-black px-2">
                {cartQuantity}
              </span>

              <button
                onClick={(e) => {
                  triggerHaptic('light');
                  onUpdateCartQty(product.id, cartQuantity + 1, e);
                }}
                className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-brand-black active:scale-90 transition-transform font-bold text-sm"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
