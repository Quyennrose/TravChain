import bcrypt from 'bcryptjs';
import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { BookingItem } from '../models/BookingItem.js';
import { Membership } from '../models/Membership.js';
import { Notification } from '../models/Notification.js';
import { PartnerWallet } from '../models/PartnerWallet.js';
import { PaymentSource } from '../models/PaymentSource.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Service } from '../models/Service.js';
import { TravelPassportStamp } from '../models/TravelPassportStamp.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { convertCurrency } from '../services/exchangeRate.js';
import { balanceField, createWalletTransaction, ensureSufficientBalance, getOrCreateWallet, requireWalletPin } from '../services/walletService.js';
import { createHash, referenceCode } from '../utils/hash.js';

export const walletRouter = express.Router();

walletRouter.use(requireAuth);

walletRouter.get('/', async (req, res, next) => {
  try {
    res.json({ data: await getOrCreateWallet(req.user._id) });
  } catch (error) {
    next(error);
  }
});

walletRouter.get('/payment-sources', async (req, res, next) => {
  try {
    res.json({ data: await PaymentSource.find({ userId: req.user._id, status: 'active' }).sort({ isPrimary: -1, createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/set-pin', async (req, res, next) => {
  try {
    const { pin } = z.object({ pin: z.string().regex(/^\d{4,8}$/) }).parse(req.body);
    const wallet = await getOrCreateWallet(req.user._id);
    wallet.pinHash = await bcrypt.hash(pin, 10);
    await wallet.save();
    res.json({ message: 'Wallet PIN set' });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/verify-pin', async (req, res, next) => {
  try {
    const { pin } = z.object({ pin: z.string().min(4) }).parse(req.body);
    const wallet = await getOrCreateWallet(req.user._id);
    await requireWalletPin(wallet, pin);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

walletRouter.get('/transactions', async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.type && req.query.type !== 'all') filter.type = req.query.type;
    res.json({ data: await WalletTransaction.find(filter).populate('bookingId paymentSourceId').sort({ createdAt: -1 }).limit(100) });
  } catch (error) {
    next(error);
  }
});

walletRouter.get('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await WalletTransaction.findOne({ _id: req.params.id, userId: req.user._id }).populate('bookingId paymentSourceId');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ data: transaction });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/deposit', async (req, res, next) => {
  try {
    const { amount, currency, paymentSourceId } = z.object({
      amount: z.number().positive(),
      currency: z.literal('VND').default('VND'),
      paymentSourceId: z.string(),
    }).parse(req.body);
    const source = await PaymentSource.findOne({ _id: paymentSourceId, userId: req.user._id, status: 'active' });
    if (!source) return res.status(404).json({ message: 'Payment source not found' });
    const wallet = await getOrCreateWallet(req.user._id);
    wallet[balanceField[currency]] += amount;
    await wallet.save();
    const transaction = await createWalletTransaction({
      userId: req.user._id,
      walletId: wallet._id,
      paymentSourceId,
      type: 'deposit',
      amount,
      currency,
      description: `Deposit via ${source.providerName}`,
    });
    res.status(201).json({ data: { wallet, transaction } });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/withdraw', async (req, res, next) => {
  try {
    const { amount, currency, paymentSourceId, pin } = z.object({
      amount: z.number().positive(),
      currency: z.literal('VND').default('VND'),
      paymentSourceId: z.string().optional(),
      pin: z.string().min(4),
    }).parse(req.body);
    const wallet = await getOrCreateWallet(req.user._id);
    await requireWalletPin(wallet, pin);
    const field = ensureSufficientBalance(wallet, currency, amount);
    wallet[field] -= amount;
    wallet.pendingBalance += amount;
    await wallet.save();
    const transaction = await createWalletTransaction({
      userId: req.user._id,
      walletId: wallet._id,
      paymentSourceId,
      type: 'withdraw',
      amount,
      currency,
      status: 'completed',
      description: 'Wallet withdrawal completed',
    });
    wallet.pendingBalance = Math.max(wallet.pendingBalance - amount, 0);
    await wallet.save();
    res.status(201).json({ data: { wallet, transaction } });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/convert', async (req, res, next) => {
  try {
    const { fromCurrency, toCurrency, amount, pin } = z.object({
      fromCurrency: z.enum(['VND', 'USD', 'USDT']),
      toCurrency: z.enum(['VND', 'USD']),
      amount: z.number().positive(),
      pin: z.string().min(4),
    }).parse(req.body);
    const wallet = await getOrCreateWallet(req.user._id);
    await requireWalletPin(wallet, pin);
    const fromField = ensureSufficientBalance(wallet, fromCurrency, amount);
    const convertedAmount = convertCurrency(fromCurrency, toCurrency, amount);
    wallet[fromField] -= amount;
    wallet[balanceField[toCurrency]] += convertedAmount;
    await wallet.save();
    const transaction = await createWalletTransaction({
      userId: req.user._id,
      walletId: wallet._id,
      type: 'convert',
      amount,
      currency: fromCurrency,
      description: `Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`,
      metadata: { fromCurrency, toCurrency, convertedAmount },
    });
    res.status(201).json({ data: { wallet, transaction } });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/pay-booking', requireRole('traveler'), async (req, res, next) => {
  try {
    const { items, pin, displayCurrency = 'VND' } = z.object({
      items: z.array(z.object({
        serviceId: z.string(),
        quantity: z.number().int().min(1),
        guests: z.number().int().min(1),
        date: z.string().min(4),
      })).min(1),
      pin: z.string().min(4),
      displayCurrency: z.enum(['VND', 'USD']).default('VND'),
    }).parse(req.body);
    const wallet = await getOrCreateWallet(req.user._id);
    await requireWalletPin(wallet, pin);

    const services = await Service.find({ _id: { $in: items.map((item) => item.serviceId) }, status: 'approved' });
    const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));
    const bookingItems = items.map((item) => {
      const service = serviceMap.get(item.serviceId);
      if (!service) throw new Error(`Service ${item.serviceId} not found`);
      if (service.availability < item.quantity) {
        const error = new Error(`${service.title} is sold out or overbooked`);
        error.statusCode = 409;
        throw error;
      }
      return {
        serviceId: service._id,
        partnerId: service.partnerId,
        titleSnapshot: service.title,
        typeSnapshot: service.type,
        locationSnapshot: service.location,
        priceVndSnapshot: service.priceVnd,
        quantity: item.quantity,
        guests: item.guests,
        date: item.date,
      };
    });
    const totalVnd = bookingItems.reduce((sum, item) => sum + item.priceVndSnapshot * item.quantity, 0);
    ensureSufficientBalance(wallet, 'VND', totalVnd);

    for (const item of bookingItems) {
      const result = await Service.updateOne(
        { _id: item.serviceId, availability: { $gte: item.quantity } },
        { $inc: { availability: -item.quantity } },
      );
      if (!result.modifiedCount) {
        const error = new Error(`${item.titleSnapshot} is sold out or overbooked`);
        error.statusCode = 409;
        throw error;
      }
    }

    const transactionHash = createHash(`${req.user._id}:${Date.now()}:${totalVnd}:${JSON.stringify(bookingItems)}`);
    const booking = await Booking.create({
      userId: req.user._id,
      bookingCode: referenceCode('TC'),
      items: bookingItems,
      totalVnd,
      displayCurrency,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      status: 'confirmed',
      reconciliationStatus: 'ready',
      transactionHash,
    });
    wallet.vndBalance -= totalVnd;
    wallet.rewardPoints += Math.floor(totalVnd / 10000);
    await wallet.save();
    await BookingItem.insertMany(bookingItems.map((item) => ({ ...item, bookingId: booking._id })));
    const transaction = await createWalletTransaction({
      userId: req.user._id,
      walletId: wallet._id,
      bookingId: booking._id,
      type: 'booking_payment',
      amount: totalVnd,
      currency: 'VND',
      description: `Booking payment ${booking.bookingCode}`,
      metadata: { bookingCode: booking.bookingCode },
    });
    await TravelPassportStamp.insertMany(bookingItems.map((item) => ({
      userId: req.user._id,
      bookingId: booking._id,
      serviceId: item.serviceId,
      type: item.typeSnapshot,
      titleSnapshot: item.titleSnapshot,
      locationSnapshot: item.locationSnapshot,
      usedAt: item.date,
      stampHash: createHash(`${booking._id}:${item.serviceId}:${item.date}:${req.user._id}`),
    })));
    await Membership.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { points: Math.floor(totalVnd / 10000) }, $setOnInsert: { userId: req.user._id, tokenId: `TRAV-${req.user._id.toString().slice(-8)}`, tier: 'Explorer', perks: ['Member-only deals'] } },
      { upsert: true },
    );
    const grouped = new Map();
    for (const item of bookingItems) {
      const gross = item.priceVndSnapshot * item.quantity;
      grouped.set(item.partnerId.toString(), (grouped.get(item.partnerId.toString()) || 0) + gross);
    }
    await Promise.all([...grouped.entries()].map(async ([partnerId, grossVnd]) => {
      const platformFeeVnd = Math.round(grossVnd * 0.08);
      const netVnd = grossVnd - platformFeeVnd;
      await Reconciliation.create({ partnerId, bookingId: booking._id, grossVnd, platformFeeVnd, netVnd, status: 'ready' });
      await PartnerWallet.findOneAndUpdate(
        { partnerId },
        { $inc: { pendingBalance: netVnd, totalRevenue: grossVnd }, $setOnInsert: { partnerId } },
        { upsert: true },
      );
      await Notification.create({
        userId: partnerId,
        title: 'New booking received',
        message: `${booking.bookingCode} is ready for reconciliation.`,
        type: 'partner',
      });
    }));
    await Notification.create({
      userId: req.user._id,
      title: 'Booking confirmed',
      message: `${booking.bookingCode} was paid with TravChain Wallet.`,
      type: 'booking',
    });

    res.status(201).json({ data: { booking, wallet, transaction, qrPayload: `TRAVCHAIN|bookingCode=${booking.bookingCode}|amount=${totalVnd}|method=wallet|hash=${transaction.transactionHash}` } });
  } catch (error) {
    next(error);
  }
});
