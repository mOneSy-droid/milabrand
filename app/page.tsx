'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav, { NavTab } from '@/components/BottomNav';
import HeroBanner from '@/components/HeroBanner';
import SearchBar from '@/components/SearchBar';
import CategoryPills from '@/components/CategoryPills';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import CartView from '@/components/CartView';
import FavoritesView from '@/components/FavoritesView';
import ProfileView from '@/components/ProfileView';
import CatalogView from '@/components/CatalogView';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import RegistrationRequiredScreen from '@/components/RegistrationRequiredScreen';
import BrandLogo from '@/components/BrandLogo';
import { ProductCardSkeleton, CategoryPillsSkeleton } from '@/components/SkeletonLoader';
import {
  initTelegramApp,
  getTelegramWebApp,
  triggerHaptic,
  triggerHapticNotification,
} from '@/lib/telegram-client';
import { AppUser, CategoryItem, ProductItem, CartItemModel } from '@/lib/types';
import { translations, Language } from '@/lib/i18n';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<Language>('uz');
  const [user, setUser] = useState<AppUser | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isDevPreview, setIsDevPreview] = useState<boolean>(false);

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItemModel[]>([]);
  const [favorites, setFavorites] = useState<ProductItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  const t = translations[lang] || translations.uz;

  // Telegram auth headers helper
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const tg = getTelegramWebApp();
    if (tg?.initData) {
      headers['x-telegram-init-data'] = tg.initData;
    }
    return headers;
  }, []);

  // 1. Initial Authentication & Verification Check (Strict registration gating)
  const checkAuth = useCallback(async () => {
    setIsAuthChecking(true);
    try {
      const tg = getTelegramWebApp();
      const initData = tg?.initData || '';

      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const data = await res.json();
      if (data.ok && data.verified && data.user) {
        setUser(data.user);
        setIsVerified(true);
        if (data.isDevPreview) {
          setIsDevPreview(true);
        }
      } else {
        setUser(null);
        setIsVerified(false);
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setUser(null);
      setIsVerified(false);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // 2. Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.ok && data.categories) {
        setCategories(data.categories);
        // Find bags category
        const bagsCat = data.categories.find((c: CategoryItem) => c.slug === 'sumka');
        if (bagsCat) {
          setSelectedCategoryId(bagsCat.id);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // 3. Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set('category', selectedCategoryId);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && data.products) {
        setProducts(data.products);
        // Set top popular products for horizontal carousel
        setPopularProducts(data.products.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedCategoryId, searchQuery, sortBy, getAuthHeaders]);

  // 4. Fetch Cart
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && data.cart) {
        setCartItems(data.cart.items);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, [getAuthHeaders]);

  // 5. Fetch Favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && data.favorites) {
        setFavorites(data.favorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [getAuthHeaders]);

  // Initial load
  useEffect(() => {
    initTelegramApp();
    checkAuth();
  }, [checkAuth]);

  // Fetch products, categories and user data ONLY if user is registered and verified
  useEffect(() => {
    if (isVerified) {
      fetchCategories();
      fetchProducts();
      fetchCart();
      fetchFavorites();
    }
  }, [isVerified, fetchCategories, fetchProducts, fetchCart, fetchFavorites]);

  // Sync Telegram WebApp BackButton
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    if (selectedProduct) {
      tg.BackButton.show();
      const handleBack = () => setSelectedProduct(null);
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else if (activeTab !== 'home') {
      tg.BackButton.show();
      const handleBack = () => setActiveTab('home');
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [selectedProduct, activeTab]);

  // Handlers
  const handleToggleFavorite = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.ok) {
        // Optimistic UI updates
        const isFav = data.isFavorite;
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFavorite: isFav } : p))
        );
        setPopularProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFavorite: isFav } : p))
        );
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
        }
        fetchFavorites();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleAddToCart = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.ok) {
        triggerHapticNotification('success');
        fetchCart();
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, cartQuantity: (p.cartQuantity || 0) + 1 } : p
          )
        );
        setPopularProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, cartQuantity: (p.cartQuantity || 0) + 1 } : p
          )
        );
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) =>
            prev ? { ...prev, cartQuantity: (prev.cartQuantity || 0) + 1 } : null
          );
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleUpdateCartQty = async (
    productId: string,
    newQty: number,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchCart();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, cartQuantity: newQty } : p))
        );
        setPopularProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, cartQuantity: newQty } : p))
        );
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) =>
            prev ? { ...prev, cartQuantity: newQty } : null
          );
        }
      }
    } catch (err) {
      console.error('Error updating cart qty:', err);
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        fetchCart();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, cartQuantity: 0 } : p))
        );
        setPopularProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, cartQuantity: 0 } : p))
        );
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };

  const handleClearSelectedCart = async (productIds: string[]) => {
    for (const pid of productIds) {
      await handleRemoveCartItem(pid);
    }
  };

  const handleProductClick = (product: ProductItem) => {
    triggerHaptic('light');
    setSelectedProduct(product);
    // Add to recently viewed if not already there
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 6);
    });
  };

  const handleSupportClick = () => {
    triggerHaptic('medium');
    const url = 'https://t.me/milabranduz';
    const tg = getTelegramWebApp();
    if (tg) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 1. Loading splash while checking auth
  if (isAuthChecking) {
    return (
      <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <BrandLogo size="lg" />
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mt-6" />
        <span className="text-xs text-gray-400 font-medium mt-3">Yuklanmoqda...</span>
      </main>
    );
  }

  // 2. Strict registration barrier: User cannot open shop without bot registration
  if (!isVerified) {
    return (
      <RegistrationRequiredScreen
        onCheckAgain={checkAuth}
        botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'milabrand_bot'}
      />
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg text-brand-black flex flex-col justify-between max-w-md mx-auto shadow-2xl relative">
      {/* Dev Preview Mode Notice if outside Telegram */}
      {isDevPreview && (
        <div className="bg-brand-primary text-white text-[11px] py-1 px-3 text-center font-medium sticky top-0 z-50 flex items-center justify-between">
          <span>✨ MILA WebApp Preview Mode (Telegram environment simulated)</span>
          <span className="opacity-75">v1.0</span>
        </div>
      )}

      {/* Main View Router */}
      <div className="flex-1 w-full">
        {activeTab === 'home' && (
          <div className="w-full pb-28 animate-fade-in">
            {/* High Fashion Hero Banner with Lady Dior Model */}
            <HeroBanner>
              <SearchBar
                value={searchQuery}
                onChange={(q) => {
                  setSearchQuery(q);
                  if (q.trim()) setActiveTab('catalog');
                }}
                lang={lang}
              />
            </HeroBanner>

            <div className="px-4">
              {/* Category Pills with "TEZ KUNDA" Glass Badges (Matching Screenshot 1 & 3) */}
              {isLoadingCategories ? (
                <CategoryPillsSkeleton />
              ) : (
                <CategoryPills
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={(id) => {
                    setSelectedCategoryId(id);
                    setActiveTab('catalog');
                  }}
                  onViewAll={() => setActiveTab('catalog')}
                  lang={lang}
                />
              )}

              {/* 🛍 Ommabop (Popular) Carousel (Matching Screenshot 1 & 2) */}
              <ProductCarousel
                title={t.popular_section}
                subtitleLink={t.more_items}
                onSubtitleClick={() => setActiveTab('catalog')}
                products={popularProducts}
                onProductClick={handleProductClick}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                lang={lang}
              />

              {/* Main Product Grid: "Sumka" (Matching Screenshot 2) */}
              <section className="my-5">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-base font-bold text-brand-black tracking-tight">
                    {t.bags_category}
                  </h2>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="text-xs font-semibold text-brand-primary active:scale-95 transition-all"
                  >
                    {t.view_all}
                  </button>
                </div>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 10).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        layout="grid"
                        onProductClick={handleProductClick}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToCart={handleAddToCart}
                        onUpdateCartQty={handleUpdateCartQty}
                        isFavorite={product.isFavorite}
                        cartQuantity={product.cartQuantity}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onProductClick={handleProductClick}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            isLoading={isLoadingProducts}
            onBack={() => setActiveTab('home')}
            lang={lang}
          />
        )}

        {activeTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            user={user}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onClearSelected={handleClearSelectedCart}
            onToggleFavorite={handleToggleFavorite}
            onProductClick={handleProductClick}
            recentlyViewed={recentlyViewed}
            onGoToCatalog={() => setActiveTab('catalog')}
            onBack={() => setActiveTab('home')}
            lang={lang}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onProductClick={handleProductClick}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onGoToCatalog={() => setActiveTab('catalog')}
            onBack={() => setActiveTab('home')}
            lang={lang}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onBack={() => setActiveTab('home')}
            lang={lang}
            onLanguageChange={setLang}
            onLogout={() => {
              setUser(null);
              setActiveTab('home');
            }}
          />
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          isFavorite={selectedProduct.isFavorite}
          cartQuantity={selectedProduct.cartQuantity}
          lang={lang}
        />
      )}


      {/* Bottom Navigation Bar with 5 Tabs matching Screenshot 1-5 */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        lang={lang}
      />
    </main>
  );
}
