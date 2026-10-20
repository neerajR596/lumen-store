import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  tagline: String,
  image: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model('Category', categorySchema);
