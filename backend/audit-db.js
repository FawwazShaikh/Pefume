import { prisma } from './lib/prisma.js';

async function audit() {
  console.log('\n========== DATABASE AUDIT ==========\n');

  // 1. Categories
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  console.log(`Categories (${categories.length}):`);
  for (const c of categories) {
    const prodCount = await prisma.product.count({ where: { categoryId: c.id, isActive: true } });
    console.log(`  [${c.slug}] ${c.name} → ${prodCount} active products`);
  }

  // 2. Products with variants
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      images: true,
      category: true
    }
  });
  console.log(`\nProducts (${products.length} active):`);
  for (const p of products) {
    const variantInfo = p.variants.map(v => `${v.size}(₹${v.price}, stock:${v.stock}, sku:${v.sku})`).join(', ');
    console.log(`  [${p.slug}] ${p.name} (${p.brand}) → Category: ${p.category?.slug || 'NONE'}`);
    console.log(`    Images: ${p.images.length}, Variants: ${p.variants.length} → ${variantInfo || 'NO VARIANTS!'}`);
    
    // Check issues
    if (p.variants.length === 0) console.log(`    ⚠ CRITICAL: No active variants!`);
    if (p.images.length === 0) console.log(`    ⚠ CRITICAL: No images!`);
    if (!p.category) console.log(`    ⚠ WARNING: No category assigned!`);
    if (!p.description) console.log(`    ⚠ WARNING: No description!`);
  }

  // 3. Variants without products
  const orphanVariants = await prisma.productVariant.findMany({
    where: { product: { isActive: false } }
  });
  console.log(`\nOrphan variants (product inactive): ${orphanVariants.length}`);

  // 4. CollectionData mapping check
  const collectionSlugs = [
    'baccarat-rouge-540', 'azzaro-the-most-wanted', 'spicebomb-extreme',
    'lattafa-yara', 'lattafa-khamrah', 'valentino-born-in-roma',
    'valentino-born-in-roma-set', 'rasasi-hawas', 'afnan-9pm',
    'afnan-9am', 'afnan-supremacy', 'afnan-supremacy-collector', 'bleu-de-chanel'
  ];
  console.log(`\nCollectionData slug mapping check:`);
  for (const slug of collectionSlugs) {
    const found = await prisma.product.findFirst({ where: { slug } });
    console.log(`  ${slug} → ${found ? `FOUND (id: ${found.id})` : 'MISSING IN DATABASE'}`);
  }

  // 5. StoreSetting
  const settings = await prisma.storeSetting.findUnique({ where: { id: 'default' } });
  console.log(`\nStoreSetting: ${settings ? 'EXISTS' : 'MISSING'}`);

  // 6. Users
  const userCount = await prisma.user.count();
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  console.log(`Users: ${userCount} total, ${adminCount} admins`);

  // 7. Cart items
  const cartCount = await prisma.cartItem.count();
  console.log(`Cart items in DB: ${cartCount}`);

  console.log('\n========== AUDIT COMPLETE ==========\n');
}

audit()
  .catch(err => console.error('Audit failed:', err))
  .finally(() => prisma.$disconnect());
