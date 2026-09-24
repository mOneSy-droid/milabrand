'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Trash2, Heart, Plus, Minus, Check, ShoppingBag, Send } from 'lucide-react';
import { CartItemModel, ProductItem, AppUser } from '@/lib/types';
import { triggerHaptic, triggerHapticNotification, getTelegramWebApp } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';
import ProductCard from './ProductCard';

interface CartViewProps {
  cartItems: CartItemModel[];
  user?: AppUser | null;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearSelected: (productIds: string[]) => void;
  onToggleFavorite: (productId: string) => void;
  onProductClick: (product: ProductItem) => void;
  recentlyViewed?: ProductItem[];
  onGoToCatalog: () => void;
  onBack: () => void;
  lang?: Language;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  user,
  onUpdateQty,
  onRemoveItem,
  onClearSelected,
  onToggleFavorite,
  onProductClick,
  recentlyViewed = [],
  onGoToCatalog,
  onBack,
  lang = 'uz',
}) => {
  const t = translations[lang] || translations.uz;

  // Selected items state for checkboxes
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(cartItems.map((item) => item.productId))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle selection
  const toggleSelect = (productId: string) => {
    triggerHaptic('light');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Select all or deselect all
  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;
  const toggleSelectAll = () => {
    triggerHaptic('light');
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((item) => item.productId)));
    }
  };

  // Delete selected
  const handleDeleteSelected = () => {
    triggerHaptic('medium');
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;
    onClearSelected(idsToDelete);
    setSelectedIds(new Set());
  };

  // Calculate totals for selected items
  const selectedItems = cartItems.filter((item) => selectedIds.has(item.productId));
  const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = selectedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Resolve image URL
  const getItemImageUrl = (p: ProductItem) => {
    const img = p.images?.[0];
    if (!img) return '/brand/category-bags.jpg';
    if (img.telegramFileId.startsWith('local:')) {
      return `/products/${img.telegramFileId.replace('local:', '')}`;
    }
    return `/api/images/${img.id}`;
  };

  // DIRECT ORDER TO @milabranduz ON "TASDIQLASH" CLICK - NO CONFIRMATION SCREEN
  const handleDirectOrder = async () => {
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    triggerHapticNotification('success');

    // 1. Build text message for Telegram @milabranduz
    let orderText = `Assalomu alaykum! MILA brendidan buyurtma bermoqchiman:\n\n`;

    selectedItems.forEach((item, idx) => {
      const p = item.product;
      const itemTotal = p.price * item.quantity;
      orderText += `${idx + 1}. ${p.name}\n   ${item.quantity} ta × ${p.price.toLocaleString('uz-UZ')} = ${itemTotal.toLocaleString('uz-UZ')} UZS\n`;
    });

    orderText += `\n💰 Jami summa: ${totalAmount.toLocaleString('uz-UZ')} UZS\n`;
    if (user?.phone) {
      orderText += `📱 Telefon: ${user.phone}\n`;
    }
    if (user?.firstName) {
      orderText += `👤 Buyurtmachi: ${user.firstName}${user.lastName ? ' ' + user.lastName : ''}\n`;
    }
    if (user?.username) {
      orderText += `💬 Telegram: @${user.username}\n`;
    }

    // 2. Clear selected items from cart immediately
    const idsToRemove = selectedItems.map((i) => i.productId);
    onClearSelected(idsToRemove);

    // 3. Save order silently in background (logs order & notifies admin bot)
    try {
      const tg = getTelegramWebApp();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tg?.initData) headers['x-telegram-init-data'] = tg.initData;

      fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          notes: 'Telegram @milabranduz orqali yuborildi',
          items: selectedItems,
        }),
      }).catch((e) => console.warn('Background order save error:', e));
    } catch (e) {
      console.warn('Error saving order:', e);
    }

    // 4. Redirect immediately to @milabranduz in Telegram
    const targetUrl = `https://t.me/milabranduz?text=${encodeURIComponent(orderText)}`;
    const tg = getTelegramWebApp();
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(targetUrl);
    } else {
      window.location.href = targetUrl;
    }

    setIsSubmitting(false);
    onGoToCatalog();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4 shadow-inner">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="text-lg font-bold text-brand-black mb-1">{t.cart_empty_title}</h2>
        <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
          {t.cart_empty_desc}
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
    );
  }

  return (
    <div className="w-full pb-36 animate-fade-in">
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
          <span className="text-xs font-normal">Ortga</span>
        </button>

        <h1 className="text-base font-bold text-brand-black tracking-tight">
          {t.cart_title}
        </h1>

        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
          {/* Subheader: Delete Selected & Select All (Matching Screenshot 5) */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className={`text-xs font-semibold transition-opacity ${
                selectedIds.size > 0 ? 'text-red-500 hover:text-red-600 active:scale-95' : 'text-gray-300'
              }`}
            >
              {t.delete_selected}
            </button>

            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 active:scale-95 transition-all"
            >
              <span>{t.select_all}</span>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                  isAllSelected ? 'bg-emerald-500 text-white' : 'border border-gray-300 bg-white'
                }`}
              >
                {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Cart Item Cards (Matching Screenshot 5) */}
          <div className="space-y-3">
            {cartItems.map((item) => {
              const isSelected = selectedIds.has(item.productId);
              const p = item.product;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3.5 relative"
                >
                  {/* Item Image with Checkbox Indicator */}
                  <div
                    onClick={() => toggleSelect(item.productId)}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                  >
                    <Image
                      src={getItemImageUrl(p)}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Content */}
                  <div className="flex-1 flex flex-col justify-between h-20 py-0.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-brand-black block">
                          {p.price.toLocaleString('uz-UZ')} UZS
                        </span>
                        <h3 className="text-xs font-medium text-gray-700 mt-0.5 line-clamp-1">
                          {p.name}
                        </h3>
                      </div>

                      {/* Green Checkbox on Top Right */}
                      <button
                        onClick={() => toggleSelect(item.productId)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-500 text-white' : 'border border-gray-300 bg-white'
                        }`}
                        aria-label="Toggle selection"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>

                    {/* Bottom Actions: Favorite, Trash, Stepper */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {/* Favorite button */}
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onToggleFavorite(item.productId);
                          }}
                          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-brand-discount active:scale-90 transition-all border border-gray-100"
                          aria-label="Add to favorites"
                        >
                          <Heart className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {/* Trash Button */}
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onRemoveItem(item.productId);
                          }}
                          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-red-500 active:scale-90 transition-all border border-gray-100"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-gray-100 rounded-2xl p-0.5 border border-gray-200">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQty(item.productId, item.quantity - 1);
                          }}
                          className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 font-bold"
                          aria-label="Minus"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>

                        <span className="text-xs font-bold text-brand-black px-2.5">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQty(item.productId, item.quantity + 1);
                          }}
                          className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 font-bold"
                          aria-label="Plus"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card: "Ваш заказ" (Matching Screenshot 5) */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-brand-black">
              {t.your_order}
            </h2>

            <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between text-xs text-gray-600">
              <span>{totalQuantity} {t.items_count}</span>
              <span className="font-bold text-brand-black">
                {totalAmount.toLocaleString('uz-UZ')} UZS
              </span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">{t.total_amount}</span>
              <span className="text-base font-bold text-brand-black">
                {totalAmount.toLocaleString('uz-UZ')} UZS
              </span>
            </div>
          </div>

          {/* "Вы смотрели" / Recently Viewed Carousel (Matching Screenshot 5) */}
          {recentlyViewed.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-bold text-brand-black mb-3 px-1">
                {t.recently_viewed}
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {recentlyViewed.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    layout="carousel"
                    onProductClick={onProductClick}
                    onToggleFavorite={onToggleFavorite}
                    onAddToCart={(id) => onUpdateQty(id, 1)}
                    onUpdateCartQty={onUpdateQty}
                    isFavorite={item.isFavorite}
                    cartQuantity={item.cartQuantity}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      {/* Sticky Bottom Checkout Bar (Matching Screenshot 5) -> DIRECT TO @milabranduz */}
      {cartItems.length > 0 && (
        <div
          className="fixed bottom-[68px] inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 shadow-lg flex items-center justify-between gap-4 max-w-lg mx-auto"
        >
          <div className="flex flex-col">
            <span className="text-base font-bold text-brand-black">
              {totalAmount.toLocaleString('uz-UZ')} UZS
            </span>
            <span className="text-[11px] text-gray-500">
              {totalQuantity} {t.items_count}
            </span>
          </div>

          <button
            onClick={handleDirectOrder}
            disabled={totalQuantity === 0 || isSubmitting}
            className={`flex-1 max-w-[210px] py-3 px-4 rounded-2xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
              totalQuantity > 0 && !isSubmitting
                ? 'bg-brand-primary hover:bg-brand-primary-hover active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.checkout_button}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartView;
