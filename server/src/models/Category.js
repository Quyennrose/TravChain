import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['hotel', 'homestay', 'attraction', 'cinema', 'event', 'local_tour', 'restaurant', 'transport'],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Category = mongoose.model('Category', categorySchema);
