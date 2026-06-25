import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global;

function getPrismaInstance() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || getPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Validates connectivity and verifies that all 13 required PostgreSQL tables exist.
 * Terminates the server process if any table check fails.
 */
export async function verifyDatabaseSchema() {
  const tables = [
    { name: 'User', query: () => prisma.user.findFirst() },
    { name: 'Address', query: () => prisma.address.findFirst() },
    { name: 'Category', query: () => prisma.category.findFirst() },
    { name: 'Product', query: () => prisma.product.findFirst() },
    { name: 'ProductVariant', query: () => prisma.productVariant.findFirst() },
    { name: 'CartItem', query: () => prisma.cartItem.findFirst() },
    { name: 'Order', query: () => prisma.order.findFirst() },
    { name: 'OrderItem', query: () => prisma.orderItem.findFirst() },
    { name: 'Payment', query: () => prisma.payment.findFirst() },
    { name: 'Review', query: () => prisma.review.findFirst() },
    { name: 'InventoryLog', query: () => prisma.inventoryLog.findFirst() },
    { name: 'StoreSetting', query: () => prisma.storeSetting.findFirst() },
    { name: 'Campaign', query: () => prisma.campaign.findFirst() }
  ];

  console.log('\n====== DB CONNECTIVITY & SCHEMA STARTUP CHECK ======');
  try {
    // First confirm basic pg handshake
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection established successfully via TCP.');
  } catch (err) {
    console.error('❌ Failed to establish connection to PostgreSQL database:');
    console.error(err);
    console.error('====================================================\n');
    process.exit(1);
  }

  for (const table of tables) {
    try {
      await table.query();
      console.log(`✓ Table "${table.name}" exists and is queryable.`);
    } catch (err) {
      console.error(`❌ Table "${table.name}" schema check FAILED! Table might be missing or out of sync.`);
      console.error(err);
      console.error('====================================================\n');
      process.exit(1);
    }
  }
  console.log('====== DB CONNECTIVITY & SCHEMA CHECK PASSED ======\n');
}

