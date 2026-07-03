import { prisma } from './lib/prisma.js';

async function runStabilization() {
  console.log('==================================================');
  console.log('       DECANT ATELIER DATABASE STABILIZATION      ');
  console.log('==================================================');

  // --- 1. REVIEWS SANITIZATION ---
  console.log('\nScanning reviews...');
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
      product: true
    }
  });

  const reviewsToDelete = [];
  const reviewsToPreserve = [];

  for (const review of reviews) {
    const email = (review.user?.email || '').toLowerCase();
    const comment = (review.comment || '').toLowerCase();
    const title = (review.title || '').toLowerCase();
    
    // Deem as test review if it has test email patterns or placeholder/test review text
    const isTestEmail = email.includes('test') || email.includes('example.com') || email.includes('mock');
    const isTestContent = comment.includes('test') || comment.includes('placeholder') || comment.includes('dummy') ||
                          title.includes('test') || title.includes('placeholder') || title.includes('dummy') ||
                          comment === 'great' || comment === 'nice';

    if (isTestEmail || isTestContent) {
      reviewsToDelete.push(review);
    } else {
      reviewsToPreserve.push(review);
    }
  }

  console.log(`Found ${reviews.length} total reviews.`);
  console.log(`- Preserving ${reviewsToPreserve.length} genuine reviews.`);
  console.log(`- Deleting ${reviewsToDelete.length} development/test reviews.`);

  for (const r of reviewsToDelete) {
    console.log(`  Deleting review by ${r.user?.email}: "${r.comment}"`);
    await prisma.review.delete({ where: { id: r.id } });
  }

  // --- 2. INACTIVE PRODUCTS PURGE ---
  console.log('\nScanning inactive products...');
  const inactiveProducts = await prisma.product.findMany({
    where: { isActive: false }
  });
  console.log(`Found ${inactiveProducts.length} inactive products to delete.`);
  for (const p of inactiveProducts) {
    console.log(`  Deleting inactive product: ${p.name} (Slug: ${p.slug})`);
    // Cascade delete will clean up variants, images, and bottles automatically
    await prisma.product.delete({ where: { id: p.id } });
  }

  // --- 3. 2ML VARIANTS PURGE ---
  console.log('\nScanning for 2ml variants...');
  const twoMlVariants = await prisma.productVariant.findMany({
    where: {
      OR: [
        { size: { contains: '2ml', mode: 'insensitive' } },
        { size: { contains: '2 ml', mode: 'insensitive' } }
      ]
    }
  });
  console.log(`Found ${twoMlVariants.length} "2ml" variants to delete.`);
  for (const v of twoMlVariants) {
    console.log(`  Deleting 2ml variant (SKU: ${v.sku})`);
    await prisma.productVariant.delete({ where: { id: v.id } });
  }

  // --- 4. PURGE DEVELOPMENT/TEST ORDERS & OTHER TRASH ---
  // Since we are clearing test orders and test payments for launch, we purge all Orders.
  console.log('\nPurging development orders & payments...');
  // All current orders are test data before launch. We verify count first.
  const ordersCount = await prisma.order.count();
  console.log(`Found ${ordersCount} test orders to clear.`);
  if (ordersCount > 0) {
    // Delete payments first (cascade is configured, but manual delete is safe)
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    console.log('✓ Successfully purged all development/test orders and payments.');
  }

  // Clear all cart items to start clean
  console.log('\nClearing active carts...');
  await prisma.cartItem.deleteMany({});
  console.log('✓ Carts cleared.');

  // --- 5. INVENTORY LOGS & MOVEMENTS CLEANUP ---
  console.log('\nCleaning up development inventory logs & movements...');
  // We delete logs & movements linked to test data or deleted variants.
  // Genuine data (if any) or launch baseline records are kept.
  // We can delete all inventory logs and movements at this point since all previous activity was testing/dev.
  await prisma.inventoryLog.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  console.log('✓ Purged all testing logs & movements.');

  // --- 6. LAUNCH INVENTORY RESET ---
  console.log('\nExecuting Launch Inventory Reset...');
  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true }
  });

  console.log(`Found ${activeProducts.length} active products to reset.`);

  for (const product of activeProducts) {
    console.log(`Processing product: ${product.name}`);
    
    // Purge any existing bottles to avoid duplicates or multiple open bottles
    await prisma.bottleInventory.deleteMany({
      where: { productId: product.id }
    });

    // Create exactly one fresh open 100ml bottle
    const newBottle = await prisma.bottleInventory.create({
      data: {
        productId: product.id,
        bottleLabel: 'Bottle #001',
        bottleSizeML: 100,
        remainingML: 100,
        lowStockThresholdML: 20,
        status: 'OPEN',
        notes: 'Initial Launch Inventory Bottle'
      }
    });

    // Create baseline Restock movement for this bottle
    await prisma.inventoryMovement.create({
      data: {
        bottleId: newBottle.id,
        type: 'RESTOCK',
        quantityML: 100,
        note: 'Launch Inventory Reset'
      }
    });

    // For each variant, ensure volumeML is valid and recompute stock cache
    for (const variant of product.variants) {
      let vol = variant.volumeML;
      
      // Fallback/correct volume if needed
      if (!vol || vol <= 0) {
        const sizeStr = variant.size.toLowerCase();
        if (sizeStr.includes('5ml')) vol = 5;
        else if (sizeStr.includes('10ml')) vol = 10;
        else if (sizeStr.includes('20ml')) vol = 20;
        else if (sizeStr.includes('30ml')) vol = 30;
        else if (sizeStr.includes('100ml') || sizeStr.includes('retail')) vol = 100;
        else vol = 5; // Default safety fallback
      }

      // Compute dynamic stock: stock = Math.floor(remainingML / volumeML)
      const calculatedStock = Math.floor(newBottle.remainingML / vol);

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          volumeML: vol,
          stock: calculatedStock
        }
      });
      console.log(`  -> Size "${variant.size}": Volume = ${vol}ml, Stock = ${calculatedStock} (computed)`);
    }
  }

  // --- 7. QUALITY ASSURANCE & CONSTRAINTS VALIDATION ---
  console.log('\n==================================================');
  console.log('          LAUNCH QUALITY ASSURANCE AUDIT          ');
  console.log('==================================================');

  let hasErrors = false;

  // A. Slug Uniqueness
  const allProducts = await prisma.product.findMany({});
  const slugs = allProducts.map(p => p.slug);
  const uniqueSlugs = new Set(slugs);
  if (slugs.length !== uniqueSlugs.size) {
    console.error('❌ QA ERROR: Duplicate product slugs found!');
    hasErrors = true;
  } else {
    console.log('✓ QA Success: All product slugs are unique.');
  }

  // B. Product associations (Category, Images, Variants)
  for (const product of allProducts) {
    const detail = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
        variants: true,
        category: true
      }
    });

    if (!detail.categoryId || !detail.category) {
      console.error(`❌ QA ERROR: Product "${detail.name}" (ID: ${detail.id}) has no Category assignment.`);
      hasErrors = true;
    }
    if (detail.images.length === 0) {
      console.error(`❌ QA ERROR: Product "${detail.name}" (ID: ${detail.id}) has NO images.`);
      hasErrors = true;
    } else {
      // Check images
      const firstImg = detail.images.find(img => img.position === 0);
      if (!firstImg) {
        console.warn(`[WARNING] Product "${detail.name}" (ID: ${detail.id}) is missing a hero image at position 0.`);
      }
      
      detail.images.forEach(img => {
        if (!img.imageUrl || (!img.imageUrl.startsWith('http') && !img.imageUrl.startsWith('/'))) {
          console.error(`❌ QA ERROR: Product "${detail.name}" has invalid image URL: "${img.imageUrl}"`);
          hasErrors = true;
        }
        if (img.imageUrl.includes('placeholder') || img.imageUrl.includes('dummy')) {
          console.warn(`[WARNING] Product "${detail.name}" contains placeholder image URL: "${img.imageUrl}"`);
        }
      });
    }

    const activeVariants = detail.variants.filter(v => v.isActive);
    if (activeVariants.length === 0) {
      console.error(`❌ QA ERROR: Product "${detail.name}" (ID: ${detail.id}) has NO active variants.`);
      hasErrors = true;
    }
  }

  // C. Inventory ranges validation
  const allBottles = await prisma.bottleInventory.findMany({});
  for (const bottle of allBottles) {
    if (bottle.remainingML < 0 || bottle.remainingML > bottle.bottleSizeML) {
      console.error(`❌ QA ERROR: Bottle "${bottle.bottleLabel}" for Product ID ${bottle.productId} has invalid remaining level: ${bottle.remainingML}ml (Size: ${bottle.bottleSizeML}ml)`);
      hasErrors = true;
    }
  }
  console.log(`✓ QA Success: Validated range bounds for ${allBottles.length} active inventory bottles.`);

  if (hasErrors) {
    console.error('\n❌ STABILIZATION COMPLETED WITH QA ERRORS. Please check log details above.');
    process.exit(1);
  } else {
    console.log('\n==================================================');
    console.log('     ✓ DATABASE STABILIZATION COMPLETED: SUCCESS  ');
    console.log('==================================================');
  }
}

runStabilization()
  .catch(err => {
    console.error('❌ Stabilization Failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
