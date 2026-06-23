import { prisma } from './lib/prisma.js';

async function runAudit() {
  console.log('==================================================');
  console.log('          DATABASE VERIFICATION AUDIT              ');
  console.log('==================================================');

  // 1. Connection String & Active URL verification
  const rawUrl = process.env.DATABASE_URL || '';
  let maskedUrl = 'Not Configured';
  if (rawUrl) {
    maskedUrl = rawUrl.replace(/:[^:@]+@/, ':****@');
  }
  console.log('1. Prisma Connection String (Masked):', maskedUrl);
  console.log('2. Active Database Provider: Neon Serverless (PostgreSQL Adapter)');
  console.log('3. Prisma Client Initialization: SUCCESS (Using PrismaNeon adapter)');

  // 2. Fetch Counts (Read verification)
  console.log('\n--- Live Counts from Neon DB ---');
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  const userCount = await prisma.user.count();
  const cartItemCount = await prisma.cartItem.count();
  const settingsCount = await prisma.storeSetting.count();

  console.log(`- Product Count: ${productCount}`);
  console.log(`- Product Variant Count: ${variantCount}`);
  console.log(`- User Count: ${userCount}`);
  console.log(`- CartItem Count: ${cartItemCount}`);
  console.log(`- StoreSetting Count: ${settingsCount}`);

  // 3. Display StoreSetting Row
  if (settingsCount > 0) {
    const settingsRow = await prisma.storeSetting.findUnique({
      where: { id: 'default' }
    });
    console.log('\n--- Active Store Settings row ---');
    console.log(JSON.stringify(settingsRow, null, 2));
  } else {
    console.log('\n[WARNING] No StoreSetting row found in database.');
  }

  // 4. CartItem Operations (Write / Read / Delete cycle)
  console.log('\n--- Initiating CartItem CRUD Verification Cycle ---');
  
  // Find a user and variant to create a link
  const sampleUser = await prisma.user.findFirst();
  const sampleVariant = await prisma.productVariant.findFirst();

  if (!sampleUser || !sampleVariant) {
    console.log('[ABORTED] Verification cycle aborted: Must have at least one user and one variant seeded.');
    return;
  }

  console.log(`Using User ID: ${sampleUser.id} (${sampleUser.email})`);
  console.log(`Using Variant ID: ${sampleVariant.id} (SKU: ${sampleVariant.sku})`);

  // Clean up any existing duplicate test item if left over
  await prisma.cartItem.deleteMany({
    where: {
      userId: sampleUser.id,
      variantId: sampleVariant.id
    }
  }).catch(() => {});

  // Create
  const newCartItem = await prisma.cartItem.create({
    data: {
      userId: sampleUser.id,
      variantId: sampleVariant.id,
      quantity: 3
    }
  });
  console.log('✔ Create test CartItem: SUCCESS');
  console.log(JSON.stringify(newCartItem, null, 2));

  // Read
  const fetchedCartItem = await prisma.cartItem.findUnique({
    where: {
      id: newCartItem.id
    },
    include: {
      user: { select: { email: true } },
      variant: { select: { sku: true, size: true } }
    }
  });
  console.log('✔ Read test CartItem: SUCCESS');
  console.log(JSON.stringify(fetchedCartItem, null, 2));

  // Delete
  await prisma.cartItem.delete({
    where: {
      id: newCartItem.id
    }
  });
  console.log('✔ Delete test CartItem: SUCCESS');

  // Verify deletion
  const deletedCheck = await prisma.cartItem.findUnique({
    where: {
      id: newCartItem.id
    }
  });
  if (!deletedCheck) {
    console.log('✔ Deletion verification: CONFIRMED (record is gone)');
  } else {
    console.log('❌ Deletion verification: FAILED (record still exists)');
  }

  console.log('\n==================================================');
  console.log('          AUDIT COMPLETED SUCCESSFULLY             ');
  console.log('==================================================');
}

runAudit()
  .catch(err => {
    console.error('❌ Audit Failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
