import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export const notificationsRouter = express.Router();

notificationsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({ data: await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50) });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { readStatus: true },
      { new: true },
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ data: notification });
  } catch (error) {
    next(error);
  }
});
