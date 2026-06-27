import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Deactivating all 2ml Decant variants in PostgreSQL...');

  const result = await prisma.productVariant.updateMany({
    where: {
      OR: [
        { size: '2ml Decant' },
        { size: { contains: '2ml', mode: 'insensitive' } }
      ]
    },
    data: {
      isActive: false
    }
  });

  console.log(`Successfully deactivated ${result.count} variants with '2ml' in their size description.`);
}

main()
  .catch(err => {
    console.error('Error deactivating 2ml variants:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
