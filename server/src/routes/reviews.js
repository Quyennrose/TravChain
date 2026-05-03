import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Service } from '../models/Service.js';

export const reviewsRouter = express.Router();

reviewsRouter.get('/featured', async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'published', verifiedBooking: true })
      .populate('userId', 'name')
      .populate('serviceId', 'title type province')
      .sort({ rating: -1, createdAt: -1 })
      .limit(6);
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      serviceId: z.string(),
      bookingId: z.string().optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional(),
    }).parse(req.body);
    if (!body.bookingId) return res.status(400).json({ message: 'bookingId is required for verified reviews' });
    const booking = await Booking.findOne({
      _id: body.bookingId,
      userId: req.user._id,
      status: 'completed',
      'items.serviceId': body.serviceId,
    });
    if (!booking) return res.status(403).json({ message: 'Only completed bookings can be reviewed' });
    const item = booking.items.find((entry) => entry.serviceId.toString() === body.serviceId);
    const duplicate = await Review.findOne({ bookingId: booking._id });
    if (duplicate) return res.status(409).json({ message: 'This booking has already been reviewed' });
    const review = await Review.create({
      ...body,
      userId: req.user._id,
      serviceBooked: item?.titleSnapshot || '',
      verifiedBooking: true,
    });
    const stats = await Review.aggregate([
      { $match: { serviceId: review.serviceId, status: 'published' } },
      { $group: { _id: '$serviceId', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Service.findByIdAndUpdate(review.serviceId, {
        rating: Number(stats[0].rating.toFixed(1)),
        reviewCount: stats[0].reviewCount,
      });
    }
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
});
