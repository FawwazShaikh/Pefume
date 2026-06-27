import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const REMOVED_SLUGS = [
  'baccarat-rouge-540',
  'spicebomb-extreme',
  'valentino-born-in-roma',
  'valentino-born-in-roma-set',
  'afnan-9am',
  'afnan-supremacy',
  'azzaro-the-most-wanted-edp-intense'
];

async function main() {
  console.log('Starting DB Catalog Cleanup & Update...');

  // 1. Mark the 7 removed products as inactive
  const updateResult = await prisma.product.updateMany({
    where: {
      slug: { in: REMOVED_SLUGS }
    },
    data: {
      isActive: false
    }
  });
  console.log(`Updated ${updateResult.count} removed products to isActive = false.`);

  // 2. Ensure Ahmed Al Maghribi Rose Noir For Women exists in the DB
  const slug = 'ahmed-al-maghribi-rose-noir';
  const existingProduct = await prisma.product.findUnique({
    where: { slug }
  });

  if (!existingProduct) {
    console.log('Seeding new product: Ahmed Al Maghribi Rose Noir...');
    
    // Find category ID for 'decants'
    const category = await prisma.category.findUnique({
      where: { slug: 'decants' }
    });

    if (!category) {
      throw new Error('Category "decants" not found in database.');
    }

    const createdProduct = await prisma.product.create({
      data: {
        id: slug,
        name: 'Rose Noir For Women',
        slug,
        brand: 'Ahmed Al Maghribi',
        description: 'Rose Noir by Ahmed Al Maghribi is a captivating floral woody musk fragrance that opens with zesty citrus and fresh marine notes before introducing a luxurious heart of romantic rose, jasmine, and warm spicy accords. The base features smooth sandalwood, rich amber, and sensual musk, leaving a powerful and highly attractive trail. Perfect for any woman who wants to stand out with an aura of elegance and opulence.',
        featured: false,
        isActive: true,
        categoryId: category.id,
        images: {
          create: [
            {
              imageUrl: '/decant_images/perfume_placeholder.jpeg',
              altText: 'Rose Noir For Women Image 1',
              position: 0
            }
          ]
        },
        variants: {
          create: [
            {
              size: '5ml Decant',
              price: 349,
              stock: 100,
              sku: 'ROSE-NOIR-5ML',
              isActive: true
            },
            {
              size: '10ml Decant',
              price: 699,
              stock: 100,
              sku: 'ROSE-NOIR-10ML',
              isActive: true
            },
            {
              size: '20ml Decant',
              price: 1399,
              stock: 100,
              sku: 'ROSE-NOIR-20ML',
              isActive: true
            },
            {
              size: '30ml Decant',
              price: 2099,
              stock: 100,
              sku: 'ROSE-NOIR-30ML',
              isActive: true
            }
          ]
        }
      }
    });
    console.log(`Successfully created new product: [${createdProduct.slug}] ${createdProduct.name}`);
  } else {
    // If it already exists, ensure it is active
    await prisma.product.update({
      where: { slug },
      data: { isActive: true }
    });
    console.log('Ahmed Al Maghribi Rose Noir already exists and is active.');
  }

  console.log('DB Catalog Cleanup & Update completed successfully.');
}

main()
  .catch(err => {
    console.error('Database updates failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
