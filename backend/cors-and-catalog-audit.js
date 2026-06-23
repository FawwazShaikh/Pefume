import { prisma } from './lib/prisma.js';

async function runAudit() {
  console.log('==================================================');
  console.log('      DIAGNOSTICS: CATALOG & API & CORS           ');
  console.log('==================================================');

  // 1. Database Counts
  console.log('\n[1] Database Records Count:');
  const dbProductsCount = await prisma.product.count();
  const dbVariantsCount = await prisma.productVariant.count();
  const dbCategoriesCount = await prisma.category.count();
  const dbSettingsCount = await prisma.storeSetting.count();
  
  console.log(`- Database Products: ${dbProductsCount}`);
  console.log(`- Database Variants: ${dbVariantsCount}`);
  console.log(`- Database Categories: ${dbCategoriesCount}`);
  console.log(`- Database Settings: ${dbSettingsCount}`);

  // List categories in database
  const categories = await prisma.category.findMany();
  console.log('\nDatabase Category Details:');
  categories.forEach(c => console.log(`  * Name: "${c.name}", Slug: "${c.slug}", ID: "${c.id}"`));

  // Dump products in database
  const productsList = await prisma.product.findMany({
    include: {
      category: true,
      variants: true
    }
  });
  console.log('\nDatabase Product Details:');
  productsList.forEach(p => {
    console.log(`  * Name: "${p.name}"`);
    console.log(`    Slug: "${p.slug}"`);
    console.log(`    CategoryId: "${p.categoryId}" (${p.category ? p.category.name : 'null'})`);
    console.log(`    Variants Count: ${p.variants.length}`);
    console.log(`    Variants: ${p.variants.map(v => `${v.size}: ₹${v.price} (Qty: ${v.stock})`).join(', ')}`);
  });

  // 2. Fetch API Endpoints
  console.log('\n[2] API Endpoints Verification:');
  
  const endpoints = [
    { name: 'GET /api/products', url: 'http://localhost:5000/api/products' },
    { name: 'GET /api/categories', url: 'http://localhost:5000/api/categories' },
    { name: 'GET /api/settings', url: 'http://localhost:5000/api/settings' },
    { name: 'GET /api/cart (unauthorized expected)', url: 'http://localhost:5000/api/cart' },
    { name: 'GET /api/user/profile (unauthorized expected)', url: 'http://localhost:5000/api/user/profile' },
  ];

  let apiProducts = [];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'GET',
        headers: { 'Origin': 'http://localhost:5174' } // Simulate CORS header
      });
      console.log(`\nEndpoint: ${ep.name}`);
      console.log(`- Status: ${res.status} ${res.statusText}`);
      console.log(`- Access-Control-Allow-Origin: ${res.headers.get('access-control-allow-origin')}`);
      console.log(`- Access-Control-Allow-Credentials: ${res.headers.get('access-control-allow-credentials')}`);
      
      const payload = await res.json().catch(() => null);
      if (payload) {
        if (Array.isArray(payload)) {
          console.log(`- Payload: Array of ${payload.length} items`);
          if (ep.name.includes('/products')) {
            apiProducts = payload;
          }
        } else {
          console.log(`- Payload Keys: ${Object.keys(payload).join(', ')}`);
        }
      } else {
        console.log(`- Payload: null or non-JSON`);
      }
    } catch (err) {
      console.error(`- Fetch failed: ${err.message}`);
    }
  }

  // 3. React Simulation - Filtering
  console.log('\n[3] React Filtering Simulation:');
  console.log(`- Loaded Products Count: ${apiProducts.length}`);
  
  // Let's test the filters that standard categories map to
  const filters = [
    { category: 'all', type: 'all' },
    { category: 'decants', type: 'category' },
    { category: 'full-bottles', type: 'category' },
    { category: 'sets', type: 'category' },
    { category: 'summer', type: 'tag' },
    { category: 'winter', type: 'tag' },
    { category: 'him', type: 'tag' },
    { category: 'her', type: 'tag' },
    { category: 'new-arrival', type: 'tag' },
    { category: 'featured', type: 'tag' }
  ];

  for (const filter of filters) {
    let filtered = [...apiProducts];
    if (filter.category !== 'all') {
      if (filter.type === 'category') {
        const matchedCat = categories.find(c => c.slug === filter.category);
        if (matchedCat) {
          filtered = filtered.filter(item => item.categoryId === matchedCat.id);
        } else {
          filtered = filtered.filter(item => item.category === filter.category);
        }
      } else {
        // Tag-based
        const tagToSearch = filter.category;
        filtered = filtered.filter(item => {
          if (item.tags && item.tags.includes(tagToSearch)) return true;
          if (tagToSearch === 'new-arrival' && item.featured) return true;
          if (tagToSearch === 'featured' && item.featured) return true;
          return false;
        });
      }
    }
    console.log(`- Filter "${filter.category}" (Type: ${filter.type}): Before=${apiProducts.length}, After=${filtered.length}`);
  }

  console.log('==================================================');
}

runAudit()
  .catch(err => {
    console.error('Audit script failed:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
