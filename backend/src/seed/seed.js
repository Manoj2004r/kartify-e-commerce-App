require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const products = require('./products.json');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kartify');
  console.log('[seed] Connected to MongoDB');

  await Product.deleteMany({});
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
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
