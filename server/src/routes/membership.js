import crypto from 'crypto';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Membership } from '../models/Membership.js';
import { Booking } from '../models/Booking.js';

export const membershipRouter = express.Router();

membershipRouter.get(['/', '/me'], requireAuth, async (req, res, next) => {
  try {
    const bookingCount = await Booking.countDocuments({ userId: req.user._id });
    const points = bookingCount * 120;
    const tokenId = crypto.createHash('sha1').update(req.user._id.toString()).digest('hex').slice(0, 12);

    const membership = await Membership.findOneAndUpdate(
      { userId: req.user._id },
      {
        $setOnInsert: {
          userId: req.user._id,
          tokenId: `TRAV-${tokenId}`,
          tier: 'Explorer Plus',
          perks: ['Priority deals', '2x passport points', 'Partner lounge access'],
        },
        $set: { points },
      },
      { new: true, upsert: true },
    );

    res.json({ data: membership });
  } catch (error) {
    next(error);
  }
});

membershipRouter.post('/earn', requireAuth, async (req, res, next) => {
  try {
    const points = Math.max(Number(req.body.points || 0), 0);
    const membership = await Membership.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { points },
        $setOnInsert: {
          userId: req.user._id,
          tokenId: `TRAV-${crypto.createHash('sha1').update(req.user._id.toString()).digest('hex').slice(0, 12)}`,
          tier: 'Explorer',
          perks: ['Member-only deals'],
        },
      },
      { upsert: true, new: true },
    );
    res.json({ data: membership });
  } catch (error) {
    next(error);
  }
});

membershipRouter.post('/redeem', requireAuth, async (req, res, next) => {
  try {
    const points = Math.max(Number(req.body.points || 0), 0);
    const membership = await Membership.findOne({ userId: req.user._id });
    if (!membership || membership.points < points) {
      return res.status(400).json({ message: 'Not enough points' });
    }
    membership.points -= points;
    await membership.save();
    res.json({ data: membership });
  } catch (error) {
    next(error);
  }
});
