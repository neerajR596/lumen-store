import { Router } from 'express';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const r = Router();
r.get('/', asyncHandler(async (_req, res) => res.json(await Settings.get())));
r.put('/', protect, admin, asyncHandler(async (req, res) => {
  const s = await Settings.get();
  const { _id, createdAt, updatedAt, __v, ...rest } = req.body;
  Object.assign(s, rest);
  await s.save();
  res.json(s);
}));
export default r;
