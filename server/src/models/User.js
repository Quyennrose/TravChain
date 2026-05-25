import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['traveler', 'partner', 'admin'],
      default: 'traveler',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
      index: true,
    },
    companyName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    acceptsInternationalCard: { type: Boolean, default: false },
    settlementCurrency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
