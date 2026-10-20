import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, HttpError, slugify } from '../utils/asyncHandler.js';

const r = Router();
const SORTS = { newest: { createdAt: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 }, popular: { sold: -1 } };

// GET /api/products?q=&category=&min=&max=&sort=&page=&limit=&featured=
r.get('/', asyncHandler(async (req, res) => {
  const { q, category, min, max, sort = 'newest', featured, all } = req.query;
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(60, +req.query.limit || 12);
  const filter = {};
  if (!all) filter.isActive = true;
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (min || max) filter.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { brand: rx }, { tagline: rx }, { category: rx }];
  }
  const [items, total] = await Promise.all([
    Product.find(filter).select('-reviews').sort(SORTS[sort] || SORTS.newest).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
}));

r.get('/:idOrSlug', asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const product = /^[a-f0-9]{24}$/i.test(idOrSlug) ? await Product.findById(idOrSlug) : await Product.findOne({ slug: idOrSlug });
  if (!product) throw new HttpError(404, 'Product not found');
  const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).select('-reviews').limit(4);
  res.json({ product, related });
}));

r.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, 'Rating must be 1-5');
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  const existing = product.reviews.find((rv) => String(rv.user) === String(req.user._id));
  if (existing) { existing.rating = rating; existing.comment = comment; }
  else product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.recalcRating();
  await product.save();
  res.status(201).json(product);
}));

// ---------- admin ----------
const pick = (b) => {
  const fields = ['title', 'brand', 'category', 'tagline', 'description', 'highlights', 'price', 'mrp', 'images', 'colors', 'stock', 'featured', 'isActive'];
  return Object.fromEntries(fields.filter((f) => b[f] !== undefined).map((f) => [f, b[f]]));
};

r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.title || data.price == null || !data.category) throw new HttpError(400, 'Title, price and category are required');
  let slug = slugify(req.body.slug || data.title), n = 1;
  while (await Product.exists({ slug })) slug = `${slugify(data.title)}-${++n}`;
  res.status(201).json(await Product.create({ ...data, slug }));
}));

r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
}));

r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw new HttpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
}));

export default r;
