import mongoose from 'mongoose';

const bookingItemRecordSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titleSnapshot: { type: String, required: true },
    typeSnapshot: { type: String, required: true },
    locationSnapshot: { type: String, required: true },
    priceVndSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

export const BookingItem = mongoose.model('BookingItem', bookingItemRecordSchema);
