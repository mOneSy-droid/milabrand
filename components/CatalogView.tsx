'use client';

import React from 'react';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { ProductItem, CategoryItem } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';
import ProductCard from './ProductCard';
import CategoryPills from './CategoryPills';
import SearchBar from './SearchBar';
import { ProductCardSkeleton } from './SkeletonLoader';

interface CatalogViewProps {
  products: ProductItem[];
  categories: CategoryItem[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onProductClick: (product: ProductItem) => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onUpdateCartQty: (productId: string, qty: number, e: React.MouseEvent) => void;
  isLoading: boolean;
  onBack: () => void;
  lang?: Language;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onProductClick,
  onToggleFavorite,
  onAddToCart,
  onUpdateCartQty,
  isLoading,
  onBack,
  lang = 'uz',
}) => {
  const t = translations[lang] || translations.uz;

  return (
    <div className="w-full pb-28 animate-fade-in">
      {/* Top Header (Matching Screenshot 3) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
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
            {t.nav_catalog}
          </h1>

          <div className="w-8" />
        </div>

        {/* Search Bar (Matching Screenshot 3) */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          lang={lang}
        />
      </div>

      <div className="px-4">
        {/* Categories Bar (Matching Screenshot 3) */}
        <CategoryPills
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
          lang={lang}
          showViewAll={false}
        />

        {/* Filters and Sorting Row */}
        <div className="flex items-center justify-between my-3 px-1">
          <span className="text-xs font-semibold text-gray-500">
            {products.length} ta mahsulot
          </span>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                triggerHaptic('light');
                onSortChange(e.target.value);
              }}
              className="bg-transparent text-xs font-semibold text-brand-black outline-none cursor-pointer"
            >
              <option value="popular">{t.sort_popular}</option>
              <option value="price_asc">{t.sort_price_asc}</option>
              <option value="price_desc">{t.sort_price_desc}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
            <p className="text-sm font-bold text-gray-700 mb-1">{t.no_products}</p>
            <p className="text-xs text-gray-400">Boshqa so‘z yoki toifani tanlab ko‘ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="grid"
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
        )}
      </div>
    </div>
  );
};

export default CatalogView;
