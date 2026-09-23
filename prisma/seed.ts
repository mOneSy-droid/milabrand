import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const BAG_NAMES = [
  'MILA Lady Dior - Powder Blue',
  'MILA White Minimalist Elegance',
  'MILA Hermes Leopard Edition',
  'MILA Classic Black Quilted Flap',
  'MILA Burgundy Monogram Crossbody',
  'MILA Saddle Leather Shoulder Bag',
  'MILA Petite Gold Chain Clutch',
  'MILA Diamond Quilted Tote',
  'MILA Vintage Caramel Satchel',
  'MILA Royal Emerald Handbag',
  'MILA Croco Embossed Mini Bag',
  'MILA Beige Canvas Summer Tote',
  'MILA Velvet Evening Clutch',
  'MILA Structured Work Tote',
  'MILA Metallic Bronze Crossbody',
  'MILA Soft Pleated Cloud Pouch',
  'MILA Chic Top Handle Bag',
  'MILA Ivory Pearl Accent Bag',
  'MILA Urban Nomad Backpack',
  'MILA Midnight Sapphire Handbag',
  'MILA Signature Jacquard Bag',
  'MILA Blush Pink Shoulder Bag',
  'MILA Crimson Sunset Bucket Bag',
  'MILA Geometric Trapezoid Tote',
  'MILA Golden Metallic Flap',
  'MILA Coffee Brown Shopper',
  'MILA Olive Green Hobo Bag',
  'MILA Lilac Blossom Mini Bag',
  'MILA Silver Star Night Clutch',
  'MILA Onyx Black Daily Tote',
];

const DESCRIPTIONS = [
  'Yuqori sifatli tabiiy charmdan ishlangan MILA brendining eksklyuziv sumkasi. Qulay bo‘linmalar, mustahkam tillarang furnitura va nafis dizayn.',
  'Kundalik va tantanali tadbirlar uchun ideal tanlov. Suv o‘tkazmaydigan material, chiroyli qoplamali zanjir va premium astar bilan ta’minlangan.',
  'MILA yangi to‘plamidagi nafis ayollar sumkasi. Yengil, ko‘rkam va har qanday kiyim uslubiga mukammal mos tushadi.',
  'Eksklyuziv zamonaviy dizayn. Har bir detalida mukammallik va did aks etgan premium sumka.',
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create or update Categories
  const bagsCategory = await prisma.category.upsert({
    where: { slug: 'sumka' },
    update: {
      name: 'Sumka',
      isActive: true,
      sortOrder: 1,
      imageUrl: '/brand/category-bags.jpg',
    },
    create: {
      name: 'Sumka',
      slug: 'sumka',
      isActive: true,
      sortOrder: 1,
      imageUrl: '/brand/category-bags.jpg',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'kupalniki' },
    update: {
      name: "Cho'milish kiyimlari",
      isActive: false, // Coming soon
      sortOrder: 2,
      imageUrl: '/brand/category-swimwear.jpg',
    },
    create: {
      name: "Cho'milish kiyimlari",
      slug: 'kupalniki',
      isActive: false,
      sortOrder: 2,
      imageUrl: '/brand/category-swimwear.jpg',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'sport' },
    update: {
      name: 'Sport kiyimlari',
      isActive: false, // Coming soon
      sortOrder: 3,
      imageUrl: '/brand/category-sport.jpg',
    },
    create: {
      name: 'Sport kiyimlari',
      slug: 'sport',
      isActive: false,
      sortOrder: 3,
      imageUrl: '/brand/category-sport.jpg',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'odejda' },
    update: {
      name: 'Kiyimlar',
      isActive: false, // Coming soon
      sortOrder: 4,
      imageUrl: '/brand/category-clothing.jpg',
    },
    create: {
      name: 'Kiyimlar',
      slug: 'odejda',
      isActive: false,
      sortOrder: 4,
      imageUrl: '/brand/category-clothing.jpg',
    },
  });

  console.log('✅ Categories seeded');

  // 2. Scan public/products directory
  const productsDir = path.join(process.cwd(), 'public', 'products');
  let imageFiles: string[] = [];

  if (fs.existsSync(productsDir)) {
    imageFiles = fs
      .readdirSync(productsDir)
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .sort();
  }

  console.log(`📸 Found ${imageFiles.length} product images in public/products`);

  // Default price ladder in UZS
  const priceTiers = [
    { price: 490000, oldPrice: 599000 },
    { price: 549000, oldPrice: 799000 },
    { price: 620000, oldPrice: 750000 },
    { price: 780000, oldPrice: 950000 },
    { price: 890000, oldPrice: 1100000 },
    { price: 1099000, oldPrice: 1200000 },
    { price: 1200000, oldPrice: 1409990 },
    { price: 450000, oldPrice: null },
    { price: 580000, oldPrice: 690000 },
  ];

  // Group images into products (1 to 2 images per product, giving ~35-45 rich products)
  let imgIndex = 0;
  let productCount = 0;

  while (imgIndex < imageFiles.length) {
    const primaryImg = imageFiles[imgIndex];
    imgIndex++;

    // Optionally attach a secondary angle if available
    const secondaryImg = imgIndex < imageFiles.length && imgIndex % 3 === 0 ? imageFiles[imgIndex++] : null;

    productCount++;
    const nameIndex = (productCount - 1) % BAG_NAMES.length;
    const baseName = BAG_NAMES[nameIndex];
    const name = productCount <= BAG_NAMES.length ? baseName : `${baseName} Vol. ${Math.floor(productCount / BAG_NAMES.length) + 1}`;
    const slug = `mila-bag-${String(productCount).padStart(3, '0')}`;
    const tier = priceTiers[(productCount - 1) % priceTiers.length];
    const desc = DESCRIPTIONS[(productCount - 1) % DESCRIPTIONS.length];

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        categoryId: bagsCategory.id,
        price: tier.price,
        oldPrice: tier.oldPrice,
        description: desc,
        isActive: true,
        rating: 5.0,
        reviewCount: Math.floor(Math.random() * 8) + 1,
      },
      create: {
        name,
        slug,
        categoryId: bagsCategory.id,
        price: tier.price,
        oldPrice: tier.oldPrice,
        description: desc,
        isActive: true,
        rating: 5.0,
        reviewCount: Math.floor(Math.random() * 8) + 1,
      },
    });

    // Delete existing images for clean re-seed
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    // Insert primary image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        telegramFileId: `local:${primaryImg}`,
        sortOrder: 0,
      },
    });

    // Insert secondary image if present
    if (secondaryImg) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          telegramFileId: `local:${secondaryImg}`,
          sortOrder: 1,
        },
      });
    }
  }

  console.log(`✅ Seeded ${productCount} products with images`);

  // 3. Create demo verified user for development/preview
  const adminId1 = process.env.ADMIN_ID_1 || '123456789';
  await prisma.user.upsert({
    where: { telegramId: BigInt(adminId1) },
    update: {
      firstName: 'Ziyodulla',
      username: 'mila_admin',
      phone: '+998901234567',
      isVerified: true,
    },
    create: {
      telegramId: BigInt(adminId1),
      firstName: 'Ziyodulla',
      username: 'mila_admin',
      phone: '+998901234567',
      isVerified: true,
    },
  });

  console.log('✅ Demo verified user seeded');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
