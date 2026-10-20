import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true, index: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true, select: false },
  size: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Upload || mongoose.model('Upload', uploadSchema);
