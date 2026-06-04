import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { adminRouter } from './routes/admin.js';
import { assistantRouter } from './routes/assistant.js';
import { authRouter } from './routes/auth.js';
import { bookingsRouter } from './routes/bookings.js';
import { cartRouter } from './routes/cart.js';
import { exchangeRateRouter } from './routes/exchangeRate.js';
import { membershipRouter } from './routes/membership.js';
import { notificationsRouter } from './routes/notifications.js';
import { partnerRouter } from './routes/partner.js';
import { passportRouter } from './routes/passport.js';
import { paymentSourcesRouter } from './routes/paymentSources.js';
import { paymentsRouter } from './routes/payments.js';
import { reviewsRouter } from './routes/reviews.js';
import { refundsRouter } from './routes/refunds.js';
import { servicesRouter } from './routes/services.js';
import { walletRouter } from './routes/wallet.js';

function configuredClientOrigins() {
  return [
    process.env.CLIENT_ORIGIN,
    ...(process.env.CLIENT_ORIGINS || '').split(','),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ].map((origin) => String(origin || '').trim()).filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (configuredClientOrigins().includes(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  return /^https:\/\/trav-chain(-[a-z0-9-]+)?(-quyennroses-projects)?\.vercel\.app$/i.test(origin);
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin ${origin}`));
    },
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 80,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      name: 'TravChain API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/categories', (req, res) => {
    res.json({
      data: [
        { type: 'cinema', name: 'Cinema Tickets', route: '/services/cinema' },
        { type: 'stays', name: 'Hotels & Homestays', route: '/services/stays' },
        { type: 'attraction', name: 'Attractions', route: '/services/attractions' },
        { type: 'event', name: 'Events & Festivals', route: '/services/events' },
        { type: 'local_tour', name: 'Local Tours', route: '/services/tours' },
        { type: 'restaurant', name: 'Restaurants', route: '/services' },
        { type: 'transport', name: 'Transport', route: '/services' },
      ],
    });
  });

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/assistant', assistantRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/payment-sources', paymentSourcesRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/exchange-rate', exchangeRateRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/refunds', refundsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/partner', partnerRouter);
  app.use('/api/membership', membershipRouter);
  app.use('/api/passport', passportRouter);
  app.use('/api/admin', adminRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((error, req, res, next) => {
    const status = error.statusCode
      || (error.name === 'ValidationError' ? 400 : undefined)
      || (error.message?.includes('required') ? 400 : undefined)
      || (error.message?.includes('availability') ? 400 : undefined)
      || 500;

    if (process.env.NODE_ENV !== 'test') {
      console.error(error);
    }

    res.status(status).json({
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
    });
  });

  return app;
}
