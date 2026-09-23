export type Language = 'uz' | 'ru' | 'en';

export const translations = {
  uz: {
    // Navigation
    nav_home: 'Bosh sahifa',
    nav_catalog: 'Katalog',
    nav_cart: 'Savat',
    nav_favorites: 'Sevimlilar',
    nav_profile: 'Profil',

    // Home & Catalog
    search_placeholder: 'Mahsulotlar va toifalarni qidirish',
    categories: 'Toifalar',
    popular_section: '🛍 Ommabop',
    bags_category: 'Sumka',
    coming_soon: 'TEZ KUNDA',
    view_all: 'Barchasi >',
    more_items: 'Yana 1 ta >',
    no_reviews: 'Sharhlar yo‘q',
    buy_button: 'Xarid qilish',
    in_cart: 'Savatda',
    reviews_count: 'sharh',
    currency: 'UZS',

    // Product Details
    product_details: 'Mahsulot tafsilotlari',
    add_to_cart: 'Savatga qo‘shish',
    added_to_cart: 'Savatga qo‘shildi',
    description: 'Tavsif',
    category: 'Kategoriya',

    // Cart
    cart_title: 'Savat',
    delete_selected: 'Tanlanganlarni o‘chirish',
    select_all: 'Barchasini tanlash',
    your_order: 'Sizning buyurtmangiz',
    items_count: 'ta mahsulot:',
    total_amount: 'Jami qiymat',
    recently_viewed: 'Yaqinda ko‘rganlaringiz',
    checkout_button: 'Buyurtma berish',
    cart_empty_title: 'Savat hozircha bo‘sh',
    cart_empty_desc: 'O‘zingizga yoqqan sumkalarni katalogdan tanlang',
    go_shopping: 'Katalogga o‘tish',
    order_success: 'Buyurtmangiz qabul qilindi! Tez orada operator bog‘lanadi.',

    // Favorites
    favorites_title: 'Sevimlilar',
    favorites_empty_title: 'Sevimli mahsulotlaringiz shu yerda chiqadi',
    favorites_empty_desc: 'O‘zingizga ma’qul sumkalarni yurakcha belgisi orqali saqlab qo‘ying',

    // Profile
    profile_title: 'Profil',
    verified_phone: 'Tasdiqlangan telefon',
    my_orders: 'Mening buyurtmalarim',
    my_reviews: 'Mening sharhlarim',
    settings: 'Sozlamalar',
    language: 'Til',
    about_us: 'Biz haqimizda',
    delivery_terms: 'Yetkazib berish shartlari',
    return_policy: 'Qaytarish va almashtirish',
    contact_us: 'Biz bilan bog‘lanish',
    logout: 'Hisobdan chiqish',
    social_networks: 'Ijtimoiy tarmoqlar:',
    powered_by: 'MILA Luxury Brand © 2026',

    // Verification Prompt
    verification_required: 'Telefon raqamingizni tasdiqlang',
    verification_desc: 'MILA brendining to‘liq xarid imkoniyatlaridan foydalanish uchun Telegram botimizda telefon raqamingizni tasdiqlang.',
    open_bot: 'Telegram botni ochish',
    check_again: 'Qaytadan tekshirish',

    // Filter & Sort
    sort_by: 'Saralash',
    sort_popular: 'Ommabop',
    sort_price_asc: 'Narx: arzondan qimmatga',
    sort_price_desc: 'Narx: qimmatdan arzonga',
    all_categories: 'Barchasi',
    no_products: 'Hozircha mahsulotlar mavjud emas',
  },
  ru: {
    // Navigation
    nav_home: 'Главная',
    nav_catalog: 'Каталог',
    nav_cart: 'Корзинка',
    nav_favorites: 'Избранное',
    nav_profile: 'Профиль',

    // Home & Catalog
    search_placeholder: 'Поиск продуктов и категорий',
    categories: 'Категории',
    popular_section: '🛍 Популярный',
    bags_category: 'Сумка',
    coming_soon: 'СКОРО',
    view_all: 'Все >',
    more_items: '1 ещё >',
    no_reviews: 'Нет отзывов',
    buy_button: 'Купить',
    in_cart: 'В корзине',
    reviews_count: 'отзывов',
    currency: 'UZS',

    // Product Details
    product_details: 'Детали товара',
    add_to_cart: 'Добавить в корзину',
    added_to_cart: 'Добавлено в корзину',
    description: 'Описание',
    category: 'Категория',

    // Cart
    cart_title: 'Корзинка',
    delete_selected: 'Удалить выбранные',
    select_all: 'Выбрать все',
    your_order: 'Ваш заказ',
    items_count: 'товара:',
    total_amount: 'Общая стоимость',
    recently_viewed: 'Вы смотрели',
    checkout_button: 'Перейти к оформлению',
    cart_empty_title: 'Корзина пока пуста',
    cart_empty_desc: 'Выберите понравившиеся сумки в каталоге',
    go_shopping: 'Перейти в каталог',
    order_success: 'Ваш заказ принят! Скоро оператор свяжется с вами.',

    // Favorites
    favorites_title: 'Избранное',
    favorites_empty_title: 'Sevimli mahsulotlaringiz shu yerda chiqadi',
    favorites_empty_desc: 'Сохраняйте понравившиеся товары, нажимая на сердечко',

    // Profile
    profile_title: 'Профиль',
    verified_phone: 'Подтвержденный телефон',
    my_orders: 'Мои заказы',
    my_reviews: 'Мои отзывы',
    settings: 'Настройки',
    language: 'Язык',
    about_us: 'О нас',
    delivery_terms: 'Условия доставки',
    return_policy: 'Условия возврата и обмена',
    contact_us: 'Связаться с нами',
    logout: 'Выйти из аккаунта',
    social_networks: 'Социальные сети:',
    powered_by: 'MILA Luxury Brand © 2026',

    // Verification Prompt
    verification_required: 'Подтвердите номер телефона',
    verification_desc: 'Чтобы получить доступ к покупкам в MILA, подтвердите свой номер телефона в Telegram боте.',
    open_bot: 'Открыть Telegram бот',
    check_again: 'Проверить снова',

    // Filter & Sort
    sort_by: 'Сортировка',
    sort_popular: 'Популярные',
    sort_price_asc: 'Сначала дешевле',
    sort_price_desc: 'Сначала дороже',
    all_categories: 'Все категории',
    no_products: 'Товары не найдены',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_catalog: 'Catalog',
    nav_cart: 'Cart',
    nav_favorites: 'Favorites',
    nav_profile: 'Profile',

    // Home & Catalog
    search_placeholder: 'Search products and categories',
    categories: 'Categories',
    popular_section: '🛍 Popular',
    bags_category: 'Bags',
    coming_soon: 'COMING SOON',
    view_all: 'All >',
    more_items: '1 more >',
    no_reviews: 'No reviews',
    buy_button: 'Buy',
    in_cart: 'In cart',
    reviews_count: 'reviews',
    currency: 'UZS',

    // Product Details
    product_details: 'Product details',
    add_to_cart: 'Add to Cart',
    added_to_cart: 'Added to cart',
    description: 'Description',
    category: 'Category',

    // Cart
    cart_title: 'Cart',
    delete_selected: 'Delete selected',
    select_all: 'Select all',
    your_order: 'Your order',
    items_count: 'items:',
    total_amount: 'Total amount',
    recently_viewed: 'Recently viewed',
    checkout_button: 'Proceed to checkout',
    cart_empty_title: 'Your cart is empty',
    cart_empty_desc: 'Explore our catalog to find luxury bags',
    go_shopping: 'Go to Catalog',
    order_success: 'Order placed successfully! We will contact you shortly.',

    // Favorites
    favorites_title: 'Favorites',
    favorites_empty_title: 'Your favorites will appear here',
    favorites_empty_desc: 'Save luxury items you love by tapping the heart icon',

    // Profile
    profile_title: 'Profile',
    verified_phone: 'Verified phone',
    my_orders: 'My orders',
    my_reviews: 'My reviews',
    settings: 'Settings',
    language: 'Language',
    about_us: 'About us',
    delivery_terms: 'Delivery terms',
    return_policy: 'Return & exchange policy',
    contact_us: 'Contact us',
    logout: 'Log out',
    social_networks: 'Social networks:',
    powered_by: 'MILA Luxury Brand © 2026',

    // Verification Prompt
    verification_required: 'Verify your phone number',
    verification_desc: 'To access luxury shopping at MILA, please verify your phone number via our Telegram bot.',
    open_bot: 'Open Telegram Bot',
    check_again: 'Check again',

    // Filter & Sort
    sort_by: 'Sort by',
    sort_popular: 'Popular',
    sort_price_asc: 'Price: Low to High',
    sort_price_desc: 'Price: High to Low',
    all_categories: 'All Categories',
    no_products: 'No products found',
  },
};
