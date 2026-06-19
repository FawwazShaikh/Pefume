import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Webhook } from 'svix';
import { prisma } from './lib/prisma.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite client (port 5173 by default)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Webhook endpoint uses raw body parser for svix signature verification
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || 'whsec_placeholder';
  const payload = req.body.toString();
  const headers = req.headers;

  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const eventType = evt.type;
  console.log(`Received Clerk webhook event: ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || null;
    const phone = phone_numbers?.[0]?.phone_number || null;

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: { email, name, phone },
        create: {
          clerkId: id,
          email,
          name,
          phone,
          role: 'USER',
        },
      });
      console.log(`User synced to database: ${id}`);
    } catch (err) {
      console.error('Error saving user to DB:', err);
      return res.status(500).json({ error: 'Database write error' });
    }
  }

  return res.status(200).json({ success: true });
});

// For all other routes, parse JSON body
app.use(express.json());

// Set up Clerk Node SDK auth middleware
app.use(ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY
}));

// Middleware to enforce authentication
const requireAuth = (req, res, next) => {
  // Support local mock auth header for local testing/verification
  if (req.headers['x-mock-user-id']) {
    req.auth = { userId: req.headers['x-mock-user-id'] };
    return next();
  }
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  next();
};

// Helper: Get or create DB User from Clerk Auth ID (robust fallback if webhook is pending)
async function getOrCreateDbUser(clerkId) {
  let user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) {
    // Basic fallback user creation
    user = await prisma.user.create({
      data: {
        clerkId: clerkId,
        email: `${clerkId}@clerk.local`, // Fallback email
        role: 'USER'
      }
    });
  }
  return user;
}

// ============================================================
// ADDRESS MANAGEMENT ROUTES
// ============================================================

// GET user addresses
app.get('/api/addresses', requireAuth, async (req, res) => {
  try {
    const dbUser = await getOrCreateDbUser(req.auth.userId);
    const addresses = await prisma.address.findMany({
      where: { userId: dbUser.id },
      orderBy: { isDefault: 'desc' }
    });
    return res.status(200).json(addresses);
  } catch (err) {
    console.error('Failed to fetch addresses:', err);
    return res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST save address
app.post('/api/addresses', requireAuth, async (req, res) => {
  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, isDefault } = req.body;

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return res.status(400).json({ error: 'Missing required address fields' });
  }

  try {
    const dbUser = await getOrCreateDbUser(req.auth.userId);

    // If setting as default, clear previous default flag for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: dbUser.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: dbUser.id,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        isDefault: !!isDefault
      }
    });

    return res.status(201).json(newAddress);
  } catch (err) {
    console.error('Failed to create address:', err);
    return res.status(500).json({ error: 'Failed to save address' });
  }
});

// ============================================================
// ORDER MANAGEMENT ROUTES
// ============================================================

// GET user orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const dbUser = await getOrCreateDbUser(req.auth.userId);
    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        orderItems: true
      }
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST place order
app.post('/api/orders', requireAuth, async (req, res) => {
  const { addressId, items, paymentMethod, notes } = req.body;

  if (!addressId || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  try {
    const dbUser = await getOrCreateDbUser(req.auth.userId);

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: dbUser.id }
    });
    if (!address) {
      return res.status(404).json({ error: 'Shipping address not found' });
    }

    // Calculate subtotal and total
    let subtotal = 0;
    for (const item of items) {
      const price = parseFloat(item.price);
      const qty = parseInt(item.quantity) || 1;
      subtotal += price * qty;
    }

    const shippingFee = 0; // Free shipping
    const total = subtotal + shippingFee;

    // Place order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: dbUser.id,
          addressId: addressId,
          subtotal,
          shippingFee,
          total,
          paymentMethod,
          status: 'PENDING',
          notes,
          orderItems: {
            create: items.map(item => ({
              productId: item.productId || item.id, // Support different object formats
              variantId: item.variantId || 'default-variant', // Fallback identifier
              productName: item.name,
              size: item.size || '2ml Decant',
              priceAtPurchase: parseFloat(item.price),
              quantity: parseInt(item.quantity) || 1
            }))
          }
        },
        include: {
          orderItems: true
        }
      });

      // 2. Initialize Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: paymentMethod,
          amount: total,
          status: 'PENDING'
        }
      });

      return newOrder;
    });

    console.log(`Order placed successfully: ${order.id}`);
    return res.status(201).json(order);
  } catch (err) {
    console.error('Failed to place order:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

// Default root status route
app.get('/api/status', (req, res) => {
  return res.json({ status: 'healthy', database: 'connected' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express API server running on http://localhost:${PORT}`);
});
