import fs from 'fs';
import path from 'path';
import { CategoryItem, ProductItem, CartItemModel, AppUser } from './types';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-sumka',
    name: 'Sumka',
    slug: 'sumka',
    isActive: true,
    sortOrder: 1,
    imageUrl: '/brand/category-bags.jpg',
    _count: { products: 35 },
  },
  {
    id: 'cat-kupalniki',
    name: "Cho'milish kiyimlari",
    slug: 'kupalniki',
    isActive: false, // Coming soon
    sortOrder: 2,
    imageUrl: '/brand/category-swimwear.jpg',
    _count: { products: 0 },
  },
  {
    id: 'cat-sport',
    name: 'Sport kiyimlari',
    slug: 'sport',
    isActive: false, // Coming soon
    sortOrder: 3,
    imageUrl: '/brand/category-sport.jpg',
    _count: { products: 0 },
  },
  {
    id: 'cat-odejda',
    name: 'Kiyimlar',
    slug: 'odejda',
    isActive: false, // Coming soon
    sortOrder: 4,
    imageUrl: '/brand/category-clothing.jpg',
    _count: { products: 0 },
  },
];

const BAG_TITLES = [
  'LADY DIOR - Powder Blue',
  'ZARA White Minimalist Elegance',
  'Hermes Leopard Edition',
  'Chanel Classic Black Quilted Flap',
  'MILA Burgundy Monogram Crossbody',
  'Celine Triomphe Saddle Bag',
  'MILA Gold Chain Evening Clutch',
  'Dior Diamond Quilted Lady Tote',
  'Prada Vintage Caramel Satchel',
  'Gucci Royal Emerald Top Handle',
  'MILA Croco Embossed Mini Shoulder',
  'Yves Saint Laurent Kate Flap',
  'Fendi Baguette Jacquard Bag',
  'MILA Velvet Night Clutch',
  'Bottega Veneta Cassette Pouch',
  'MILA Structured Executive Tote',
  'Louis Vuitton Petite Malle Trunk',
  'MILA Chic Top Handle Handbag',
  'MILA Urban Nomad Soft Backpack',
  'MILA Midnight Sapphire Shoulder',
  'MILA Blush Pink Evening Bag',
  'MILA Crimson Sunset Bucket Bag',
  'MILA Geometric Trapezoid Handbag',
  'MILA Golden Metallic Flap',
  'MILA Coffee Brown Daily Shopper',
  'MILA Olive Green Hobo Bag',
  'MILA Lilac Blossom Mini Bag',
  'MILA Silver Star Night Clutch',
  'MILA Onyx Black Quilted Tote',
];

const PRICE_TIERS = [
  { price: 549000, oldPrice: 799000 },
  { price: 490000, oldPrice: 599000 },
  { price: 1200000, oldPrice: 1409990 },
  { price: 1099000, oldPrice: 1200000 },
  { price: 680000, oldPrice: 850000 },
  { price: 890000, oldPrice: 1100000 },
  { price: 420000, oldPrice: 520000 },
  { price: 750000, oldPrice: 900000 },
  { price: 980000, oldPrice: 1250000 },
  { price: 1350000, oldPrice: 1600000 },
  { price: 580000, oldPrice: 690000 },
  { price: 820000, oldPrice: 990000 },
];

export function getInitialProducts(): ProductItem[] {
  const productsDir = path.join(process.cwd(), 'public', 'products');
  let imageFiles: string[] = [];

  try {
    if (fs.existsSync(productsDir)) {
      imageFiles = fs
        .readdirSync(productsDir)
        .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
        .sort();
    }
  } catch (e) {
    console.warn('Error reading products dir:', e);
  }

  if (imageFiles.length === 0) {
    imageFiles = ['photo_1_2026-09-24_00-01-27.jpg'];
  }

  const items: ProductItem[] = [];
  let imgIdx = 0;
  let pIdx = 0;

  while (imgIdx < imageFiles.length && pIdx < 35) {
    const primaryImg = imageFiles[imgIdx++];
    const secondaryImg = imgIdx < imageFiles.length && imgIdx % 2 === 0 ? imageFiles[imgIdx++] : null;

    const titleIndex = pIdx % BAG_TITLES.length;
    const name = pIdx < BAG_TITLES.length ? BAG_TITLES[titleIndex] : `${BAG_TITLES[titleIndex]} Vol. ${Math.floor(pIdx / BAG_TITLES.length) + 1}`;
    const tier = PRICE_TIERS[pIdx % PRICE_TIERS.length];
    const discount = tier.oldPrice ? Math.round(((tier.oldPrice - tier.price) / tier.oldPrice) * 100) : null;
    const pId = `prod-${pIdx + 1}`;

    const images = [
      {
        id: `img-${pIdx}-1`,
        productId: pId,
        telegramFileId: `local:${primaryImg}`,
        sortOrder: 0,
      },
    ];

    if (secondaryImg) {
      images.push({
        id: `img-${pIdx}-2`,
        productId: pId,
        telegramFileId: `local:${secondaryImg}`,
        sortOrder: 1,
      });
    }

    items.push({
      id: pId,
      name,
      slug: `mila-bag-${String(pIdx + 1).padStart(3, '0')}`,
      categoryId: 'cat-sumka',
      category: INITIAL_CATEGORIES[0],
      price: tier.price,
      oldPrice: tier.oldPrice,
      discountPercentage: discount,
      description:
        'Yuqori sifatli tabiiy charmdan ishlangan MILA brendining eksklyuziv sumkasi. Qulay bo‘linmalar, mustahkam tillarang furnitura va nafis dizayn.',
      isActive: true,
      rating: 5.0,
      reviewCount: 0,
      images,
      isFavorite: false,
      cartQuantity: 0,
      createdAt: new Date().toISOString(),
    });

    pIdx++;
  }

  return items;
}

// In-memory fallback stores for development/preview when PostgreSQL is pending credentials
export const memoryFavorites = new Set<string>();
export const memoryCart = new Map<string, number>();

export const DEMO_USER: AppUser = {
  id: 'user-demo-1',
  telegramId: '123456789',
  firstName: 'Ziyodulla',
  lastName: 'MILA',
  username: 'ziyodulla_mila',
  phone: '+998777777777',
  isVerified: true,
  createdAt: new Date().toISOString(),
};
