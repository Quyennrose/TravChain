import mongoose from 'mongoose';

const transactionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
    type: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    hash: { type: String, required: true, unique: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const TransactionLog = mongoose.model('TransactionLog', transactionLogSchema);
