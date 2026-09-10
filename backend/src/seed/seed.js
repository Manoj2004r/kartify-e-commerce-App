require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const SeedLock = require('../models/SeedLock');
const products = require('./products.json');

const LOCK_ID = 'kartify-seed-lock';

/**
 * Seeds demo data safely even when MULTIPLE containers start at the same
 * time. Uses a dedicated Mongoose model (SeedLock) rather than a raw
 * driver collection specifically so this operation participates in
 * Mongoose's automatic command buffering — the same mechanism that lets
 * Product/User queries "just work" even if called a moment before the
 * connection is fully established, instead of throwing immediately.
 */
async function seedIfEmpty() {
  // findOneAndUpdate with upsert is atomic at the database level: only
  // ONE caller, ever, can be the one that actually creates this document,
  // even if several containers call this in the same instant.
  const previous = await SeedLock.findOneAndUpdate(
  { _id: LOCK_ID },
  { $setOnInsert: { status: 'in-progress', startedAt: new Date() } },
  {
    upsert: true,
    includeResultMetadata: true
  }
);

  // With rawResult, `previous.lastErrorObject.updatedExisting` tells us
  // definitively whether a document already existed before this call —
  // more explicit than inferring it from a null/non-null return value.
  const alreadyExisted = previous.lastErrorObject.updatedExisting;

  if (alreadyExisted) {
    console.log('[seed] Another container already owns the seed lock — skipping');
    return;
  }

  console.log('[seed] Acquired seed lock, checking for existing data...');

  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`[seed] ${existingCount} product(s) already exist — nothing to do`);
      await SeedLock.updateOne({ _id: LOCK_ID }, { $set: { status: 'completed' } });
      return;
    }

    await Product.insertMany(products);
    console.log(`[seed] Inserted ${products.length} products`);

    const adminExists = await User.findOne({ email: 'admin@kartify.dev' });
    if (!adminExists) {
      await User.create({
        name: 'Kartify Admin',
        email: 'admin@kartify.dev',
        password: 'Admin@1234',
        role: 'admin',
      });
      console.log('[seed] Created admin user -> admin@kartify.dev / Admin@1234');
    }

    const demoExists = await User.findOne({ email: 'demo@kartify.dev' });
    if (!demoExists) {
      await User.create({
        name: 'Demo Shopper',
        email: 'demo@kartify.dev',
        password: 'Demo@1234',
        role: 'customer',
      });
      console.log('[seed] Created demo user -> demo@kartify.dev / Demo@1234');
    }

    await SeedLock.updateOne({ _id: LOCK_ID }, { $set: { status: 'completed', completedAt: new Date() } });
    console.log('[seed] Done, lock marked completed');
  } catch (err) {
    console.error('[seed] Failed partway through, releasing lock for retry:', err.message);
    await SeedLock.deleteOne({ _id: LOCK_ID });
    throw err;
  }
}

async function runStandalone() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kartify');
  console.log('[seed] Connected to MongoDB');
  await seedIfEmpty();
  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  runStandalone().catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
}

module.exports = { seedIfEmpty };
