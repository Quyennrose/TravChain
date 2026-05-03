import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    paymentSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSource', index: true },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'convert', 'booking_payment', 'refund', 'reward', 'fee'],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['VND', 'USD', 'USDT', 'POINT'], required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    description: { type: String, default: '' },
    transactionHash: { type: String, required: true, unique: true },
    referenceCode: { type: String, required: true, unique: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
