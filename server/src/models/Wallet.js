import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    vndBalance: { type: Number, default: 0, min: 0 },
    usdBalance: { type: Number, default: 0, min: 0 },
    usdtBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    rewardPoints: { type: Number, default: 0, min: 0 },
    membershipTier: { type: String, default: 'Explorer' },
    defaultPaymentSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSource' },
    pinHash: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Wallet = mongoose.model('Wallet', walletSchema);
