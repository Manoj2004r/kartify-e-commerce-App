const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const SHIPPING_FLAT_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.05;

// @desc    Create an order from the current cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'COD' } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Validate stock and build order line items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue;
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`"${product.title}" only has ${product.stock} unit(s) left`);
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0],
      price: product.price,
      qty: item.qty,
    });
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // Decrement stock
  await Promise.all(
    orderItems.map((i) =>
      Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.qty } })
    )
  );

  // Empty the cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// @desc    Get single order by id (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ order });
});

// @desc    List all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ orders });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = status;
  if (status === 'DELIVERED') order.deliveredAt = new Date();
  await order.save();
  res.json({ order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
