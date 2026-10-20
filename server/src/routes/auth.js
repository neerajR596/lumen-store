import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin, address: u.address });

r.post('/register', limiter, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (await User.exists({ email: email.toLowerCase() })) throw new HttpError(400, 'An account with this email already exists');
  const user = await User.create({ name, email, password });
  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}));

r.post('/login', limiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) throw new HttpError(401, 'Incorrect email or password');
  if (process.env.NETLIFY && user.isAdmin && password === 'admin12345') {
    throw new HttpError(403, 'Change the default admin password locally before signing in to the deployed store.');
  }
  res.json({ user: publicUser(user), token: signToken(user) });
}));

r.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

r.put('/me', protect, asyncHandler(async (req, res) => {
  const { name, address, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (name) user.name = name;
  if (address) user.address = address;
  if (password) { if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters'); user.password = password; }
  await user.save();
  res.json({ user: publicUser(user) });
}));

export default r;
