import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const r = Router();

// Prices are always recalculated on the server from the database; the client's numbers are never trusted.
export async function priceItems(rawItems) {
  if (!Array.isArray(rawItems) || !rawItems.length) throw new HttpError(400, 'Your bag is empty');
  const ids = rawItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));
  const items = rawItems.map((i) => {
    const p = byId[String(i.product)];
    if (!p) throw new HttpError(400, 'A product in your bag is no longer available');
    const qty = Math.max(1, Math.min(10, parseInt(i.qty, 10) || 1));
    if (p.stock < qty) throw new HttpError(400, `Only ${p.stock} left of ${p.title}`);
    return { product: p._id, title: p.title, image: p.images?.[0], color: i.color, price: p.price, qty };
  });
  const s = await Settings.get();
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= s.freeShippingThreshold ? 0 : s.shippingFee;
  const taxPrice = Math.round(itemsPrice * s.taxRate);                  // GST, rounded to whole rupees
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return { items, itemsPrice, shippingPrice, taxPrice, totalPrice };
}

export async function fulfil(order) {
  for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty, sold: it.qty } });
}

r.post('/quote', asyncHandler(async (req, res) => res.json(await priceItems(req.body.items))));

r.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!['razorpay', 'cod'].includes(paymentMethod)) throw new HttpError(400, 'Choose a payment method');
  const a = shippingAddress || {};
  for (const f of ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'])
    if (!a[f]) throw new HttpError(400, 'Please complete your delivery address');
  const priced = await priceItems(items);
  const order = await Order.create({
    user: req.user._id, ...priced, shippingAddress: { country: 'India', ...a }, paymentMethod,
    status: paymentMethod === 'cod' ? 'Processing' : 'Pending payment',
  });
  if (paymentMethod === 'cod') await fulfil(order);
  res.status(201).json(order);
}));

r.get('/mine', protect, asyncHandler(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));

r.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new HttpError(404, 'Order not found');
  if (String(order.user._id) !== String(req.user._id) && !req.user.isAdmin) throw new HttpError(403, 'Not your order');
  res.json(order);
}));

r.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || String(order.user) !== String(req.user._id)) throw new HttpError(404, 'Order not found');
  if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) throw new HttpError(400, `Order is already ${order.status.toLowerCase()}`);
  if (order.status !== 'Pending payment') for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty, sold: -it.qty } });
  order.status = 'Cancelled'; await order.save();
  res.json(order);
}));

// ---------- admin ----------
r.get('/', protect, admin, asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).limit(200));
}));

r.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  order.status = status;
  if (status === 'Delivered') { order.deliveredAt = new Date(); if (order.paymentMethod === 'cod' && !order.isPaid) { order.isPaid = true; order.paidAt = new Date(); } }
  await order.save();
  res.json(order);
}));

export default r;
