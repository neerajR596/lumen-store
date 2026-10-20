import { Router } from 'express';
import Banner from '../models/Banner.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const r = Router();
const FIELDS = ['eyebrow', 'title', 'subtitle', 'image', 'ctaText', 'ctaLink', 'secondaryText', 'secondaryLink', 'theme', 'size', 'order', 'active'];
const pick = (b) => Object.fromEntries(FIELDS.filter((f) => b[f] !== undefined).map((f) => [f, b[f]]));

r.get('/', asyncHandler(async (req, res) => {
  const filter = req.query.all ? {} : { active: true };
  res.json(await Banner.find(filter).sort({ order: 1, createdAt: 1 }));
}));
r.post('/', protect, admin, asyncHandler(async (req, res) => res.status(201).json(await Banner.create(pick(req.body)))));
r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const b = await Banner.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!b) throw new HttpError(404, 'Banner not found');
  res.json(b);
}));
r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  if (!(await Banner.findByIdAndDelete(req.params.id))) throw new HttpError(404, 'Banner not found');
  res.json({ message: 'Banner deleted' });
}));
export default r;
