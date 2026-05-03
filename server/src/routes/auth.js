import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { publicUser, requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

export const authRouter = express.Router();

function signUser(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['traveler', 'partner']).default('traveler'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, companyName = '', phone = '' } = registerSchema.parse(req.body);

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, companyName, phone });
    return res.status(201).json({ token: signUser(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'locked') return res.status(403).json({ message: 'Account is locked' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    return res.json({ token: signUser(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json({ data: publicUser(req.user) });
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  res.json({ message: 'Logged out' });
});

authRouter.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      companyName: z.string().optional(),
      phone: z.string().optional(),
    });
    const updates = schema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ data: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
