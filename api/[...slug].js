import 'dotenv/config';
import { connectDb } from '../server/src/config/db.js';
import { createApp } from '../server/src/app.js';

let app;
let dbPromise;

async function initialize() {
  if (!dbPromise) {
    dbPromise = connectDb().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  await dbPromise;

  if (!app) {
    app = createApp();
  }
}

export default async function handler(req, res) {
  await initialize();

  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}
