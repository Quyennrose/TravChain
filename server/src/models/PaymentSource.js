import mongoose from 'mongoose';

const paymentSourceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['bank', 'card', 'domestic_qr', 'crypto_wallet'],
      required: true,
      index: true,
    },
    providerName: { type: String, required: true, trim: true },
    maskedNumber: { type: String, required: true, trim: true },
    last4: { type: String, required: true, trim: true },
    currency: { type: String, enum: ['VND', 'USD', 'USDT'], default: 'VND' },
    isPrimary: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },
  },
  { timestamps: true },
);

paymentSourceSchema.index({ userId: 1, isPrimary: 1 });

export const PaymentSource = mongoose.model('PaymentSource', paymentSourceSchema);
