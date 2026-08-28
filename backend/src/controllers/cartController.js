const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const populateAndFormat = async (cart) => {
  await cart.populate('items.product');
  const items = cart.items
    .filter((i) => i.product) // drop items whose product was deleted
    .map((i) => ({
      product: i.product,
      qty: i.qty,
      lineTotal: Number((i.product.price * i.qty).toFixed(2)),
    }));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal: Number(subtotal.toFixed(2)) };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(await populateAndFormat(cart));
});

// @desc    Add / update an item in the cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < qty) {
    res.status(400);
    throw new Error(`Only ${product.stock} unit(s) left in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    existingItem.qty = qty;
  } else {
    cart.items.push({ product: productId, qty });
  }

  await cart.save();
  res.status(201).json(await populateAndFormat(cart));
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(await populateAndFormat(cart));
});

// @desc    Clear the cart (used after placing an order)
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
  res.json({ items: [], subtotal: 0 });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };
