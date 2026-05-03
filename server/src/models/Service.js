import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hotel', 'homestay', 'attraction', 'cinema', 'event', 'local_tour', 'restaurant', 'transport', 'movie', 'stay'],
      required: true,
      index: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    title: { type: String, required: true, trim: true },
    providerBrand: { type: String, trim: true, index: true },
    province: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    destination: { type: String, trim: true, index: true },
    priceVnd: { type: Number, required: true, min: 0 },
    priceUsd: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 4.7, index: true },
    reviewCount: { type: Number, min: 0, default: 0 },
    inventory: { type: Number, min: 0 },
    duration: { type: String, default: '3 hours' },
    imageUrl: { type: String, required: true },
    coverImage: { type: String, default: '' },
    gallery: [{ type: String }],
    description: { type: String, required: true },
    detail: { type: String, default: '' },
    highlights: [{ type: String }],
    cancellationPolicy: { type: String, default: 'Free cancellation up to 24 hours before use when partner policy allows.' },
    availability: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending', 'pending_review', 'approved', 'rejected', 'archived'],
      default: 'pending_review',
      index: true,
    },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: [{ type: String, index: true }],
    sustainabilityScore: { type: Number, min: 0, max: 100, default: 72 },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

serviceSchema.index({ title: 'text', providerBrand: 'text', location: 'text', destination: 'text', province: 'text', description: 'text' });

export const Service = mongoose.model('Service', serviceSchema);
