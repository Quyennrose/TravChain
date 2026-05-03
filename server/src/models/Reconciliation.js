import mongoose from 'mongoose';

const reconciliationSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    grossVnd: { type: Number, required: true, min: 0 },
    platformFeeRate: { type: Number, default: 0.08, min: 0 },
    platformFeeVnd: { type: Number, required: true, min: 0 },
    netVnd: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'ready', 'paid'], default: 'ready', index: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export const Reconciliation = mongoose.model('Reconciliation', reconciliationSchema);
