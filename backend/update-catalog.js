import { prisma } from './lib/prisma.js';

async function updateCatalog() {
  const bestSellers = [
    'jpg-le-beau-paradise-garden',
    'tom-ford-ombre-leather-edp',
    'bleu-de-chanel-edp',
    'azzaro-the-most-wanted'
  ];

  try {
    // 1. Reset all products featured status
    await prisma.product.updateMany({
      data: { featured: false, featuredOrder: 0 }
    });

    // 2. Set featured = true for the chosen best sellers
    for (let i = 0; i < bestSellers.length; i++) {
      const slug = bestSellers[i];
      await prisma.product.updateMany({
        where: { slug },
        data: { featured: true, featuredOrder: i + 1 }
      });
    }

    // 3. Archive Valentino EDT
    await prisma.product.updateMany({
      where: { slug: 'valentino-uomo-born-in-roma-coral-fantasy' },
      data: { isActive: false }
    });

    console.log('Catalog updated successfully!');
  } catch (error) {
    console.error('Error updating catalog:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCatalog();
