import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Passport } from '../models/Passport.js';
import { TravelPassportStamp } from '../models/TravelPassportStamp.js';

export const passportRouter = express.Router();

async function ensurePassport(userId) {
  const passportCode = `TP-${userId.toString().slice(-8).toUpperCase()}`;
  const stampCount = await TravelPassportStamp.countDocuments({ userId });
  return Passport.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, passportCode }, $set: { stampCount, lastTripAt: new Date() } },
    { upsert: true, new: true },
  );
}

passportRouter.get(['/', '/me'], requireAuth, async (req, res, next) => {
  try {
    const passport = await ensurePassport(req.user._id);
    const stamps = await TravelPassportStamp.find({ userId: req.user._id }).populate('bookingId', 'bookingCode').sort({ createdAt: -1 });
    res.json({ data: { passport, stamps } });
  } catch (error) {
    next(error);
  }
});

passportRouter.get('/stamps', requireAuth, async (req, res, next) => {
  try {
    const stamps = await TravelPassportStamp.find({ userId: req.user._id }).populate('bookingId', 'bookingCode').sort({ createdAt: -1 });
    res.json({ data: stamps });
  } catch (error) {
    next(error);
  }
});

passportRouter.post('/stamps', requireAuth, async (req, res, next) => {
  try {
    const stamp = await TravelPassportStamp.create({ ...req.body, userId: req.user._id });
    await ensurePassport(req.user._id);
    res.status(201).json({ data: stamp });
  } catch (error) {
    next(error);
  }
});
