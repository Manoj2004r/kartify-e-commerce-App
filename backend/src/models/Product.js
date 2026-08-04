const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specs: { type: Map, of: String },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
