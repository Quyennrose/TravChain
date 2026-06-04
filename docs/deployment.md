# TravChain Deployment Guide

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
