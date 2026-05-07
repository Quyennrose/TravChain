import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';
import { PartnerWallet } from '../models/PartnerWallet.js';
import { Refund } from '../models/Refund.js';
import { Reconciliation } from '../models/Reconciliation.js';
import { Service } from '../models/Service.js';

export const partnerRouter = express.Router();

partnerRouter.use(requireAuth, requireRole('partner', 'admin'));

function partnerFilter(req) {
  return req.user.role === 'admin' && req.query.partnerId ? req.query.partnerId : req.user._id;
}

partnerRouter.get('/dashboard', async (req, res, next) => {
  try {
    const partnerId = partnerFilter(req);
    const [services, bookings, reconciliation] = await Promise.all([
      Service.find({ partnerId }),
      Booking.find({ 'items.partnerId': partnerId }).sort({ createdAt: -1 }).limit(10),
      Reconciliation.find({ partnerId }),
    ]);
    const refunds = await Refund.find({ partnerId });
    const revenue = reconciliation.reduce((sum, row) => sum + row.grossVnd, 0);
    const netRevenue = reconciliation.reduce((sum, row) => sum + row.netVnd, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    res.json({
      data: {
        servicesCount: services.length,
        inventory: services.reduce((sum, service) => sum + service.availability, 0),
        orders: bookings.length,
        revenue,
        netRevenue,
        platformFeeRate: 0.08,
        reconciliationReady: reconciliation.filter((row) => row.status === 'ready').length,
        refundRequests: refunds.filter((row) => row.status === 'requested').length,
        cancellationRate: bookings.length ? Math.round((bookings.filter((row) => ['cancelled', 'refund_requested', 'refunded'].includes(row.status)).length / bookings.length) * 100) : 0,
        refundAmountThisMonth: refunds.filter((row) => row.createdAt >= monthStart).reduce((sum, row) => sum + row.amount, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/refunds', async (req, res, next) => {
  try {
    res.json({ data: await Refund.find({ partnerId: partnerFilter(req) }).populate('bookingId userId paymentId').sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

partnerRouter.patch('/refunds/:id/approve', async (req, res, next) => {
  try {
    const refund = await Refund.findOneAndUpdate(
      { _id: req.params.id, partnerId: partnerFilter(req) },
      { status: 'approved', decisionReason: req.body?.reason || 'Approved by partner' },
      { new: true },
    );
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    await Notification.create({
      userId: refund.userId,
      title: 'Refund approved',
      message: 'Your refund request was approved by the partner and is waiting for processing.',
      type: 'refund',
    });
    res.json({ data: refund });
  } catch (error) {
    next(error);
  }
});

partnerRouter.patch('/refunds/:id/reject', async (req, res, next) => {
  try {
    const refund = await Refund.findOneAndUpdate(
      { _id: req.params.id, partnerId: partnerFilter(req) },
      { status: 'rejected', decisionReason: req.body?.reason || 'Rejected by partner' },
      { new: true },
    );
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    await Booking.findByIdAndUpdate(refund.bookingId, { status: 'refund_rejected' });
    await Notification.create({
      userId: refund.userId,
      title: 'Refund rejected',
      message: refund.decisionReason || 'Your refund request was rejected by the partner.',
      type: 'refund',
    });
    res.json({ data: refund });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/services', async (req, res, next) => {
  try {
    res.json({ data: await Service.find({ partnerId: partnerFilter(req) }).sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/bookings', async (req, res, next) => {
  try {
    res.json({ data: await Booking.find({ 'items.partnerId': partnerFilter(req) }).sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/reconciliation', async (req, res, next) => {
  try {
    res.json({ data: await Reconciliation.find({ partnerId: partnerFilter(req) }).sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/revenue', async (req, res, next) => {
  try {
    const rows = await Reconciliation.find({ partnerId: partnerFilter(req) });
    res.json({
      data: {
        grossVnd: rows.reduce((sum, row) => sum + row.grossVnd, 0),
        feeVnd: rows.reduce((sum, row) => sum + row.platformFeeVnd, 0),
        netVnd: rows.reduce((sum, row) => sum + row.netVnd, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/commission-breakdown', async (req, res, next) => {
  try {
    const rows = await Reconciliation.find({ partnerId: partnerFilter(req) }).sort({ createdAt: -1 });
    const grossVnd = rows.reduce((sum, row) => sum + row.grossVnd, 0);
    const platformFeeVnd = rows.reduce((sum, row) => sum + row.platformFeeVnd, 0);
    const netVnd = rows.reduce((sum, row) => sum + row.netVnd, 0);
    res.json({
      data: {
        platformFeeRate: 0.08,
        grossVnd,
        platformFeeVnd,
        netVnd,
        rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/export', async (req, res, next) => {
  try {
    const rows = await Booking.find({ 'items.partnerId': partnerFilter(req) }).sort({ createdAt: -1 });
    if (req.query.format === 'csv') {
      const csv = [
        'bookingCode,totalVnd,paymentStatus,reconciliationStatus,transactionHash,createdAt',
        ...rows.map((row) => [
          row.bookingCode,
          row.totalVnd,
          row.paymentStatus,
          row.reconciliationStatus,
          row.transactionHash,
          row.createdAt.toISOString(),
        ].join(',')),
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

partnerRouter.get('/wallet', async (req, res, next) => {
  try {
    const partnerId = partnerFilter(req);
    const wallet = await PartnerWallet.findOneAndUpdate(
      { partnerId },
      { $setOnInsert: { partnerId } },
      { upsert: true, new: true },
    );
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
});

partnerRouter.post('/payout-request', async (req, res, next) => {
  try {
    const partnerId = partnerFilter(req);
    const wallet = await PartnerWallet.findOneAndUpdate(
      { partnerId },
      { $setOnInsert: { partnerId } },
      { upsert: true, new: true },
    );
    if (wallet.availableBalance <= 0) {
      return res.status(400).json({ message: 'No available balance for payout' });
    }
    const amount = wallet.availableBalance;
    wallet.availableBalance = 0;
    wallet.pendingBalance += amount;
    await wallet.save();
    await Notification.create({
      userId: partnerId,
      title: 'Payout requested',
      message: `Payout request for ${amount.toLocaleString('vi-VN')} VND is pending.`,
      type: 'partner',
    });
    res.status(201).json({ data: { amount, wallet } });
  } catch (error) {
    next(error);
  }
});
