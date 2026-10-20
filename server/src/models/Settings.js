import mongoose from 'mongoose';
// Single document holding storefront-wide content the admin can change.
const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Lumen' },
  announcement: { type: String, default: 'Free delivery on orders above ₹999. Easy 10-day returns.' },
  announcementActive: { type: Boolean, default: true },
  heroEyebrow: { type: String, default: 'New season' },
  heroTitle: { type: String, default: 'Beautifully made.\nThoughtfully priced.' },
  heroSubtitle: { type: String, default: 'Everything you love, delivered to your door.' },
  heroImage: { type: String, default: '' },
  heroCtaText: { type: String, default: 'Explore the store' },
  heroCtaLink: { type: String, default: '/shop' },
  accentColor: { type: String, default: '#0071e3' },
  freeShippingThreshold: { type: Number, default: 999 },
  shippingFee: { type: Number, default: 79 },
  taxRate: { type: Number, default: 0.18 },
  footerNote: { type: String, default: 'Lumen is a demo MERN store. Payments run in Razorpay test mode.' },
}, { timestamps: true });

settingsSchema.statics.get = async function () {
  return (await this.findOne()) || this.create({});
};
export default mongoose.model('Settings', settingsSchema);
