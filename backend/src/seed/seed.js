require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const products = require('./products.json');

/**
 * Seeds demo data ONLY if the database is currently empty. Safe to call on
 * every backend startup — if products already exist (real deploy, or a
 * previous seed already ran), this does nothing and returns immediately.
 * This is what makes it safe to run automatically rather than as a manual
 * one-off step you have to remember every time.
 */
async function seedIfEmpty() {
  const existingCount = await Product.countDocuments();

  if (existingCount > 0) {
    console.log(`[seed] Skipping — ${existingCount} product(s) already exist`);
    return;
  }

  console.log('[seed] Database is empty, inserting demo data...');
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

  console.log('[seed] Done');
}

// Still runnable manually and standalone: `npm run seed`
async function runStandalone() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kartify');
  console.log('[seed] Connected to MongoDB');
  await seedIfEmpty();
  await mongoose.disconnect();
  process.exit(0);
}

// Only auto-run when this file is executed directly (`node seed.js`),
// not when it's imported by server.js
if (require.main === module) {
  runStandalone().catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
}

module.exports = { seedIfEmpty };
