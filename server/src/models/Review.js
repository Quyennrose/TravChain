import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    serviceBooked: { type: String, default: '' },
    verifiedBooking: { type: Boolean, default: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true },
);

reviewSchema.index({ serviceId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ bookingId: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model('Review', reviewSchema);
