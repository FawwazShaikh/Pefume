import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addPerfume() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node add-perfume.js <path-to-json-template>');
    process.exit(1);
  }

  const absoluteJsonPath = path.resolve(__dirname, jsonPath);
  if (!fs.existsSync(absoluteJsonPath)) {
    console.error(`File not found: ${absoluteJsonPath}`);
    process.exit(1);
  }

  const perfumeData = JSON.parse(fs.readFileSync(absoluteJsonPath, 'utf8'));

  try {
    // 1. Insert into Database
    console.log(`Inserting ${perfumeData.name} into Database...`);
    
    // Resolve Category ID
    const categoryTarget = perfumeData.category === 'fullbottles' ? 'full-bottles' : perfumeData.category;
    const category = await prisma.category.findUnique({
      where: { slug: categoryTarget }
    });

    if (!category) {
      throw new Error(`Category ${perfumeData.category} not found in database!`);
    }

    const createdProduct = await prisma.product.upsert({
      where: { slug: perfumeData.id },
      update: {
        name: perfumeData.name,
        brand: perfumeData.brand,
        description: perfumeData.description,
        featured: perfumeData.featured || false,
        isActive: true,
      },
      create: {
        id: perfumeData.id,
        name: perfumeData.name,
        slug: perfumeData.id,
        brand: perfumeData.brand,
        description: perfumeData.description,
        featured: perfumeData.featured || false,
        isActive: true,
        categoryId: category.id,
        images: {
          create: perfumeData.images.map((imgUrl, index) => ({
            imageUrl: imgUrl,
            altText: `${perfumeData.name} Image ${index + 1}`,
            position: index
          }))
        },
        variants: {
          create: perfumeData.sizes.map(sz => ({
            size: sz.size,
            price: sz.price,
            stock: 100,
            sku: `${perfumeData.id.toUpperCase()}-${sz.size.replace(/\s+/g, '-').toUpperCase()}`,
            isActive: true
          }))
        }
      }
    });

    console.log(`Product inserted into DB successfully with ID: ${createdProduct.id}`);

    console.log('✅ New perfume addition complete.');

  } catch (error) {
    console.error('Error adding perfume:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPerfume();
