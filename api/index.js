import 'dotenv/config';
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';
import { ensureJwtSecret } from '../server/src/config/auth.js';
import { ensureDemoAccounts } from '../server/src/utils/demoAccounts.js';

const app = createApp();
let readyPromise;

function canRunWithoutDatabase(req) {
  const path = (req.url || '').split('?')[0];
  return path === '/api/health' || path === '/api/categories';
}

async function ensureReady() {
  if (!readyPromise) {
    ensureJwtSecret();
    readyPromise = connectDb().then(() => ensureDemoAccounts());
  }

  return readyPromise;
}

export default async function handler(req, res) {
  try {
    if (!canRunWithoutDatabase(req)) {
      await ensureReady();
    }
    return app(req, res);
  } catch (error) {
    console.error('Cannot start TravChain API', error);
    res.status(500).json({
      message: error.message || 'Cannot start TravChain API',
      code: error.code || 'API_BOOT_ERROR',
    });
  }
}
