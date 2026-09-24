export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface AppUser {
  id: string;
  telegramId: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

export interface ProductImageItem {
  id: string;
  productId: string;
  telegramFileId: string;
  sortOrder: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: CategoryItem;
  price: number;
  oldPrice?: number | null;
  discountPercentage?: number | null;
  description?: string | null;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  images: ProductImageItem[];
  isFavorite?: boolean;
  cartQuantity?: number;
  createdAt: string;
}

export interface CartItemModel {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: ProductItem;
  selected?: boolean;
}

export interface CartSummary {
  items: CartItemModel[];
  totalQuantity: number;
  totalAmount: number;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalFavorites: number;
  totalCartItems: number;
}
