const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    List products with search, filter, sort & pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) {
    query.category = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (minRating) {
    query.ratingAverage = { $gte: Number(minRating) };
  }

  const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { ratingAverage: -1 },
    newest: { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    items,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
  });
});

// @desc    Get distinct categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ categories });
});

// @desc    Get featured / deal products for homepage
// @route   GET /api/products/featured
// @access  Public
const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json({ items: products });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    'reviews.user',
    'name'
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ product });
});

// @desc    Create a product (admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ product });
});

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.ratingCount = product.reviews.length;
  product.ratingAverage =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Review added' });
});

module.exports = {
  getProducts,
  getCategories,
  getFeatured,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
