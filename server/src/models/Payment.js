import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    amountVnd: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['wallet', 'card', 'qr'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['requires_confirmation', 'processing', 'succeeded', 'failed'],
      default: 'requires_confirmation',
      index: true,
    },
    provider: { type: String, default: 'travchain-simulated' },
    transactionHash: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Payment = mongoose.model('Payment', paymentSchema);
