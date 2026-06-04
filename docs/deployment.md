# TravChain Deployment Guide

## Free Vercel Deployment

This project can run on Vercel without Google Cloud:

- Vite frontend is built to `dist`.
- Express API is exposed through `api/index.js` as a Vercel Serverless Function.
- `/api/*` requests are rewritten to the serverless API before React routes fall back to `index.html`.

Use these Vercel settings:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set these production environment variables in Vercel:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=https://trav-chain.vercel.app
DEMO_ACCOUNTS_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

Leave `VITE_API_BASE_URL` empty on Vercel so the browser calls the same domain, for example `/api/services`.

After deployment, verify:

```txt
https://trav-chain.vercel.app/api/health
```

It should return JSON with `name: "TravChain API"`.

Google Search Console can still be used for indexing and sitemap submission. It does not require Google Cloud hosting.

## Frontend

Recommended hosts:

- Vercel
- Netlify

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

For production, configure the frontend to call the deployed backend API through a reverse proxy or environment-specific API base.

## Backend

Recommended hosts:

- Render
- Railway
- Fly.io

Start command:

```bash
npm run start
```

Seed command:

```bash
npm run seed
```

## Database

Use MongoDB Atlas.

Set:

```env
MONGODB_URI=mongodb+srv://...
```

## Production Environment Variables

```env
PORT=5050
CLIENT_ORIGIN=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-a-long-random-secret
```

## CORS

Set `CLIENT_ORIGIN` to the final frontend domain. Do not use `*` for a production app that handles accounts or payments.

## Monitoring

Recommended baseline:

- Morgan request logs.
- `/api/health` uptime check.
- Platform logs from Render/Railway/Fly.
- Error tracking through Sentry or Logtail later.
- Alert on booking/payment failure rate.
- Track API latency for booking and checkout routes.

## Optimization Checklist

- Paginate service lists.
- Add MongoDB indexes for service type, status, destination, partnerId, userId.
- Debounce frontend search.
- Lazy-load dashboard pages.
- Use optimized image hosting.
- Cache categories and featured services.
- Use atomic inventory updates to prevent overbooking.
