import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const BOTTLE_CATALOG_DATA = [
  {
    sku: 'BTL-CM-BLK',
    name: 'Classic Mini Spray',
    finish: 'Matte Black',
    category: 'CLASSIC_MINI',
    imageKey: 'classic_mini_black',
    priceAdjustment: 0,
    badge: 'Included',
    sortOrder: 10,
    isActive: true,
    isDefault: true,
    stock: 150,
    lowStockThreshold: 15,
    trackInventory: true,
    sizes: ['5ml', '10ml']
  },
  {
    sku: 'BTL-CM-GLD',
    name: 'Classic Mini Spray',
    finish: 'Metallic Gold',
    category: 'CLASSIC_MINI',
    imageKey: 'classic_mini_gold',
    priceAdjustment: 0,
    badge: 'Included',
    sortOrder: 20,
    isActive: true,
    isDefault: false,
    stock: 120,
    lowStockThreshold: 15,
    trackInventory: true,
    sizes: ['5ml', '10ml']
  },
  {
    sku: 'BTL-MA-BLK',
    name: 'Classic Metal Atomizer',
    finish: 'Matte Black',
    category: 'CLASSIC_METAL',
    imageKey: 'metal_atomizer_black',
    priceAdjustment: 0,
    badge: 'Included',
    sortOrder: 30,
    isActive: true,
    isDefault: true,
    stock: 100,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['10ml', '20ml']
  },
  {
    sku: 'BTL-MA-GLD',
    name: 'Classic Metal Atomizer',
    finish: 'Metallic Gold',
    category: 'CLASSIC_METAL',
    imageKey: 'metal_atomizer_gold',
    priceAdjustment: 0,
    badge: 'Included',
    sortOrder: 40,
    isActive: true,
    isDefault: false,
    stock: 90,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['10ml', '20ml']
  },
  {
    sku: 'BTL-PMA-STL',
    name: 'Premium Classic Metal Atomizer',
    finish: 'Brushed Steel',
    category: 'PREMIUM',
    imageKey: 'premium_metal_atomizer',
    priceAdjustment: 55,
    badge: 'Premium',
    sortOrder: 50,
    isActive: true,
    isDefault: false,
    stock: 75,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['10ml', '20ml', '30ml']
  },
  {
    sku: 'BTL-TS-BLK',
    name: 'Travel Safe Atomizer',
    finish: 'Midnight Black',
    category: 'TRAVEL_SAFE',
    imageKey: 'travel_safe_black',
    priceAdjustment: 199,
    badge: 'Upgrade',
    sortOrder: 60,
    isActive: true,
    isDefault: false,
    stock: 60,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['5ml', '10ml', '20ml', '30ml']
  },
  {
    sku: 'BTL-TS-SLV',
    name: 'Travel Safe Atomizer',
    finish: 'Gunmetal Silver',
    category: 'TRAVEL_SAFE',
    imageKey: 'travel_safe_silver',
    priceAdjustment: 199,
    badge: 'Upgrade',
    sortOrder: 70,
    isActive: true,
    isDefault: false,
    stock: 80,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['5ml', '10ml', '20ml', '30ml']
  },
  {
    sku: 'BTL-TS-RSG',
    name: 'Travel Safe Atomizer',
    finish: 'Rose Gold',
    category: 'TRAVEL_SAFE',
    imageKey: 'travel_safe_rose_gold',
    priceAdjustment: 199,
    badge: 'Upgrade',
    sortOrder: 80,
    isActive: true,
    isDefault: false,
    stock: 50,
    lowStockThreshold: 10,
    trackInventory: true,
    sizes: ['5ml', '10ml', '20ml', '30ml']
  },
  {
    sku: 'BTL-TS-CRM',
    name: 'Travel Safe Atomizer',
    finish: 'Crimson Red',
    category: 'TRAVEL_SAFE',
    imageKey: 'travel_safe_crimson',
    priceAdjustment: 199,
    badge: 'Limited Edition',
    sortOrder: 90,
    isActive: true,
    isDefault: false,
    stock: 45,
    lowStockThreshold: 5,
    trackInventory: true,
    sizes: ['5ml', '10ml', '20ml', '30ml']
  },
  {
    sku: 'BTL-TS-MAG',
    name: 'Travel Safe Atomizer',
    finish: 'Magenta Velvet',
    category: 'TRAVEL_SAFE',
    imageKey: 'travel_safe_magenta',
    priceAdjustment: 199,
    badge: 'Limited Edition',
    sortOrder: 100,
    isActive: true,
    isDefault: false,
    stock: 40,
    lowStockThreshold: 5,
    trackInventory: true,
    sizes: ['5ml', '10ml', '20ml', '30ml']
  }
];

async function seedBottleCatalog() {
  console.log('Seeding Central Bottle Catalog...');
  for (const item of BOTTLE_CATALOG_DATA) {
    const { sizes, ...bottleData } = item;
    
    // Upsert BottleCatalog
    const bottle = await prisma.bottleCatalog.upsert({
      where: { sku: bottleData.sku },
      update: bottleData,
      create: bottleData
    });

    console.log(`Saved Bottle: ${bottle.name} (${bottle.finish}) - SKU: ${bottle.sku}`);

    // Update size availabilities
    const availableSizes = ['5ml', '10ml', '20ml', '30ml'];
    for (const size of availableSizes) {
      const isEnabled = sizes.includes(size);
      await prisma.bottleSizeAvailability.upsert({
        where: {
          bottleId_size: {
            bottleId: bottle.id,
            size: size
          }
        },
        update: { enabled: isEnabled },
        create: {
          bottleId: bottle.id,
          size: size,
          enabled: isEnabled
        }
      });
    }
  }

  console.log('\nCentral Bottle Catalog seeding complete!');
}

seedBottleCatalog()
  .catch(err => {
    console.error('Error seeding bottle catalog:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
