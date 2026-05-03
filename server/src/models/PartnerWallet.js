import mongoose from 'mongoose';

const partnerWalletSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const PartnerWallet = mongoose.model('PartnerWallet', partnerWalletSchema);
