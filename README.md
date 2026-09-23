# MILA Luxury Fashion — Telegram E-Commerce Application

A production-ready Telegram-based e-commerce platform built for the luxury fashion brand **MILA**.
The system consists of:
1. **Telegram Web App / Mini App** (Next.js 15, TypeScript, Tailwind CSS, Telegram WebApp API)
2. **Telegram Bot** (grammY, TypeScript, multi-step admin wizard, native phone contact verification)
3. **Backend API** (Next.js App Router Route Handlers, Cryptographic initData HMAC-SHA256 validation)
4. **PostgreSQL Database** (Prisma ORM with User, Category, Product, ProductImage, Favorite, CartItem, Order, OrderItem)
5. **Telegram Image Proxy** (Streams and caches product images directly using Telegram `file_id` without external S3/R2 dependencies)
6. **In-Bot Admin Panel** (Product addition with photo/document upload, category management, live statistics)

---

## 📸 Design & Reference Replication

The Web App UI/UX is built to directly reproduce the 5 reference screenshots provided in `Looks/`:
- **Home Screen:** High-fashion model hero banner in light blue suit holding a powder blue handbag, floating search bar, category cards with dark glass `TEZ KUNDA` ("Coming Soon") overlays, horizontal `🛍 Ommabop` ("Popular") carousel, and active `Sumka` ("Bags") product collection.
- **Product Card:** Aspect-ratio bag photography with watermark styling, heart favorite button, discount badge (e.g. `-18.2%`), strikethrough old price, bold current price in UZS, star rating (`★ 5.0`), and `[ 🛍️+ Xarid qilish ]` pill button or quantity stepper `[ - ] 1 [ + ]`.
- **Product Details:** Mobile image gallery, price, discount badge, description, category tag, favorite button, and fixed bottom checkout bar.
- **Cart Screen:** `Tanlanganlarni o'chirish` in red, `Barchasini tanlash` with green checkmark, item card with checkbox, trash, stepper, `Sizning buyurtmangiz` summary card, `Yaqinda ko'rganlaringiz` carousel, and sticky bottom checkout bar.
- **Favorites Screen:** Saved items with quick add-to-cart and empty state: *"Sevimli mahsulotlaringiz shu yerda chiqadi"*.
- **Profile Screen:** Verified user name, verified phone number (`+998 ** *** ** **` from database), orders, reviews, multi-language switcher (O'zbekcha / Русский / English), delivery/return terms, contact us, and social links.
- **Bottom Navigation:** 5 luxury tabs with real-time cart badge counter.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Next.js App Router API Routes, Zod
- **Database:** PostgreSQL, Prisma ORM
- **Telegram Bot:** grammY 1.35, TypeScript
- **Authentication:** Telegram WebApp `initData` cryptographic HMAC-SHA256 validation
- **Image Storage:** Native Telegram `file_id` with server-side proxying and HTTP caching

---

## 📁 Project Structure

```
├── Looks/                          # Provided UI/UX reference screenshots
├── Products/                       # Provided initial product photos (68 items)
├── bot/
│   ├── config.ts                   # Bot environment and admin validation (ADMIN_ID_1, ADMIN_ID_2)
│   ├── handlers/
│   │   ├── start.ts                # Role-based /start handler (normal contact request vs admin panel)
│   │   ├── contact.ts              # Strict native Telegram contact verification & PostgreSQL upsert
│   │   ├── admin.ts                # Admin dashboard, product management, category management, stats
│   │   └── product-wizard.ts       # Interactive 8-step Add Product flow (photo/doc, price, multiple images)
│   ├── uploader.ts                 # CLI tool to batch upload local images to Telegram for live file_ids
│   └── index.ts                    # Main Telegram bot runner
├── prisma/
│   ├── schema.prisma               # Complete PostgreSQL schema
│   └── seed.ts                     # Database seeder (categories + 68 bag products)
├── app/
│   ├── layout.tsx                  # Root layout with Telegram WebApp script & meta viewport
│   ├── page.tsx                    # Main Web App shell (Home, Catalog, Cart, Favorites, Profile)
│   ├── globals.css                 # Custom design tokens, safe area padding, luxury animations
│   └── api/
│       ├── auth/telegram/route.ts  # Cryptographic initData check & verified phone validation
│       ├── me/route.ts             # Authenticated user profile
│       ├── categories/route.ts     # Active and upcoming categories
│       ├── products/route.ts       # Filtered, searched, and sorted products
│       ├── products/[id]/route.ts  # Product details with images
│       ├── favorites/route.ts      # User favorites CRUD in PostgreSQL
│       ├── cart/route.ts           # User cart CRUD in PostgreSQL
│       ├── images/[id]/route.ts    # Telegram file_id secure image proxy with caching
│       └── admin/                  # Admin API endpoints (stats, products, categories)
├── components/
│   ├── Header.tsx                  # Sticky header with MILA logo, profile, back button, support
│   ├── BottomNav.tsx               # 5-tab bottom navigation with live cart badge
│   ├── HeroBanner.tsx              # Model hero banner with diagonal color blocking
│   ├── SearchBar.tsx               # Floating pill search bar with clear button
│   ├── CategoryPills.tsx           # Category row with "TEZ KUNDA" dark glass badges
│   ├── ProductCard.tsx             # Fashion card matching Screenshot 2
│   ├── ProductCarousel.tsx         # Horizontal product slider
│   ├── ProductDetailModal.tsx      # Swipeable image gallery modal
│   ├── CartView.tsx                # Cart screen matching Screenshot 5
│   ├── FavoritesView.tsx           # Favorites screen with empty state
│   ├── ProfileView.tsx             # Profile screen matching Screenshot 4
│   ├── CatalogView.tsx             # Catalog search & filter screen matching Screenshot 3
│   ├── PhoneVerificationModal.tsx  # Unverified user guide modal
│   ├── BrandLogo.tsx               # Scalable luxury serif MILA SVG logo
│   └── SkeletonLoader.tsx          # Shimmering loading placeholders
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── telegram-auth.ts            # Official HMAC-SHA256 initData cryptographic validation
│   ├── telegram-image.ts           # Telegram file_id resolver and CDN proxy with cache
│   ├── telegram-client.ts          # Client-side Telegram WebApp SDK helpers
│   ├── auth-server.ts              # Server-side user resolver
│   ├── i18n.ts                     # Centralized translations (Uzbek, Russian, English)
│   └── types.ts                    # Domain TypeScript interfaces
├── public/
│   ├── products/                   # Initial product photos for development & local fallback
│   └── brand/                      # MILA logo and category assets
├── .env.example                    # Environment variable template
└── package.json
```

---

## ⚙️ Environment Variables

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

```ini
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mila_db?schema=public"

# Telegram Bot Token from @BotFather
BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"

# Telegram Bot Username (without @)
TELEGRAM_BOT_USERNAME="mila_brand_bot"

# Public URL of the Web App (where Telegram opens the Mini App)
WEB_APP_URL="https://your-domain.com"

# Admin Telegram User IDs (Numbers only)
# Get your numeric ID from @userinfobot
ADMIN_ID_1="123456789"
ADMIN_ID_2="987654321"

# Internal/Public Next.js URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NODE_ENV="development"
```

---

## 🚀 Setup & Installation Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database
Create a database named `mila_db` in PostgreSQL:
```sql
CREATE DATABASE mila_db;
```

### 3. Run Prisma Migrations
Push or migrate the schema to PostgreSQL:
```bash
npx prisma db push
# or: npx prisma migrate dev --name init
```

### 4. Seed Database with Initial Bags & Categories
Seed all initial 68 bag products and categories:
```bash
npm run seed
```

### 5. Start the Web App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
*(Note: If opened in a regular desktop browser outside Telegram, the app automatically enables Preview Mode with verified demo user data so you can browse, favorite, add to cart, and test every screen immediately!)*

### 6. Start the Telegram Bot
In a separate terminal window:
```bash
npm run bot
```

---

## 🤖 Telegram Bot & Mini App Configuration

### How to Configure the Mini App in @BotFather:
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/newapp` (or `/myapps` -> select your bot -> **Edit App**).
3. Select your bot (e.g., `@mila_brand_bot`).
4. Enter the App Title: `MILA Brand`.
5. Enter the App Description: `MILA — Luxury Fashion Bags & Accessories`.
6. Upload a 640x360 photo for the Web App banner (you can use `/brand/hero-model.jpg`).
7. Enter the Web App URL:
   - For local testing: Use an HTTPS tunnel like **ngrok** (`ngrok http 3000`) or **localtunnel** (`npx localtunnel --port 3000`). Example: `https://your-subdomain.ngrok-free.app`.
   - For production: Your deployed domain (e.g. `https://mila-shop.com`).
8. Enter the short name: `shop` (This creates the link `t.me/mila_brand_bot/shop`).

---

## 📱 User & Admin Experience Flows

### Normal User Registration Flow
1. User opens `@mila_brand_bot` in Telegram and sends `/start`.
2. The bot responds:
   ```
   MILA Brand'ga xush kelibsiz.
   Davom etish uchun telefon raqamingizni tasdiqlang.
   ```
   with a keyboard button: `[ 📱 Telefon nomer tasdiqlash ]`.
3. User taps the native button to share their Telegram account contact.
4. The bot strictly verifies that `msg.contact.user_id === msg.from.id` (rejecting any forwarded contacts).
5. User is stored in PostgreSQL with their verified phone number.
6. The bot displays:
   ```
   ✅ Telefon raqamingiz tasdiqlandi.
   Endi MILA katalogidan foydalanishingiz mumkin.
   ```
   with the Web App button: `[ 🛍 MILA Shop ]`.
7. Inside the Web App, Telegram WebApp `initData` is validated cryptographically via HMAC-SHA256, and the verified phone number is loaded from PostgreSQL.

### Admin In-Bot Management Flow
1. Admin (whose numeric Telegram ID is in `ADMIN_ID_1` or `ADMIN_ID_2`) sends `/start` to the bot.
2. The bot displays:
   ```
   👑 MILA ADMIN PANEL
   [ ➕ Tovar qo‘shish ]   [ 📦 Tovarlar ]
   [ 🗂 Kategoriyalar ]   [ ✏️ Tovarni tahrirlash ]
   [ 🗑 Tovarni o‘chirish ]   [ 📊 Statistika ]
   ```
3. **➕ Tovar qo‘shish (Add Product Wizard):**
   - Step 1: Admin sends product photo (accepts both Telegram Photo and Document file).
   - Step 2: Admin enters product name.
   - Step 3: Admin selects category from inline buttons or creates a new one.
   - Step 4: Admin enters price in UZS (e.g. `549000`).
   - Step 5: Admin enters old price for discount badge or skips.
   - Step 6: Admin enters description.
   - Step 7: Admin can upload multiple additional photos/documents, then taps `[ ✅ Tayyor ]`.
   - Step 8: Bot displays a full preview summary with `[ ✅ Saqlash ]` and `[ ❌ Bekor qilish ]`.
   - Upon confirmation, saves to PostgreSQL with Telegram `file_id`s!
4. **📦 Tovarlar:** Paginated list of products, status toggling (Active/Inactive), price editing, and details viewing.
5. **🗂 Kategoriyalar:** View categories, toggle active status, create new categories.
6. **🗑 Tovarni o‘chirish:** Select product and confirm deletion dialog:
   ```
   Ushbu mahsulotni o‘chirishni tasdiqlaysizmi?
   [ ❌ Bekor qilish ]   [ 🗑 Ha, o‘chirish ]
   ```
7. **📊 Statistika:** Live count of total users, verified users, total products, active products, categories, favorites, and cart items.

---

## 🖼 Product Image Architecture (Telegram `file_id`)

Per the project specification, no external S3 or cloud bucket is required:
1. When an admin uploads photos to the bot, Telegram's highest resolution `file_id` is extracted and stored in the PostgreSQL `ProductImage` table.
2. When the Web App displays images, it calls:
   ```
   GET /api/images/:productImageId
   ```
3. The Next.js backend server securely contacts Telegram Bot API (`getFile`), caches the resolved `file_path`, and streams the image directly to the client with `Cache-Control: public, max-age=86400` headers.
4. **`BOT_TOKEN` is NEVER exposed to the frontend.**
5. Optional batch uploader tool: Once your bot is configured, run `npm run seed:telegram` to automatically upload the 68 local product assets in `Products/` to Telegram and convert them to live Telegram `file_id`s in PostgreSQL.

---

## 🚢 Production Deployment

### Option 1: Vercel / Railway / Render
1. Push repository to GitHub.
2. Deploy Next.js to Vercel or Railway.
3. Attach managed PostgreSQL database (e.g. Neon, Supabase, Railway Postgres).
4. Set environment variables in dashboard (`DATABASE_URL`, `BOT_TOKEN`, `WEB_APP_URL`, etc.).
5. Run migrations: `npx prisma db push`.
6. Run bot as a background worker process: `npm run bot`.

---

## 🔒 Security Summary

- **HMAC-SHA256 InitData Validation:** Per official Telegram documentation, requests are verified using `crypto.createHmac('sha256', secretKey)` where `secretKey = HMAC_SHA256("WebAppData", BOT_TOKEN)`.
- **Phone Verification Integrity:** Contact sharing enforces `contact.user_id === msg.from.id` server-side in the bot.
- **Admin Authorization:** Server-side comparison against `ADMIN_ID_1` and `ADMIN_ID_2`.
- **Zero Bot Token Leakage:** The bot token never reaches client JavaScript.
