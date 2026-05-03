import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Cart } from '../models/Cart.js';

export const cartRouter = express.Router();

cartRouter.use(requireAuth, requireRole('traveler'));

async function getCart(userId) {
  return Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true },
  ).populate('items.serviceId');
}

cartRouter.get('/', async (req, res, next) => {
  try {
    res.json({ data: await getCart(req.user._id) });
  } catch (error) {
    next(error);
  }
});

cartRouter.post('/items', async (req, res, next) => {
  try {
    const body = z.object({
      serviceId: z.string(),
      quantity: z.number().int().min(1).default(1),
      guests: z.number().int().min(1).default(1),
      date: z.string().min(4),
    }).parse(req.body);
    const cart = await getCart(req.user._id);
    const existing = cart.items.find((item) =>
      item.serviceId._id.toString() === body.serviceId && item.date === body.date && item.guests === body.guests);
    if (existing) existing.quantity += body.quantity;
    else cart.items.push(body);
    await cart.save();
    res.status(201).json({ data: await getCart(req.user._id) });
  } catch (error) {
    next(error);
  }
});

cartRouter.patch('/items/:itemId', async (req, res, next) => {
  try {
    const { quantity, guests, date } = z.object({
      quantity: z.number().int().min(1).optional(),
      guests: z.number().int().min(1).optional(),
      date: z.string().min(4).optional(),
    }).parse(req.body);
    const cart = await getCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    if (quantity !== undefined) item.quantity = quantity;
    if (guests !== undefined) item.guests = guests;
    if (date !== undefined) item.date = date;
    await cart.save();
    res.json({ data: await getCart(req.user._id) });
  } catch (error) {
    next(error);
  }
});

cartRouter.delete('/items/:itemId', async (req, res, next) => {
  try {
    const cart = await getCart(req.user._id);
    cart.items.pull({ _id: req.params.itemId });
    await cart.save();
    res.json({ data: await getCart(req.user._id) });
  } catch (error) {
    next(error);
  }
});

cartRouter.delete('/', async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] }, { upsert: true });
    res.json({ data: await getCart(req.user._id) });
  } catch (error) {
    next(error);
  }
});
