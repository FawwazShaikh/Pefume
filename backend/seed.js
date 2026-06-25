import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();


const collectionsData = [
  {
    id: 'baccarat-rouge-540',
    name: 'Baccarat Rouge 540 Extrait de Parfum',
    brand: 'Maison Francis Kurkdjian',
    description: 'Baccarat Rouge 540 Extrait de Parfum is a luxurious, intense, and instantly recognizable fragrance that blends saffron warmth, bitter almond, radiant florals, and rich amber woods. It opens with a glowing spicy sweetness, evolves into a smooth floral-woody heart, and settles into a deep musky-amber dry-down that lasts for hours.\n\nThis extrait version feels richer, denser, and more sensual than the original, delivering a bold yet elegant aura that leaves a memorable trail wherever you go.',
    price: 1500,
    category: 'decants',
    image: '/images/perfume_1.jpeg',
    images: ['/images/perfume_1.jpeg', '/images/perfume_3.jpeg', '/images/perfume_5.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 1500 },
      { size: '5ml Decant', price: 3200 },
      { size: '10ml Decant', price: 5800 },
      { size: '20ml Decant', price: 10500 },
      { size: '30ml Decant', price: 14800 }
    ]
  },
  {
    id: 'azzaro-the-most-wanted',
    name: 'The Most Wanted Eau de Parfum',
    brand: 'Azzaro',
    description: 'Azzaro The Most Wanted is an intense fragrance for men, designed to release your energy and inspire you to live life to the fullest. Combining notes of fresh cardamom, warm toffee, and mysterious amberwood, this scent leaves a powerful, seductive trail that is impossible to ignore.',
    price: 350,
    category: 'decants',
    image: '/images/perfume_2.jpeg',
    images: ['/images/perfume_2.jpeg', '/images/perfume_14.jpeg', '/images/perfume_15.jpeg', '/images/perfume_16.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 350 },
      { size: '5ml Decant', price: 790 },
      { size: '10ml Decant', price: 1450 },
      { size: '20ml Decant', price: 2700 },
      { size: '30ml Decant', price: 3900 }
    ]
  },
  {
    id: 'spicebomb-extreme',
    name: 'Spicebomb Extreme',
    brand: 'Viktor & Rolf',
    description: 'Spicebomb Extreme is a highly addictive and explosive fragrance. It opens with piquant notes of pimento and black pepper, before revealing a sweet, warm heart of cinnamon and cumin. The dry-down features rich tobacco and bourbon vanilla, leaving a warm, long-lasting presence on the skin.',
    price: 450,
    category: 'decants',
    image: '/images/perfume_4.jpeg',
    images: ['/images/perfume_4.jpeg', '/images/perfume_6.jpeg', '/images/perfume_9.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 450 },
      { size: '5ml Decant', price: 990 },
      { size: '10ml Decant', price: 1850 },
      { size: '20ml Decant', price: 3400 },
      { size: '30ml Decant', price: 4900 }
    ]
  },
  {
    id: 'lattafa-yara',
    name: 'Yara Eau de Parfum',
    brand: 'Lattafa',
    description: 'Yara by Lattafa Perfumes is an exceptionally creamy, sweet, and comforting fragrance for women. It blends tropical fruits, gourmand notes, and warm vanilla with soft orchid blooms. It feels like a luxurious sweet treat, projecting a soft yet highly addictive aura.',
    price: 180,
    category: 'decants',
    image: '/images/perfume_7.jpeg',
    images: ['/images/perfume_7.jpeg', '/images/perfume_8.jpeg', '/images/perfume_10.jpeg', '/images/perfume_13.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 180 },
      { size: '5ml Decant', price: 390 },
      { size: '10ml Decant', price: 690 },
      { size: '20ml Decant', price: 1200 },
      { size: '30ml Decant', price: 1700 }
    ]
  },
  {
    id: 'lattafa-khamrah',
    name: 'Khamrah & Khamrah Qahwa',
    brand: 'Lattafa',
    description: 'Lattafa Khamrah is a warm, oriental, and boozy masterpiece. It opens with spices and fresh bergamot, leading to a luscious heart of dates and praline. In this edition, a splash of coffee note is infused, giving the fragrance a rich, roasted complexity that lasts all day.',
    price: 220,
    category: 'decants',
    image: '/images/perfume_11.jpeg',
    images: ['/images/perfume_11.jpeg', '/images/perfume_12.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 220 },
      { size: '5ml Decant', price: 490 },
      { size: '10ml Decant', price: 890 },
      { size: '20ml Decant', price: 1600 },
      { size: '30ml Decant', price: 2300 }
    ]
  },
  {
    id: 'valentino-born-in-roma',
    name: 'Born In Roma Uomo Intense',
    brand: 'Valentino',
    description: 'Valentino Born In Roma Uomo Intense is a tribute to the eternal city, showcasing a bold, studded presence. It features fresh ginger, aromatic sage, and lavender, dried down into a smoky, dark vetiver and sweet vanilla base.',
    price: 450,
    category: 'decants',
    image: '/images/perfume_18.jpeg',
    images: ['/images/perfume_18.jpeg', '/images/perfume_19.jpeg', '/images/perfume_20.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 450 },
      { size: '5ml Decant', price: 950 },
      { size: '10ml Decant', price: 1800 },
      { size: '20ml Decant', price: 3200 },
      { size: '30ml Decant', price: 4500 }
    ]
  },
  {
    id: 'valentino-born-in-roma-set',
    name: 'Born In Roma Trio Discovery Set',
    brand: 'Valentino',
    description: 'The Valentino Born In Roma Trio Discovery Set features three 5ml decants of the legendary line: Born in Roma (Classic/Woody), Coral Fantasy (Fresh/Fruity), and Yellow Dream (Sweet/Gingerbread). Explore the full spectrum of Italian high-fashion perfumery.',
    price: 2900,
    category: 'sets',
    image: '/images/perfume_17.jpeg',
    images: ['/images/perfume_17.jpeg', '/images/perfume_18.jpeg', '/images/perfume_19.jpeg', '/images/perfume_20.jpeg'],
    featured: true,
    sizes: [
      { size: '3x 5ml Discovery Set', price: 2900 }
    ]
  },
  {
    id: 'rasasi-hawas',
    name: 'Hawas for Him',
    brand: 'Rasasi',
    description: 'Rasasi Hawas blends fresh apple, bergamot, and sweet cinnamon with clean marine notes, melon, and rich ambergris. It represents strength, vigor, and energetic freshness, making it one of the absolute best summer fragrances.',
    price: 250,
    category: 'decants',
    image: '/images/perfume_21.jpeg',
    images: ['/images/perfume_21.jpeg', '/images/perfume_22.jpeg', '/images/perfume_23.jpeg', '/images/perfume_24.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 250 },
      { size: '5ml Decant', price: 550 },
      { size: '10ml Decant', price: 990 },
      { size: '20ml Decant', price: 1850 },
      { size: '30ml Decant', price: 2600 }
    ]
  },
  {
    id: 'afnan-9pm',
    name: '9 PM Eau de Parfum',
    brand: 'Afnan',
    description: 'Afnan 9 PM is a powerful, sweet evening fragrance. Opens with notes of fresh apple, wild lavender, and spicy cinnamon, before transitioning to a rich base of Madagascar vanilla, tonka bean, amber, and earth patchouli. Perfect for clubbing and night outs.',
    price: 180,
    category: 'decants',
    image: '/images/perfume_25.jpeg',
    images: ['/images/perfume_25.jpeg', '/images/perfume_26.jpeg', '/images/perfume_29.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 180 },
      { size: '5ml Decant', price: 390 },
      { size: '10ml Decant', price: 690 },
      { size: '20ml Decant', price: 1200 },
      { size: '30ml Decant', price: 1700 }
    ]
  },
  {
    id: 'afnan-9am',
    name: '9 AM Eau de Parfum',
    brand: 'Afnan',
    description: '9 AM by Afnan is a fresh, bright morning fragrance that wakes you up. Juicy mandarin, lemon citron, and pink pepper blend with aromatic lavender and green apple, drying down into smooth cedarwood and warm musk. A perfect clean daily driver.',
    price: 180,
    category: 'decants',
    image: '/images/perfume_27.jpeg',
    images: ['/images/perfume_27.jpeg', '/images/perfume_28.jpeg', '/images/perfume_30.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 180 },
      { size: '5ml Decant', price: 390 },
      { size: '10ml Decant', price: 690 },
      { size: '20ml Decant', price: 1200 },
      { size: '30ml Decant', price: 1700 }
    ]
  },
  {
    id: 'afnan-supremacy',
    name: 'Supremacy Not Only Intense',
    brand: 'Afnan',
    description: 'Afnan Supremacy Not Only Intense is a rich, fruity-smoky formulation built for maximum projection. It features blackcurrant, pineapple-like apple freshness, aromatic lavender, oakmoss, and ambergris. A bold signature statement.',
    price: 3900,
    category: 'fullbottles',
    image: '/images/perfume_31.jpeg',
    images: ['/images/perfume_31.jpeg', '/images/perfume_34.jpeg'],
    featured: false,
    sizes: [
      { size: '100ml Retail Bottle', price: 3900 }
    ]
  },
  {
    id: 'afnan-supremacy-collector',
    name: "Supremacy Collector's Edition",
    brand: 'Afnan',
    description: "Presented in a granite-speckled textured bottle, Afnan Supremacy Collector's Edition is a warm leather, rich saffron, and dark wood masterpiece. Designed for distinguished tastes, it features projection and longevity fit for royalty.",
    price: 5400,
    category: 'fullbottles',
    image: '/images/perfume_32.jpeg',
    images: ['/images/perfume_32.jpeg', '/images/perfume_33.jpeg', '/images/perfume_35.jpeg', '/images/perfume_37.jpeg'],
    featured: true,
    sizes: [
      { size: '100ml Retail Bottle', price: 5400 }
    ]
  },
  {
    id: 'bleu-de-chanel',
    name: 'Bleu de Chanel Eau de Parfum',
    brand: 'Chanel',
    description: 'Bleu de Chanel Eau de Parfum is an aromatic-woody fragrance that unites the invigorating freshness of citrus with the woody whisper of dry cedar. Sandalwood from New Caledonia lends it a warm, sensual, and highly sophisticated trail.',
    price: 14500,
    category: 'fullbottles',
    image: '/images/perfume_36.jpeg',
    images: ['/images/perfume_36.jpeg', '/images/perfume_38.jpeg', '/images/perfume_39.jpeg'],
    featured: true,
    sizes: [
      { size: '100ml Retail Bottle', price: 14500 }
    ]
  }
];

async function main() {
  console.log('Starting full database seed reset...');

  // 1. Clear existing database rows for clean alignment
  console.log('Cleaning existing product-related tables...');
  await prisma.cartItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  console.log('Tables cleared.');

  // 2. Ensure Categories exist
  console.log('Seeding categories...');
  const defaultCategories = [
    { name: 'Shop All', slug: 'shop-all' },
    { name: 'Decants', slug: 'decants' },
    { name: 'Full Bottles', slug: 'full-bottles' },
    { name: 'Sets', slug: 'sets' },
    { name: 'New Arrivals', slug: 'new-arrivals' },
    { name: 'Best Sellers', slug: 'best-sellers' },
    { name: 'Summer', slug: 'summer' },
    { name: 'Winter', slug: 'winter' },
    { name: 'For Him', slug: 'for-him' },
    { name: 'For Her', slug: 'for-her' },
    { name: 'Luxury', slug: 'luxury' }
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug }
    });
  }
  console.log('Categories verified.');

  // Fetch categories to build a mapping dictionary
  const dbCategories = await prisma.category.findMany();
  const categoryMap = {};
  dbCategories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  // 3. Seed all 13 products with matching slugs, variants, and primary categories
  console.log(`Seeding ${collectionsData.length} products...`);
  for (const p of collectionsData) {
    // Determine category mapping based on collectionsData categories
    let targetCategorySlug = 'decants';
    if (p.category === 'fullbottles' || p.category === 'full-bottles') {
      targetCategorySlug = 'full-bottles';
    } else if (p.category === 'sets') {
      targetCategorySlug = 'sets';
    }

    const categoryId = categoryMap[targetCategorySlug];
    if (!categoryId) {
      throw new Error(`Category ID not found for slug: ${targetCategorySlug}`);
    }

    // Insert Product
    const createdProduct = await prisma.product.create({
      data: {
        id: p.id, // Keep the same id as in collectionsData
        name: p.name,
        slug: p.id, // Slug is identical to the id in collectionsData (e.g. 'baccarat-rouge-540')
        brand: p.brand,
        description: p.description,
        featured: p.featured,
        isActive: true,
        categoryId: categoryId,
        images: {
          create: p.images.map((imgUrl, index) => ({
            imageUrl: imgUrl,
            altText: `${p.name} Image ${index + 1}`,
            position: index
          }))
        },
        variants: {
          create: p.sizes.map(sz => ({
            size: sz.size,
            price: sz.price,
            stock: 100,
            sku: `${p.id.toUpperCase()}-${sz.size.replace(/\s+/g, '-').toUpperCase()}`,
            isActive: true
          }))
        }
      }
    });

    console.log(`Seeded product: [${createdProduct.slug}] ${createdProduct.name}`);
  }

  // 4. Ensure default Admin user exists
  const adminClerkId = 'user_3FIrMrbA3rY3bNCzZWTjiefI6xn';
  const adminUser = await prisma.user.upsert({
    where: { clerkId: adminClerkId },
    update: { role: 'ADMIN', name: 'Armash Ansari' },
    create: {
      clerkId: adminClerkId,
      email: 'admin@decantatelier.com',
      name: 'Armash Ansari',
      role: 'ADMIN'
    }
  });
  console.log('Admin user verified:', adminUser.email);

  // 5. Ensure default StoreSetting exists
  const settingsCount = await prisma.storeSetting.count();
  if (settingsCount === 0) {
    console.log('Seeding default store settings...');
    await prisma.storeSetting.create({
      data: {
        id: 'default',
        storeName: 'Decant Atelier',
        supportEmail: 'concierge@decantatelier.com',
        supportPhone: '+91 97681 88453',
        codEnabled: true,
        shippingCharges: 100,
        freeShippingThreshold: 1999,
        razorpayKey: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.replace(/^["']|["']$/g, '').trim() : 'rzp_test_AtelierKey2026',
        razorpaySecret: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.replace(/^["']|["']$/g, '').trim() : ''
      }
    });
    console.log('Default store settings seeded.');
  }

  console.log('Full database seed completed successfully!');
}

main()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
