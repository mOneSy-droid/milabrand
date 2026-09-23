'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Heart, ShoppingBag, Plus, Minus, Star, Share2 } from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { triggerHaptic, triggerHapticNotification } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  isFavorite?: boolean;
  cartQuantity?: number;
  lang?: Language;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onToggleFavorite,
  onAddToCart,
  onUpdateCartQty,
  isFavorite = false,
  cartQuantity = 0,
  lang = 'uz',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const t = translations[lang] || translations.uz;
  const images = product.images.length > 0 ? product.images : [{ id: 'default', productId: product.id, telegramFileId: 'local:category-bags.jpg', sortOrder: 0 }];

  const getImageUrl = (telegramFileId: string, id: string) => {
    if (telegramFileId.startsWith('local:')) {
      const filename = telegramFileId.replace('local:', '');
      return `/products/${filename}`;
    }
    return `/api/images/${id}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in flex flex-col justify-between">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-black hover:text-brand-primary active:scale-95 transition-all p-1 -ml-1 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs">Ortga</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          {product.category?.name || 'MILA Bag'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onToggleFavorite(product.id);
            }}
            className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:text-brand-discount active:scale-90 transition-all border border-gray-100"
            aria-label="Favorite"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite
                  ? 'fill-brand-discount text-brand-discount'
                  : 'text-gray-600 stroke-[1.8]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-28">
        {/* Gallery */}
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={getImageUrl(images[activeImageIndex].telegramFileId, images[activeImageIndex].id)}
            alt={product.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-all duration-300"
          />

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? 'w-5 bg-brand-primary' : 'w-1.5 bg-white/70 shadow-xs'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="p-5">
          {/* Price & Discount */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xl font-bold text-brand-black tracking-tight">
              {product.price.toLocaleString('uz-UZ')} {t.currency}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.oldPrice.toLocaleString('uz-UZ')} UZS
              </span>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="bg-brand-discount/10 text-brand-discount text-xs font-bold px-2 py-0.5 rounded-full">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-brand-black mt-2 leading-snug">
            {product.name}
          </h1>

          {/* Rating & Category */}
          <div className="flex items-center gap-3 mt-2 pb-4 border-b border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
              <span className="font-semibold text-gray-800">5.0</span>
              <span className="text-gray-400">({product.reviewCount || 1} {t.reviews_count})</span>
            </div>
            <span>•</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
              {product.category?.name || 'Sumka'}
            </span>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {t.description}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-normal">
              {product.description || 'MILA brendining eksklyuziv premium sumkasi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-lg flex items-center justify-between gap-4 max-w-lg mx-auto"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)' }}
      >
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-medium">Jami:</span>
          <span className="text-lg font-bold text-brand-black">
            {product.price.toLocaleString('uz-UZ')} UZS
          </span>
        </div>

        <div className="flex-1 max-w-[220px]">
          {cartQuantity === 0 ? (
            <button
              onClick={() => {
                triggerHapticNotification('success');
                onAddToCart(product.id);
              }}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-sm font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span>{t.add_to_cart}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full bg-gray-100 rounded-2xl p-1.5 border border-gray-200">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onUpdateCartQty(product.id, cartQuantity - 1);
                }}
                className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 transition-transform font-bold"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-brand-black px-3">
                {cartQuantity} ta
              </span>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  onUpdateCartQty(product.id, cartQuantity + 1);
                }}
                className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 transition-transform font-bold"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
