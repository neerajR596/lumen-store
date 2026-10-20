import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  brand: { type: String, default: 'Lumen' },
  category: { type: String, required: true, index: true },   // category slug
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  highlights: [String],
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  images: [String],
  colors: [{ name: String, hex: String }],
  stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ title: 'text', brand: 'text', tagline: 'text', description: 'text' });

productSchema.methods.recalcRating = function () {
  this.numReviews = this.reviews.length;
  this.rating = this.numReviews ? +(this.reviews.reduce((s, r) => s + r.rating, 0) / this.numReviews).toFixed(1) : 0;
};

export default mongoose.model('Product', productSchema);
