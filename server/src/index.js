import 'dotenv/config';
import { connectDb } from './config/db.js';
import { ensureJwtSecret } from './config/auth.js';
import { createApp } from './app.js';
import { ensureDemoAccounts } from './utils/demoAccounts.js';

const port = process.env.PORT || 5050;

ensureJwtSecret();
const app = createApp();

async function isExistingTravChainApi() {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const data = await response.json();
    return data?.name === 'TravChain API';
  } catch {
    return false;
  }
}

connectDb()
  .then(async () => {
    await ensureDemoAccounts();
    const server = app.listen(port, () => console.log(`TravChain API running on :${port}`));

    server.on('error', async (error) => {
      if (error.code !== 'EADDRINUSE') {
        console.error('Cannot start API', error);
        process.exit(1);
      }

      if (await isExistingTravChainApi()) {
        console.log(`TravChain API is already running on :${port}. Reusing existing API process.`);
        setInterval(() => {}, 60 * 60 * 1000);
        return;
      }

      console.error(`Port ${port} is already in use by another application. Set PORT in .env or stop that process.`);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Cannot start API', error);
    process.exit(1);
  });
