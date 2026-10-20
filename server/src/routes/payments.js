import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { config } from '../config.js';
import { fulfil } from './orders.js';

const r = Router();
const rzp = () => {
  if (!config.razorpay.ready) throw new HttpError(503, 'Online payments are not configured yet. Add your Razorpay test keys to server/.env, or choose Cash on Delivery.');
  return new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
};

r.get('/config', (_req, res) => res.json({ razorpayEnabled: config.razorpay.ready, keyId: config.razorpay.ready ? config.razorpay.keyId : null }));

// Step 1: create a Razorpay order for one of our orders (amount comes from our DB, in paise)
r.post('/razorpay/order', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order || String(order.user) !== String(req.user._id)) throw new HttpError(404, 'Order not found');
  if (order.isPaid) throw new HttpError(400, 'Order is already paid');
  const rz = await rzp().orders.create({
    amount: Math.round(order.totalPrice * 100), currency: 'INR', receipt: String(order._id),
    notes: { orderId: String(order._id) },
  });
  order.payment.razorpayOrderId = rz.id; await order.save();
  const s = await Settings.get();
  res.json({ keyId: config.razorpay.keyId, razorpayOrderId: rz.id, amount: rz.amount, currency: rz.currency, storeName: s.storeName,
    prefill: { name: req.user.name, email: req.user.email, contact: order.shippingAddress?.phone } });
}));

// Step 2: verify the signature Razorpay returns to the browser, then mark the order paid
r.post('/razorpay/verify', protect, asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(orderId);
  if (!order || String(order.user) !== String(req.user._id)) throw new HttpError(404, 'Order not found');
  if (order.payment.razorpayOrderId !== razorpay_order_id) throw new HttpError(400, 'Payment does not match this order');
  const expected = crypto.createHmac('sha256', config.razorpay.keySecret || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const ok = expected.length === String(razorpay_signature || '').length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(razorpay_signature)));
  if (!ok) throw new HttpError(400, 'Payment verification failed');
  if (!order.isPaid) {
    Object.assign(order.payment, { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature });
    order.isPaid = true; order.paidAt = new Date(); order.status = 'Processing';
    await order.save(); await fulfil(order);
  }
  res.json(order);
}));

export default r;
