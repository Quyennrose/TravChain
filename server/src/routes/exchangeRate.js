import express from 'express';
import { exchangeRates } from '../services/exchangeRate.js';

export const exchangeRateRouter = express.Router();

exchangeRateRouter.get('/', (req, res) => {
  res.json({ data: exchangeRates, updatedAt: new Date().toISOString(), provider: 'travchain-mock' });
});
