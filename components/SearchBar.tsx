'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  lang?: Language;
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  lang = 'uz',
  className = '',
  placeholder,
}) => {
  const t = translations[lang] || translations.uz;
  const currentPlaceholder = placeholder || t.search_placeholder;

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4 stroke-[2]" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={currentPlaceholder}
        className="w-full bg-[#f1f3f7] hover:bg-[#ebedf2] focus:bg-white text-brand-black text-[13px] placeholder:text-gray-400 pl-10 pr-9 py-2.5 rounded-2xl border border-transparent focus:border-brand-primary/30 shadow-none transition-all outline-none"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
