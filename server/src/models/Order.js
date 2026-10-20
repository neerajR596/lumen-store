import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String, image: String, color: String,
    price: Number, qty: { type: Number, min: 1 },
  }],
  shippingAddress: {
    fullName: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String, country: String,
  },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  payment: { razorpayOrderId: String, razorpayPaymentId: String, razorpaySignature: String },
  itemsPrice: Number, shippingPrice: Number, taxPrice: Number, totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  status: { type: String, enum: ['Pending payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
  deliveredAt: Date,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
