import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

export const signToken = (user) => jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' });

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please sign in');
  try {
    const { id } = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(id);
  } catch { throw new HttpError(401, 'Session expired, please sign in again'); }
  if (!req.user) throw new HttpError(401, 'Account not found');
  next();
});

export const admin = (req, _res, next) => {
  if (!req.user?.isAdmin) return next(new HttpError(403, 'Admins only'));
  next();
};
