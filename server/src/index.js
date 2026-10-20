import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import bannerRoutes from './routes/banners.js';
import settingsRoutes from './routes/settings.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import Upload from './models/Upload.js';
import { asyncHandler } from './utils/asyncHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
  app.use(cors({ origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.get('/uploads/:filename', asyncHandler(async (req, res, next) => {
    const image = await Upload.findOne({ filename: req.params.filename }).select('+data');
    if (!image) return next();
    res.set('Cache-Control', 'public, max-age=604800, immutable');
    res.type(image.contentType).send(image.data);
  }));
  app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }));
  app.use('/uploads', notFound);

  // In production, serve the built React app from the same server.
  const dist = path.resolve('../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}

let connectionPromise;
export async function connectDB(uri = config.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;
  mongoose.set('strictQuery', true);
  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 5 })
    .catch((error) => { connectionPromise = undefined; throw error; });
  return connectionPromise;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  connectDB()
    .then(() => createApp().listen(config.port, () => {
      console.log(`✓ API running on http://localhost:${config.port}`);
      if (!config.razorpay.ready) console.log('ℹ Razorpay keys not set: online payment disabled, Cash on Delivery still works.');
    }))
    .catch((e) => {
      console.error('✗ Could not connect to MongoDB:', e.message);
      console.error('  Check MONGO_URI in server/.env, your database password, and Atlas → Network Access.');
      process.exit(1);
    });
}
