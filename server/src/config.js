import dotenv from 'dotenv';
dotenv.config();

const razorpayReady =
  !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes('xxxx');

export const config = {
  port: Number(process.env.PORT) || 5050,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumen',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  razorpay: { keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET, ready: razorpayReady },
};
