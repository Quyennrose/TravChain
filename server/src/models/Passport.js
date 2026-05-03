import mongoose from 'mongoose';

const passportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    passportCode: { type: String, required: true, unique: true },
    stampCount: { type: Number, default: 0, min: 0 },
    lastTripAt: { type: Date },
  },
  { timestamps: true },
);

export const Passport = mongoose.model('Passport', passportSchema);
