import mongoose from 'mongoose';
// Big Apple-style "tiles" on the home page. Fully editable from the dashboard.
const bannerSchema = new mongoose.Schema({
  eyebrow: String,                       // small label above the title, e.g. "New"
  title: { type: String, required: true },
  subtitle: String,
  image: String,
  ctaText: { type: String, default: 'Shop now' },
  ctaLink: { type: String, default: '/shop' },
  secondaryText: String,
  secondaryLink: String,
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  size: { type: String, enum: ['full', 'half'], default: 'full' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Banner', bannerSchema);
