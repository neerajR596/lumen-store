import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, HttpError, slugify } from '../utils/asyncHandler.js';

const r = Router();
r.get('/', asyncHandler(async (_req, res) => {
  const cats = await Category.find().sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  res.json(cats.map((c) => ({ ...c, count: map[c.slug] || 0 })));
}));
r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { name, tagline, image, order } = req.body;
  if (!name) throw new HttpError(400, 'Name is required');
  res.status(201).json(await Category.create({ name, tagline, image, order, slug: slugify(req.body.slug || name) }));
}));
r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const { name, tagline, image, order } = req.body;
  const c = await Category.findByIdAndUpdate(req.params.id, { name, tagline, image, order }, { new: true });
  if (!c) throw new HttpError(404, 'Category not found');
  res.json(c);
}));
r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) throw new HttpError(404, 'Category not found');
  if (await Product.exists({ category: c.slug })) throw new HttpError(400, 'Move or delete the products in this category first');
  await c.deleteOne();
  res.json({ message: 'Category deleted' });
}));
export default r;
