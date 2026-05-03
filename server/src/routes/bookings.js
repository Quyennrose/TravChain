import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { BookingItem } from '../models/BookingItem.js';
import { Membership } from '../models/Membership.js';
import { Notification } from '../models/Notification.js';
import { PartnerWallet } from '../models/PartnerWallet.js';
import { Payment } from '../models/Payment.js';
import { Refund } from '../models/Refund.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Service } from '../models/Service.js';
import { TransactionLog } from '../models/TransactionLog.js';
import { TravelPassportStamp } from '../models/TravelPassportStamp.js';

export const bookingsRouter = express.Router();

function hashPayload(value) {
  return `0x${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function bookingCode() {
  return `TC-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
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

bookingsRouter.get(['/me', '/my'], requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      items: z.array(z.object({
        serviceId: z.string(),
        quantity: z.number().int().min(1).default(1),
        guests: z.number().int().min(1).default(1),
        date: z.string().min(4),
      })).min(1),
      paymentMethod: z.enum(['wallet', 'card', 'qr']).default('wallet'),
      displayCurrency: z.enum(['VND', 'USD']).default('VND'),
      exchangeRateVndPerUsd: z.number().positive().default(25000),
    });
    const { items, paymentMethod, displayCurrency, exchangeRateVndPerUsd } = schema.parse(req.body);
    if (!items.length) return res.status(400).json({ message: 'Booking items are required' });

    const serviceIds = items.map((item) => item.serviceId);
    const services = await Service.find({ _id: { $in: serviceIds } });
    const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));

    const bookingItems = items.map((item) => {
      const service = serviceMap.get(item.serviceId);
      if (!service) throw new Error(`Service ${item.serviceId} not found`);
      const quantity = Number(item.quantity || 1);
      if (!item.date) throw new Error('Booking date is required');
      if (quantity < 1) throw new Error('Quantity must be at least 1');
      if (service.status !== 'approved') throw new Error(`${service.title} is not available for booking`);
      if (service.availability < quantity) {
        throw new Error(`${service.title} does not have enough availability`);
      }
      return {
        serviceId: service._id,
        partnerId: service.partnerId,
        titleSnapshot: service.title,
        typeSnapshot: service.type,
        locationSnapshot: service.location,
        priceVndSnapshot: service.priceVnd,
        quantity,
        guests: Number(item.guests || 1),
        date: item.date,
      };
    });

    const totalVnd = bookingItems.reduce(
      (sum, item) => sum + item.priceVndSnapshot * item.quantity,
      0,
    );
    const rawHash = `${req.user._id}:${Date.now()}:${JSON.stringify(bookingItems)}:${totalVnd}`;
    const transactionHash = hashPayload(rawHash);
    const code = bookingCode();

    for (const item of bookingItems) {
      const updateResult = await Service.updateOne(
        { _id: item.serviceId, availability: { $gte: item.quantity } },
        { $inc: { availability: -item.quantity } },
      );
      if (!updateResult.modifiedCount) {
        return res.status(409).json({ message: `${item.titleSnapshot} is sold out or overbooked` });
      }
    }

    const booking = await Booking.create({
      userId: req.user._id,
      bookingCode: code,
      items: bookingItems,
      totalVnd,
      paymentMethod,
      displayCurrency,
      exchangeRateVndPerUsd,
      paymentStatus: 'paid',
      status: 'confirmed',
      transactionHash,
    });

    const payment = await Payment.create({
      userId: req.user._id,
      bookingId: booking._id,
      amountVnd: totalVnd,
      method: paymentMethod,
      status: 'succeeded',
      transactionHash,
    });

    await BookingItem.insertMany(bookingItems.map((item) => ({ ...item, bookingId: booking._id })));

    await TravelPassportStamp.insertMany(
      bookingItems.map((item) => ({
        userId: req.user._id,
        bookingId: booking._id,
        serviceId: item.serviceId,
        type: item.typeSnapshot,
        titleSnapshot: item.titleSnapshot,
        locationSnapshot: item.locationSnapshot,
        usedAt: item.date,
        stampHash: `0x${crypto
          .createHash('sha256')
          .update(`${booking._id}:${item.serviceId}:${item.date}:${req.user._id}`)
          .digest('hex')}`,
      })),
    );

    const grouped = new Map();
    for (const item of bookingItems) {
      const key = item.partnerId.toString();
      grouped.set(key, (grouped.get(key) || 0) + item.priceVndSnapshot * item.quantity);
    }
    const reconciliationRows = [...grouped.entries()].map(([partnerId, grossVnd]) => {
      const platformFeeVnd = Math.round(grossVnd * 0.08);
      return {
        partnerId,
        bookingId: booking._id,
        grossVnd,
        platformFeeVnd,
        netVnd: grossVnd - platformFeeVnd,
        status: 'ready',
      };
    });
    await Reconciliation.insertMany(reconciliationRows);
    await Promise.all(reconciliationRows.map(async (row) => {
      await PartnerWallet.findOneAndUpdate(
        { partnerId: row.partnerId },
        { $inc: { pendingBalance: row.netVnd, totalRevenue: row.grossVnd }, $setOnInsert: { partnerId: row.partnerId } },
        { upsert: true },
      );
      await Notification.create({
        userId: row.partnerId,
        title: 'New booking received',
        message: `${code} is ready for reconciliation.`,
        type: 'partner',
      });
    }));

    const earnedPoints = Math.floor(totalVnd / 10000);
    await Membership.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { points: earnedPoints },
        $setOnInsert: {
          userId: req.user._id,
          tokenId: `TRAV-${req.user._id.toString().slice(-8)}`,
          tier: 'Explorer',
          perks: ['Member-only deals'],
        },
      },
      { upsert: true, new: true },
    );

    await TransactionLog.create({
      userId: req.user._id,
      bookingId: booking._id,
      paymentId: payment._id,
      type: 'booking.payment',
      status: 'succeeded',
      hash: transactionHash,
      payload: { bookingCode: code, totalVnd, paymentMethod },
    });
    await Notification.create({
      userId: req.user._id,
      title: 'Booking confirmed',
      message: `${code} was confirmed and added to Travel Passport.`,
      type: 'booking',
    });

    res.status(201).json({ data: booking });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.get('/receipt/:bookingCode', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingCode: req.params.bookingCode });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({
      data: {
        bookingCode: booking.bookingCode,
        totalVnd: booking.totalVnd,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        transactionHash: booking.transactionHash,
        qrPayload: `TRAVCHAIN|bookingCode=${booking.bookingCode}|amount=${booking.totalVnd}|method=${booking.paymentMethod}|hash=${booking.transactionHash}`,
        items: booking.items,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'traveler') filter.userId = req.user._id;
    if (req.user.role === 'partner') filter['items.partnerId'] = req.user._id;
    const booking = await Booking.findOne(filter);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ data: booking });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['cancelled', 'refund_requested', 'refunded'].includes(booking.status)) return res.json({ data: booking });
    const refundPolicy = refundAmountForBooking(booking);
    if (!refundPolicy.eligible) return res.status(400).json({ message: 'This booking is no longer eligible for cancellation' });

    const payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    const refundHash = hashPayload(`${booking._id}:${req.user._id}:${refundPolicy.amount}:${Date.now()}`);
    const partnerId = booking.items[0]?.partnerId;
    const refund = await Refund.findOneAndUpdate(
      { bookingId: booking._id },
      {
        userId: req.user._id,
        bookingId: booking._id,
        paymentId: payment?._id,
        amount: refundPolicy.amount,
        currency: 'VND',
        reason: req.body?.reason || 'Traveler cancellation',
        status: 'requested',
        refundHash,
        partnerId,
      },
      { upsert: true, new: true, runValidators: true },
    );

    booking.paymentStatus = 'cancelled';
    booking.status = 'refund_requested';
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
      message: `${booking.bookingCode} cancellation was submitted for review.`,
      type: 'refund',
    });
    res.json({ data: { booking, refund } });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.get('/:id/receipt', requireAuth, async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'traveler') filter.userId = req.user._id;
    if (req.user.role === 'partner') filter['items.partnerId'] = req.user._id;
    const booking = await Booking.findOne(filter);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({
      data: {
        bookingCode: booking.bookingCode,
        totalVnd: booking.totalVnd,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        transactionHash: booking.transactionHash,
        qrPayload: `TRAVCHAIN|bookingCode=${booking.bookingCode}|amount=${booking.totalVnd}|method=${booking.paymentMethod}|hash=${booking.transactionHash}`,
        items: booking.items,
      },
    });
  } catch (error) {
    next(error);
  }
});
