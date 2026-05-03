import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Service } from '../models/Service.js';

export const servicesRouter = express.Router();

const serviceSchema = z.object({
  type: z.enum(['hotel', 'homestay', 'attraction', 'cinema', 'event', 'local_tour', 'restaurant', 'transport', 'movie', 'stay']),
  title: z.string().min(2),
  providerBrand: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  location: z.string().min(2),
  destination: z.string().optional(),
  priceVnd: z.number().nonnegative(),
  priceUsd: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  inventory: z.number().int().nonnegative().optional(),
  duration: z.string().optional(),
  imageUrl: z.string().url(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  description: z.string().min(8),
  detail: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  cancellationPolicy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sustainabilityScore: z.number().min(0).max(100).optional(),
  isFeatured: z.boolean().optional(),
  availability: z.number().int().nonnegative(),
});

servicesRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
    const filter = { status: 'approved' };
    if (req.query.type === 'stays') filter.type = { $in: ['hotel', 'homestay', 'stay'] };
    else if (req.query.type) filter.type = req.query.type;
    if (req.query.providerBrand) filter.providerBrand = new RegExp(String(req.query.providerBrand), 'i');
    if (req.query.province) filter.province = new RegExp(String(req.query.province), 'i');
    if (req.query.destination) filter.destination = new RegExp(String(req.query.destination), 'i');
    if (req.query.q) filter.$text = { $search: String(req.query.q) };

    const [data, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Service.countDocuments(filter),
    ]);
    res.json({ data, meta: { page, limit, total } });
  } catch (error) {
    next(error);
  }
});

servicesRouter.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.id, status: 'published' }).populate('userId', 'name').sort({ createdAt: -1 });
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
});

servicesRouter.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.post('/', requireAuth, requireRole('partner', 'admin'), async (req, res, next) => {
  try {
    const body = serviceSchema.parse(req.body);
    const service = await Service.create({
      ...body,
      destination: body.destination || body.location,
      partnerId: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending_review',
    });
    res.status(201).json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.patch('/:id', requireAuth, requireRole('partner', 'admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.partnerId = req.user._id;
    }

    const allowed = serviceSchema.partial().parse(req.body);
    const service = await Service.findOneAndUpdate(filter, allowed, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this partner' });
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.put('/:id', requireAuth, requireRole('partner', 'admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.partnerId = req.user._id;
    const allowed = serviceSchema.partial().parse(req.body);
    const service = await Service.findOneAndUpdate(filter, allowed, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this partner' });
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.patch('/:id/inventory', requireAuth, requireRole('partner', 'admin'), async (req, res, next) => {
  try {
    const { delta, availability } = z.object({
      delta: z.number().int().optional(),
      availability: z.number().int().nonnegative().optional(),
    }).parse(req.body);
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.partnerId = req.user._id;

    const update = availability !== undefined ? { $set: { availability } } : { $inc: { availability: delta || 0 } };
    const service = await Service.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this partner' });
    if (service.availability < 0) {
      service.availability = 0;
      await service.save();
    }
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['draft', 'pending', 'pending_review', 'approved', 'rejected', 'archived']),
    }).parse(req.body);
    const service = await Service.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
});

servicesRouter.delete('/:id', requireAuth, requireRole('partner', 'admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.partnerId = req.user._id;
    }

    const service = await Service.findOneAndDelete(filter);
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this partner' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
});
