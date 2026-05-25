import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { PaymentSource } from '../models/PaymentSource.js';
import { getOrCreateWallet } from '../services/walletService.js';

export const paymentSourcesRouter = express.Router();

paymentSourcesRouter.use(requireAuth);

paymentSourcesRouter.get('/', async (req, res, next) => {
  try {
    res.json({ data: await PaymentSource.find({ userId: req.user._id, status: 'active' }).sort({ isPrimary: -1, createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
});

paymentSourcesRouter.post('/', async (req, res, next) => {
  try {
    const body = z.object({
      type: z.enum(['bank', 'card', 'domestic_qr']),
      providerName: z.string().min(2),
      bankName: z.string().min(2).optional(),
      accountHolder: z.string().min(2).optional(),
      maskedNumber: z.string().min(4),
      last4: z.string().min(2).max(8),
      currency: z.enum(['VND', 'USD']).default('VND'),
      isPrimary: z.boolean().default(false),
    }).parse(req.body);

    const count = await PaymentSource.countDocuments({ userId: req.user._id, status: 'active' });
    const shouldBePrimary = body.isPrimary || count === 0;
    if (shouldBePrimary) {
      await PaymentSource.updateMany({ userId: req.user._id }, { isPrimary: false });
    }
    const source = await PaymentSource.create({ ...body, userId: req.user._id, isPrimary: shouldBePrimary });
    if (shouldBePrimary) {
      const wallet = await getOrCreateWallet(req.user._id);
      wallet.defaultPaymentSourceId = source._id;
      await wallet.save();
    }
    res.status(201).json({ data: source });
  } catch (error) {
    next(error);
  }
});

paymentSourcesRouter.patch('/:id/set-primary', async (req, res, next) => {
  try {
    const source = await PaymentSource.findOne({ _id: req.params.id, userId: req.user._id, status: 'active' });
    if (!source) return res.status(404).json({ message: 'Payment source not found' });
    await PaymentSource.updateMany({ userId: req.user._id }, { isPrimary: false });
    source.isPrimary = true;
    await source.save();
    const wallet = await getOrCreateWallet(req.user._id);
    wallet.defaultPaymentSourceId = source._id;
    await wallet.save();
    res.json({ data: source });
  } catch (error) {
    next(error);
  }
});

paymentSourcesRouter.delete('/:id', async (req, res, next) => {
  try {
    const source = await PaymentSource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'disabled', isPrimary: false },
      { new: true },
    );
    if (!source) return res.status(404).json({ message: 'Payment source not found' });
    res.json({ data: source });
  } catch (error) {
    next(error);
  }
});
