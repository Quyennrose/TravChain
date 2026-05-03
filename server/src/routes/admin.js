import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AdminLog } from '../models/AdminLog.js';
import { Booking } from '../models/Booking.js';
import { Category } from '../models/Category.js';
import { PartnerWallet } from '../models/PartnerWallet.js';
import { Payment } from '../models/Payment.js';
import { Refund } from '../models/Refund.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { createWalletTransaction } from '../services/walletService.js';

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole('admin'));

async function logAdmin(req, action, targetType, targetId, metadata = {}) {
  await AdminLog.create({ adminId: req.user._id, action, targetType, targetId, metadata });
}

adminRouter.get('/dashboard', async (req, res, next) => {
  try {
    const [users, partners, bookings, services, reconciliation] = await Promise.all([
      User.countDocuments({ role: 'traveler' }),
      User.countDocuments({ role: 'partner' }),
      Booking.find(),
      Service.countDocuments(),
      Reconciliation.find(),
    ]);
    res.json({
      data: {
        users,
        partners,
        bookings: bookings.length,
        services,
        platformRevenueVnd: reconciliation.reduce((sum, row) => sum + row.platformFeeVnd, 0),
        grossBookingValueVnd: bookings.reduce((sum, row) => sum + row.totalVnd, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    res.json({ data: await User.find().select('-passwordHash').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/users/:id/status', async (req, res, next) => {
  try {
    const status = req.body.status === 'locked' ? 'locked' : 'active';
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await logAdmin(req, `user.${status}`, 'User', user._id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/partners', async (req, res, next) => {
  try {
    res.json({ data: await User.find({ role: 'partner' }).select('-passwordHash').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/services', async (req, res, next) => {
  try {
    res.json({ data: await Service.find().populate('partnerId', 'name email companyName').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/services/:id/approve', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await logAdmin(req, 'service.approve', 'Service', service._id);
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/services/:id/reject', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await logAdmin(req, 'service.reject', 'Service', service._id);
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/bookings', async (req, res, next) => {
  try {
    res.json({ data: await Booking.find().sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/logs', async (req, res, next) => {
  try {
    res.json({ data: await AdminLog.find().sort({ createdAt: -1 }).limit(100) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/categories', async (req, res, next) => {
  try {
    res.json({ data: await Category.find().sort({ type: 1, name: 1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/platform-revenue', async (req, res, next) => {
  try {
    const rows = await Reconciliation.find();
    res.json({
      data: {
        grossVnd: rows.reduce((sum, row) => sum + row.grossVnd, 0),
        platformFeeVnd: rows.reduce((sum, row) => sum + row.platformFeeVnd, 0),
        partnerNetVnd: rows.reduce((sum, row) => sum + row.netVnd, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/commission-report', async (req, res, next) => {
  try {
    const rows = await Reconciliation.find().populate('partnerId bookingId').sort({ createdAt: -1 });
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/refunds', async (req, res, next) => {
  try {
    res.json({ data: await Refund.find().populate('bookingId userId partnerId paymentId').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/refunds/:id/process', async (req, res, next) => {
  try {
    const refund = await Refund.findById(req.params.id).populate('bookingId paymentId');
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    if (refund.status === 'processed') return res.json({ data: refund });

    const booking = refund.bookingId;
    const payment = refund.paymentId || await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    const wallet = await Wallet.findOneAndUpdate(
      { userId: refund.userId },
      { $setOnInsert: { userId: refund.userId } },
      { upsert: true, new: true },
    );
    if (payment?.method === 'wallet') {
      wallet.vndBalance += refund.amount;
      await wallet.save();
    }
    const transaction = await createWalletTransaction({
      userId: refund.userId,
      walletId: wallet._id,
      bookingId: booking._id,
      type: 'refund',
      amount: refund.amount,
      currency: refund.currency,
      status: 'completed',
      description: payment?.method === 'wallet' ? 'Wallet refund processed' : 'Simulated refund transaction processed',
      metadata: { refundId: refund._id, method: payment?.method || booking.paymentMethod },
    });
    refund.status = 'processed';
    refund.refundHash = transaction.transactionHash;
    refund.processedAt = new Date();
    await refund.save();
    booking.status = 'refunded';
    booking.paymentStatus = 'refunded';
    await booking.save();
    await logAdmin(req, 'refund.process', 'Refund', refund._id, { amount: refund.amount, method: payment?.method || booking.paymentMethod });
    res.json({ data: { refund, transaction } });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/refunds/:id/reject', async (req, res, next) => {
  try {
    const refund = await Refund.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', decisionReason: req.body?.reason || 'Rejected by admin' },
      { new: true },
    );
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    await Booking.findByIdAndUpdate(refund.bookingId, { status: 'refund_rejected' });
    await logAdmin(req, 'refund.reject', 'Refund', refund._id);
    res.json({ data: refund });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/manual-adjustment', async (req, res, next) => {
  try {
    const { userId, partnerId, amount, currency = 'VND', reason = 'Manual adjustment' } = req.body;
    if (!amount || (!userId && !partnerId)) return res.status(400).json({ message: 'userId or partnerId and amount are required' });

    if (userId) {
      const wallet = await Wallet.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, new: true });
      if (currency === 'VND') wallet.vndBalance = Math.max(wallet.vndBalance + Number(amount), 0);
      if (currency === 'USD') wallet.usdBalance = Math.max(wallet.usdBalance + Number(amount), 0);
      if (currency === 'USDT') wallet.usdtBalance = Math.max(wallet.usdtBalance + Number(amount), 0);
      await wallet.save();
      const transaction = await createWalletTransaction({
        userId,
        walletId: wallet._id,
        type: Number(amount) >= 0 ? 'reward' : 'fee',
        amount: Number(amount),
        currency,
        description: reason,
      });
      await logAdmin(req, 'wallet.manual_adjustment', 'Wallet', wallet._id, { amount, currency, reason });
      return res.status(201).json({ data: { wallet, transaction } });
    }

    const partnerWallet = await PartnerWallet.findOneAndUpdate(
      { partnerId },
      { $inc: { availableBalance: Number(amount), totalRevenue: Math.max(Number(amount), 0) }, $setOnInsert: { partnerId } },
      { upsert: true, new: true },
    );
    await logAdmin(req, 'partner_wallet.manual_adjustment', 'PartnerWallet', partnerWallet._id, { amount, reason });
    res.status(201).json({ data: partnerWallet });
  } catch (error) {
    next(error);
  }
});
