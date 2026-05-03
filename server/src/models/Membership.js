import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tier: {
      type: String,
      enum: ['Explorer', 'Explorer Plus', 'Voyager', 'Founding Traveler'],
      default: 'Explorer Plus',
    },
    tokenId: { type: String, required: true, unique: true },
    walletAddress: { type: String, default: '' },
    points: { type: Number, default: 0, min: 0 },
    perks: [{ type: String }],
  },
  { timestamps: true },
);

export const Membership = mongoose.model('Membership', membershipSchema);
