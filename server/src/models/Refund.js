import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
    reason: { type: String, trim: true, default: 'Traveler cancellation' },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'processed'],
      default: 'requested',
      index: true,
    },
    refundHash: { type: String, required: true, unique: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    decisionReason: { type: String, trim: true, default: '' },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

refundSchema.index({ userId: 1, createdAt: -1 });
refundSchema.index({ bookingId: 1 }, { unique: true });

export const Refund = mongoose.model('Refund', refundSchema);
