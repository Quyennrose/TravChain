import mongoose from 'mongoose';

const travelPassportStampSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    type: {
      type: String,
      enum: ['cinema', 'hotel', 'homestay', 'attraction', 'event', 'local_tour', 'restaurant', 'transport', 'booking', 'reward', 'movie', 'stay'],
      required: true,
    },
    titleSnapshot: { type: String, required: true },
    locationSnapshot: { type: String, required: true },
    stampHash: { type: String, required: true, unique: true },
    usedAt: { type: String, required: true },
  },
  { timestamps: true },
);

export const TravelPassportStamp = mongoose.model('TravelPassportStamp', travelPassportStampSchema);
