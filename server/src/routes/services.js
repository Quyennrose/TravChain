import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Service } from '../models/Service.js';

export const servicesRouter = express.Router();

const serviceTypeAliases = {
  stays: ['hotel', 'homestay', 'stay'],
  stay: ['hotel', 'homestay', 'stay'],
  hotels: ['hotel'],
  hotel: ['hotel'],
  homestays: ['homestay'],
  homestay: ['homestay'],
  cinema: ['cinema'],
  movie: ['cinema'],
  movies: ['cinema'],
  attractions: ['attraction'],
  attraction: ['attraction'],
  tours: ['local_tour'],
  tour: ['local_tour'],
  local_tour: ['local_tour'],
  events: ['event'],
  event: ['event'],
  restaurants: ['restaurant'],
  restaurant: ['restaurant'],
  dining: ['restaurant'],
  flights: ['flight'],
  flight: ['flight'],
  transport: ['transport'],
  trips: ['trip'],
  trip: ['trip'],
};

const canonicalCities = [
  { slug: 'da-nang', nameVi: 'Đà Nẵng', nameEn: 'Da Nang', aliases: ['Da Nang', 'Đà Nẵng', 'da-nang', 'danang'] },
  { slug: 'hoi-an', nameVi: 'Hội An', nameEn: 'Hoi An', aliases: ['Hoi An', 'Hội An', 'hoi-an', 'hoian'] },
  { slug: 'hue', nameVi: 'Huế', nameEn: 'Hue', aliases: ['Hue', 'Huế'] },
  { slug: 'ha-noi', nameVi: 'Hà Nội', nameEn: 'Ha Noi', aliases: ['Ha Noi', 'Hà Nội', 'ha-noi', 'hanoi'] },
  { slug: 'tp-hcm', nameVi: 'TP.HCM', nameEn: 'Ho Chi Minh', aliases: ['Ho Chi Minh', 'Ho Chi Minh City', 'TP.HCM', 'tp-hcm', 'Sai Gon', 'Saigon'] },
  { slug: 'ninh-binh', nameVi: 'Ninh Bình', nameEn: 'Ninh Binh', aliases: ['Ninh Binh', 'Ninh Bình', 'ninh-binh'] },
  { slug: 'sa-pa', nameVi: 'Sa Pa', nameEn: 'Sa Pa', aliases: ['Sa Pa', 'Sapa', 'sa-pa'] },
  { slug: 'ha-giang', nameVi: 'Hà Giang', nameEn: 'Ha Giang', aliases: ['Ha Giang', 'Hà Giang', 'ha-giang'] },
  { slug: 'phong-nha', nameVi: 'Phong Nha', nameEn: 'Phong Nha', aliases: ['Phong Nha', 'phong-nha'] },
  { slug: 'da-lat', nameVi: 'Đà Lạt', nameEn: 'Da Lat', aliases: ['Da Lat', 'Đà Lạt', 'da-lat', 'dalat'] },
  { slug: 'phu-quoc', nameVi: 'Phú Quốc', nameEn: 'Phu Quoc', aliases: ['Phu Quoc', 'Phú Quốc', 'phu-quoc'] },
  { slug: 'nha-trang', nameVi: 'Nha Trang', nameEn: 'Nha Trang', aliases: ['Nha Trang', 'nha-trang'] },
];

function normalizeKey(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function expandServiceTypes(values) {
  return [...new Set(values.flatMap((value) => serviceTypeAliases[normalizeKey(value)] || [value]).filter(Boolean))];
}

const provinceSlugMap = {
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  hue: 'Hue',
  'ha-noi': 'Ha Noi',
  'tp-hcm': 'Ho Chi Minh',
  'ho-chi-minh': 'Ho Chi Minh',
  'ninh-binh': 'Ninh Binh',
  'sa-pa': 'Sa Pa',
  'ha-giang': 'Ha Giang',
  'phong-nha': 'Phong Nha',
  'da-lat': 'Da Lat',
  'phu-quoc': 'Phu Quoc',
  'nha-trang': 'Nha Trang',
};

function provinceRegex(value) {
  const raw = String(value || '').trim();
  const normalized = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const canonical = provinceSlugMap[normalized] || raw;
  return new RegExp(canonical.replace(/[-\s]+/g, '[-\\s]*'), 'i');
}

function cityAliasRegex(value) {
  const raw = String(value || '').trim();
  const normalized = normalizeKey(raw);
  const city = canonicalCities.find((item) => item.slug === normalized || item.aliases.some((alias) => normalizeKey(alias) === normalized));
  const aliases = city ? city.aliases : [provinceSlugMap[normalized] || raw];
  const patterns = aliases.map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-\s]+/g, '[-\\s]*'));
  return new RegExp(patterns.join('|'), 'i');
}

const serviceSchema = z.object({
  type: z.enum(['hotel', 'homestay', 'attraction', 'cinema', 'event', 'local_tour', 'restaurant', 'transport', 'flight', 'trip', 'movie', 'stay']),
  title: z.string().min(2),
  providerBrand: z.string().min(2).optional(),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  originAirport: z.string().optional(),
  destinationAirport: z.string().optional(),
  departureTime: z.coerce.date().optional(),
  arrivalTime: z.coerce.date().optional(),
  baggage: z.string().optional(),
  seatClass: z.string().optional(),
  refundable: z.boolean().optional(),
  transportType: z.enum(['bus', 'train', 'airport_transfer', 'private_car', 'shuttle', '']).optional(),
  origin: z.string().optional(),
  routeDestination: z.string().optional(),
  departureLabel: z.string().optional(),
  arrivalLabel: z.string().optional(),
  seats: z.number().int().nonnegative().optional(),
  packageDuration: z.string().optional(),
  packageIncludes: z.array(z.string()).optional(),
  travelerType: z.string().optional(),
  acceptsInternationalCard: z.boolean().optional(),
  settlementCurrency: z.enum(['VND', 'USD']).optional(),
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
    const typeValues = String(req.query.types || req.query.type || '').split(',').map((value) => value.trim()).filter(Boolean);
    const expandedTypes = expandServiceTypes(typeValues);
    if (expandedTypes.length) {
      filter.type = expandedTypes.length === 1 ? expandedTypes[0] : { $in: expandedTypes };
    }
    if (req.query.transportType) {
      const transportValues = String(req.query.transportType).split(',').map((value) => value.trim()).filter(Boolean);
      filter.transportType = transportValues.length === 1 ? transportValues[0] : { $in: transportValues };
    }
    if (req.query.providerBrand) filter.providerBrand = new RegExp(String(req.query.providerBrand), 'i');
    if (req.query.province) filter.province = cityAliasRegex(req.query.province);
    if (req.query.destination && expandedTypes.some((type) => ['flight', 'transport'].includes(type))) filter.routeDestination = cityAliasRegex(req.query.destination);
    else if (req.query.destination) filter.destination = cityAliasRegex(req.query.destination);
    if (req.query.origin) filter.origin = cityAliasRegex(req.query.origin);
    if (req.query.routeDestination) filter.routeDestination = cityAliasRegex(req.query.routeDestination);
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
