import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Updating Ahmed Al Maghribi Rose Noir product image in database...');
  
  const product = await prisma.product.findUnique({
    where: { slug: 'ahmed-al-maghribi-rose-noir' },
    include: { images: true }
  });

  if (product) {
    // Delete existing product images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });

    // Create the new correct product images
    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          imageUrl: '/decant_images/rose_noir_1.png',
          altText: 'Rose Noir For Women Image 1',
          position: 0
        },
        {
          productId: product.id,
          imageUrl: '/decant_images/rose_noir_2.jpg',
          altText: 'Rose Noir For Women Image 2',
          position: 1
        },
        {
          productId: product.id,
          imageUrl: '/decant_images/rose_noir_3.png',
          altText: 'Rose Noir For Women Image 3',
          position: 2
        },
        {
          productId: product.id,
          imageUrl: '/decant_images/rose_noir_4.jpg',
          altText: 'Rose Noir For Women Image 4',
          position: 3
        }
      ]
    });

    console.log('Successfully updated product image in DB!');
  } else {
    console.log('Rose Noir product not found in database. Please run seed/cleanup script first.');
  }
}

main()
  .catch(err => {
    console.error('Error updating image in DB:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
