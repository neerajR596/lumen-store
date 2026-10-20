import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const r = Router();
r.use(protect, admin);

r.get('/stats', asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 13 * 864e5); since.setHours(0, 0, 0, 0);
  const [revenueAgg, orders, users, products, lowStock, daily, top, recent] = await Promise.all([
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({ status: { $ne: 'Pending payment' } }),
    User.countDocuments(),
    Product.countDocuments(),
    Product.find({ stock: { $lte: 5 } }).select('title stock images').limit(6),
    Order.find({ createdAt: { $gte: since }, status: { $nin: ['Cancelled', 'Pending payment'] } }).select('createdAt totalPrice').lean(),
    Product.find().sort({ sold: -1 }).limit(5).select('title sold price images'),
    Order.find({ status: { $ne: 'Pending payment' } }).sort({ createdAt: -1 }).limit(6).populate('user', 'name'),
  ]);
  // Day keys use the server's local calendar date for both the slots and the orders.
  const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const days = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(since); day.setDate(since.getDate() + i);
    const d = dayKey(day);
    const hits = daily.filter((o) => dayKey(o.createdAt) === d);
    days.push({ date: d, revenue: hits.reduce((s, o) => s + o.totalPrice, 0), orders: hits.length });
  }
  res.json({ revenue: revenueAgg[0]?.total || 0, orders, users, products, lowStock, daily: days, top, recent });
}));

r.get('/users', asyncHandler(async (_req, res) => res.json(await User.find().sort({ createdAt: -1 }))));
r.put('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw new HttpError(400, "You can't change your own admin access");
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, 'User not found');
  u.isAdmin = !!req.body.isAdmin;
  await u.save();
  res.json(u);
}));
r.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw new HttpError(400, "You can't delete yourself");
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
}));

// Image uploads (stored in server/uploads and served at /uploads/...)
const dir = path.resolve('uploads'); fs.mkdirSync(dir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_req, f, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(f.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, f, cb) => cb(/^image\/(png|jpe?g|webp|gif|avif)$/.test(f.mimetype) ? null : new HttpError(400, 'Images only (png, jpg, webp, gif, avif)'), true),
});
r.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default r;
