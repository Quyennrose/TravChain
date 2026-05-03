import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';
import { Payment } from '../models/Payment.js';
import { Refund } from '../models/Refund.js';
import { Service } from '../models/Service.js';

export const refundsRouter = express.Router();

function hashPayload(value) {
  return `0x${crypto.createHash('sha256').update(String(value)).digest('hex')}`;
}

function refundAmountForBooking(booking) {
  const firstDate = booking.items
    .map((item) => new Date(`${item.date}T00:00:00.000Z`).getTime())
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
  if (!firstDate) return { amount: 0, eligible: false };
  const hoursUntilUse = (firstDate - Date.now()) / 36e5;
  if (hoursUntilUse > 24) return { amount: booking.totalVnd, eligible: true };
  if (hoursUntilUse > 0) return { amount: Math.round(booking.totalVnd * 0.5), eligible: true };
  return { amount: 0, eligible: false };
}

refundsRouter.use(requireAuth);

refundsRouter.get('/my', async (req, res, next) => {
  try {
    res.json({ data: await Refund.find({ userId: req.user._id }).populate('bookingId paymentId').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

refundsRouter.post('/', async (req, res, next) => {
  try {
    const body = z.object({
      bookingId: z.string(),
      reason: z.string().min(2).max(500).default('Traveler cancellation'),
    }).parse(req.body);
    const booking = await Booking.findOne({ _id: body.bookingId, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['cancelled', 'refund_requested', 'refunded'].includes(booking.status)) {
      const existing = await Refund.findOne({ bookingId: booking._id });
      return res.status(existing ? 200 : 400).json({ data: existing, message: existing ? undefined : 'Booking already cancelled' });
    }

    const policy = refundAmountForBooking(booking);
    if (!policy.eligible) return res.status(400).json({ message: 'This booking is no longer eligible for refund' });

    const payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    const partnerId = booking.items[0]?.partnerId;
    const refund = await Refund.create({
      userId: req.user._id,
      bookingId: booking._id,
      paymentId: payment?._id,
      amount: policy.amount,
      currency: 'VND',
      reason: body.reason,
      status: 'requested',
      refundHash: hashPayload(`${booking._id}:${req.user._id}:${policy.amount}:${Date.now()}`),
      partnerId,
    });

    booking.status = 'refund_requested';
    booking.paymentStatus = 'cancelled';
    booking.reconciliationStatus = 'pending';
    await booking.save();
    await Promise.all(booking.items.map((item) => Service.updateOne(
      { _id: item.serviceId },
      { $inc: { availability: item.quantity } },
    )));

    if (partnerId) {
      await Notification.create({
        userId: partnerId,
        title: 'Refund request received',
        message: `${booking.bookingCode} has a cancellation/refund request.`,
        type: 'refund',
      });
    }
    await Notification.create({
      userId: req.user._id,
      title: 'Refund requested',
      message: `${booking.bookingCode} refund request is waiting for partner review.`,
      type: 'refund',
    });

    res.status(201).json({ data: refund });
  } catch (error) {
    next(error);
  }
});
