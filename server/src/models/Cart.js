import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    guests: { type: Number, required: true, min: 1, default: 1 },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

export const Cart = mongoose.model('Cart', cartSchema);
