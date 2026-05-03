import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Payment } from '../models/Payment.js';

export const paymentsRouter = express.Router();

paymentsRouter.post('/intent', requireAuth, async (req, res, next) => {
  try {
    const { amountVnd, method } = z.object({
      amountVnd: z.number().nonnegative(),
      method: z.enum(['wallet', 'card', 'qr']),
    }).parse(req.body);
    const payment = await Payment.create({ userId: req.user._id, amountVnd, method });
    res.status(201).json({ data: payment });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/confirm', requireAuth, async (req, res, next) => {
  try {
    const { paymentId } = z.object({ paymentId: z.string() }).parse(req.body);
    const payment = await Payment.findOne({ _id: paymentId, userId: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    payment.status = 'succeeded';
    payment.transactionHash = `0x${crypto.createHash('sha256').update(`${payment._id}:${Date.now()}`).digest('hex')}`;
    await payment.save();
    res.json({ data: payment });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.userId = req.user._id;
    const payment = await Payment.findOne(filter);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ data: payment });
  } catch (error) {
    next(error);
  }
});
