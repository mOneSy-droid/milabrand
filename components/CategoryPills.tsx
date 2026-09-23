'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { CategoryItem } from '@/lib/types';
import { triggerHaptic } from '@/lib/telegram-client';
import { translations, Language } from '@/lib/i18n';

interface CategoryPillsProps {
  categories: CategoryItem[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onViewAll?: () => void;
  lang?: Language;
  showViewAll?: boolean;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onViewAll,
  lang = 'uz',
  showViewAll = true,
}) => {
  const t = translations[lang] || translations.uz;

  // Fallback category images if not provided in DB
  const defaultCategoryImages: Record<string, string> = {
    sumka: '/brand/category-bags.jpg',
    kupalniki: '/brand/category-swimwear.jpg',
    sport: '/brand/category-sport.jpg',
    odejda: '/brand/category-clothing.jpg',
  };

  return (
    <section className="w-full bg-white rounded-3xl p-4 shadow-sm border border-gray-100 my-3">
      {/* Header with "View All >" */}
      {showViewAll && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-brand-black tracking-wide uppercase">
            {t.categories}
          </span>
          <button
            onClick={() => {
              triggerHaptic('light');
              onViewAll?.();
            }}
            className="flex items-center text-xs font-medium text-brand-primary hover:opacity-80 active:scale-95 transition-all"
          >
            <span>{t.view_all}</span>
          </button>
        </div>
      )}

      {/* Categories Row */}
      <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id || (!selectedCategoryId && cat.slug === 'sumka');
          const isComingSoon = !cat.isActive;
          const imageSrc = cat.imageUrl || defaultCategoryImages[cat.slug] || '/brand/category-bags.jpg';

          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                if (isComingSoon) {
                  alert(t.coming_soon);
                  return;
                }
                onSelectCategory(cat.id);
              }}
              className="flex flex-col items-center min-w-[72px] max-w-[76px] group transition-transform active:scale-95 select-none"
            >
              {/* Category Image Box */}
              <div
                className={`relative w-[68px] h-[68px] rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm ${
                  isSelected && !isComingSoon
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-[1.02]'
                    : 'border-transparent group-hover:border-gray-200'
                }`}
              >
                <Image
                  src={imageSrc}
                  alt={cat.name}
                  fill
                  sizes="68px"
                  className={`object-cover transition-transform duration-300 ${
                    isComingSoon ? 'filter brightness-75' : 'group-hover:scale-105'
                  }`}
                />

                {/* Coming Soon Dark Glass Overlay */}
                {isComingSoon && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-1">
                    <span className="text-[10px] font-bold tracking-wider text-white uppercase text-center leading-tight drop-shadow-sm">
                      {t.coming_soon}
                    </span>
                  </div>
                )}
              </div>

              {/* Category Name */}
              <span
                className={`text-[11px] text-center mt-2 leading-tight line-clamp-2 transition-colors ${
                  isSelected && !isComingSoon
                    ? 'font-semibold text-brand-primary'
                    : 'font-medium text-gray-700'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryPills;
