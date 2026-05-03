import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['booking', 'refund', 'partner', 'wallet', 'system'], default: 'system', index: true },
    readStatus: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
