import mongoose from 'mongoose';

const bookingItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titleSnapshot: { type: String, required: true },
    typeSnapshot: { type: String, required: true },
    locationSnapshot: { type: String, required: true },
    priceVndSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1, default: 1 },
    date: { type: String, required: true },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingCode: { type: String, required: true, unique: true, index: true },
    items: [bookingItemSchema],
    totalVnd: { type: Number, required: true, min: 0 },
    displayCurrency: {
      type: String,
      enum: ['VND', 'USD'],
      default: 'VND',
    },
    exchangeRateVndPerUsd: { type: Number, default: 25000, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'card', 'qr'],
      default: 'wallet',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'refund_requested', 'refunded', 'refund_rejected'],
      default: 'confirmed',
      index: true,
    },
    reconciliationStatus: {
      type: String,
      enum: ['pending', 'ready', 'paid'],
      default: 'ready',
      index: true,
    },
    transactionHash: { type: String, required: true, unique: true },
    blockchainMemo: {
      type: String,
      default: 'MVP simulated booking hash. Replace with on-chain tx in later phase.',
    },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ 'items.partnerId': 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
