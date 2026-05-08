# TravChain - All Travel One Tap

TravChain is a full-stack travel and entertainment booking platform for Vietnam. It supports three roles:

- **Traveler**: search, compare, book, pay, receive QR-style receipt, and view Travel Passport history.
- **Partner**: manage services, inventory, bookings, revenue, reconciliation, and exports.
- **Admin**: manage users, partners, service approvals, bookings, platform revenue, and audit logs.

The MVP uses real API calls, MongoDB persistence, JWT authentication, role-based access control, simulated payment, simulated transaction hash, membership points, and Travel Passport stamps.
Wallet is now a first-class payment module with VND, USD, USDT balances, payment sources, PIN-protected withdrawals/conversions, booking payment integration, transaction history, partner payout tracking, and admin revenue controls.

The traveler UI is route-based instead of one long page. Landing, category flows, service detail, cart, checkout, bookings, QR receipt, Travel Passport, wallet, and profile each have a dedicated screen.
The latest traveler polish keeps the landing lighter and more premium, moves trust/category/how-it-works content into clear product sections, and keeps booking/payment flows out of the landing page.
The marketplace theme now uses a warm-light palette with dark navy contrast, premium cards, connected booking steps, featured verified reviews, and clearer booking detail/refund surfaces.
Partner/admin workspaces share the global language switch and use dedicated dictionaries in `src/locales/vi/partner.json` and `src/locales/en/partner.json`.
Visible UI copy is centralized in locale dictionaries under `src/locales/{vi,en}` for common, traveler, partner, admin, wallet, booking, and assistant surfaces.
Source, locale, seed, and documentation files should stay UTF-8 without BOM so Vietnamese text renders correctly across the app.

## Production UX Direction

TravChain is moving from MVP screens toward a premium travel marketplace experience:

- Brand terms stay untranslated across UI and docs: TravChain, All Travel One Tap, Travel Passport, QR, NFT, Hash, VND, USD, CGV, Lotte, Galaxy, Beta, and Cinestar.
- Traveler pages use a warm-light marketplace palette: `#F7F2E8` background, `#FFFFFF` cards, `#FF5A00` primary orange, `#050A1F` dark navy, `#14B8A6` trust accent, and `#667085` muted text.
- The landing hero stays cinematic and quiet: glass search, one category row, and one lightweight trending row without crowded trust or recommendation chips.
- TravChain Assistant supports compact chat and expanded workspace modes. It calls `/api/assistant/chat`, detects booking and support intents across cinema, hotels, homestays, attractions, tours, events, restaurants, transport, itinerary, budget, family, couple, weekend, booking status, cancellation, refunds, wallet, payment methods, Travel Passport, membership, and partner help, then returns real service cards, filters, actions, follow-up chips, and booking CTAs.
- Service cards are designed like premium listings with immersive imagery, verified partner signals, ratings, cancellation/availability badges, top-booked signals, wishlist affordance, and a clear booking CTA.
- Destination pages use `/destination/:slug` routes for city-first discovery, including attractions, stays, local tours, food experiences, events, a map teaser, and local storytelling.
- Search includes recent/trending destination suggestions such as Da Nang, Hoi An Lantern Festival, CGV Vincom, and Sa Pa Local Tour.
- Review surfaces include avatar, country, verified booking badge, date, helpful count, optional image, average score, and rating distribution bars.
- Checkout uses a connected booking stepper from search through QR receipt and Travel Passport to make payment feel safer and more transparent.
- Wallet surfaces use a fintech-style balance card, quick actions, transaction categories, refund timeline, reward points, and Hash-backed records.
- Profile includes traveler identity, membership tier, reward points, wallet balance, booking count, recent journeys, notifications, refunds, and quick actions.
- Empty/loading states use premium skeletons and human copy such as "No journeys yet. Start exploring Vietnam experiences."
- Express JSON responses include UTF-8 charset headers, and `index.html` declares `<meta charset="UTF-8" />`.
- Typography uses `Be Vietnam Pro`, `Inter`, `Noto Sans`, and system fonts with smoothing and line-height tuned for Vietnamese diacritics.

## Why Local Links May Not Open

The links below only work after the local servers are running. README links do not start the app by themselves.

Start frontend and backend together:

```bash
npm run dev
```

If MongoDB is not running, backend API links such as `/api/health` may fail. Start MongoDB locally or set `MONGODB_URI` to MongoDB Atlas.

## Local Links

- Frontend: [http://localhost:5173](http://localhost:5173)
- Fallback frontend port if `5173` is busy: [http://localhost:5174](http://localhost:5174)
- Backend API health: [http://127.0.0.1:5050/api/health](http://127.0.0.1:5050/api/health)
- Services API: [http://127.0.0.1:5050/api/services](http://127.0.0.1:5050/api/services)
- Bookings API: [http://127.0.0.1:5050/api/bookings/my](http://127.0.0.1:5050/api/bookings/my)
- Auth API: [http://127.0.0.1:5050/api/auth/me](http://127.0.0.1:5050/api/auth/me)
- Membership API: [http://127.0.0.1:5050/api/membership](http://127.0.0.1:5050/api/membership)
- Travel Passport API: [http://127.0.0.1:5050/api/passport](http://127.0.0.1:5050/api/passport)
- Wallet API: [http://127.0.0.1:5050/api/wallet](http://127.0.0.1:5050/api/wallet)
- Assistant API: [http://127.0.0.1:5050/api/assistant/chat](http://127.0.0.1:5050/api/assistant/chat)
- Exchange Rate API: [http://127.0.0.1:5050/api/exchange-rate](http://127.0.0.1:5050/api/exchange-rate)

Protected API links require a Bearer token, so clicking them directly in the browser may return `Missing token`. Use the frontend login flow or an API client.

## Demo Accounts

After running `npm run seed`:

- Admin: `admin@travchain.vn` / `123456`
- Traveler: `demo@travchain.vn` / `123456`
- Traveler: `linh@travchain.vn` / `123456`
- Partner: `partner@travchain.vn` / `123456`
- Partner: `local@travchain.vn` / `123456`

## Requirements Covered

- Traveler auth, search, filter, service detail, cart, checkout, booking history, QR-style receipt, transaction hash, membership, and passport stamps.
- Traveler routing: `/`, `/explore`, `/services`, category services, `/service/:id`, `/cart`, `/checkout`, `/bookings`, `/receipt/:bookingCode`, `/passport`, `/wallet`, and `/profile`.
- Role-based login at `/login`: `/login?role=partner` preselects Partner, `/login?role=traveler` preselects Customer, and redirect always uses the actual API/JWT user role.
- Login now supports three role tabs: customer/traveler, partner, and admin. JWT tokens include `role`, and successful login redirects traveler to `/explore`, partner to `/partner/dashboard`, and admin to `/admin/dashboard`.
- Landing partner CTA is role-aware: guests go to `/login?role=partner`, partners go to `/partner/dashboard`, admins go to `/admin/dashboard`, and travelers see a role mismatch modal.
- Category booking flows for cinema, stays, attractions, events, and local tours.
- Wallet multi-currency balances, payment sources, deposit, withdraw, currency conversion, wallet PIN, transaction detail, and wallet checkout.
- Checkout supports TravChain Wallet, international card, and domestic QR. Each successful booking creates a booking code, simulated transaction hash, QR receipt payload, success modal, and `/receipt/:bookingCode` receipt page.
- Travel Passport stamps now support all service categories: `cinema`, `hotel`, `homestay`, `attraction`, `event`, `local_tour`, `restaurant`, `transport`, plus `booking` and `reward`.
- Reviews support featured verified review cards, `GET /api/reviews/featured`, service reviews, and protected review creation for completed bookings only.
- Cancellation/refund flow supports `POST /api/bookings/:id/cancel`, `POST /api/refunds`, traveler refund history, partner refund approval/rejection, admin refund processing, wallet refund transactions, refund hashes, notifications, and inventory restoration for eligible cancellations.
- Partner dashboard includes localized metrics, refund/cancellation signals, low-inventory signal, notification badge, and lightweight revenue charts for 7-day, 30-day, and service-level views.
- Travel Passport uses a timeline view with QR receipt links and hash verification badges.
- Partner auth, dashboard APIs, services, bookings, revenue, reconciliation, inventory management, and JSON/CSV export.
- Partner wallet and payout request APIs.
- Admin dashboard APIs, user/partner management, service approve/reject, bookings, categories, and logs.
- Admin platform revenue, commission report, and manual wallet adjustment APIs.
- MongoDB/Mongoose models for User, Partner-as-role, Service, Category, Cart, Booking, BookingItem, Payment, TransactionLog, Passport, PassportStamp, Membership, Review, Reconciliation, and AdminLog.
- Security: bcrypt password hash, JWT, role guard, account lock, Zod validation, Helmet, CORS, auth rate limit, and ownership checks.
- Encoding safety: UTF-8 no-BOM source files, HTML charset, JSON charset middleware, development mojibake warnings, and `npm run i18n:qa`.
- Tests: auth, service list, partner create service, unauthorized access, booking creation, inventory decrement, hash creation, membership points, locked account.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Helmet
- Morgan
- express-rate-limit
- Vitest
- Supertest
- mongodb-memory-server

## Project Structure

```txt
src/
  app/App.tsx
  main.tsx
  styles/
server/
  src/
    app.js
    index.js
    config/
    data/
    middleware/
    models/
    routes/
    tests/
docs/
  api.md
  database.md
  deployment.md
  user-flow.md
```

## Traveler Routes

- `/`: landing page with hero search, quick categories, featured destinations, featured services, Passport teaser, and partner CTA.
- `/services/cinema`: provider-first cinema flow for CGV, Lotte, Galaxy, Beta, and Cinestar before location/movie/time inventory.
- `/services/stays`: hotel/homestay inventory by province and stay type.
- `/services/attractions`: attraction ticket inventory.
- `/services/events`: events and festivals.
- `/services/tours`: local and community tours.
- `/service/:id`: service gallery, rating, location, price, highlights, cancellation policy, reviews, and booking CTA.
- `/cart` and `/checkout`: booking flow with wallet/card/QR payment.
- `/bookings` and `/receipt/:bookingCode`: booking history and QR receipt.
- `/passport`: Travel Passport timeline with stamps, QR receipt links, reward points, tier, and hash verification.
- `/wallet`: travel wallet overview, payment sources, transactions, refunds, and security.

## Partner Routes

- `/partner/dashboard`: localized dashboard with bookings, revenue, payout, inventory, refunds, cancellation rate, and chart cards.
- `/partner/services`: service management and inventory entry points.
- `/partner/bookings`: booking management.
- `/partner/revenue`: gross, platform fee, and net revenue.
- `/partner/wallet`: partner wallet and commission summary.
- `/partner/refunds`: approve or reject refund requests with reason and hash visibility.
- `/partner/notifications`: booking, refund, payout, and settlement notifications.

## Admin Routes

- `/admin/dashboard`: platform overview.
- `/admin/users`: traveler/user management.
- `/admin/partners`: partner management.
- `/admin/services`: approve or reject services.
- `/admin/bookings`: all booking records.
- `/admin/revenue`: platform revenue.
- `/admin/refunds`: refund oversight, manual processing, rejection override, wallet transaction audit, and refund hash inspection.
- `/admin/logs`: audit logs.

## Role-Based Redirects

- Guest selecting partner access: `/login?role=partner`.
- Traveler login success: `/explore`.
- Partner login success: `/partner/dashboard`.
- Admin login success: `/admin/dashboard`.
- Traveler account opening partner access: modal explains that a partner account is required.
- Partner routes require partner role. Admin routes require admin role. Traveler account routes are limited to traveler/admin where appropriate.

## Install

```bash
npm install
```

## Environment

Create `.env` from `.env.example`:

```env
PORT=5050
CLIENT_ORIGIN=http://localhost:5173
VITE_API_PROXY_TARGET=http://127.0.0.1:5050
MONGODB_URI=mongodb://127.0.0.1:27017/travchain
JWT_SECRET=change-this-secret-before-production
```

## Run

Run frontend only:

```bash
npm run client:dev
```

Run backend only:

```bash
npm run server:dev
```

Run both:

```bash
npm run dev
```

Seed database:

```bash
npm run seed
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

Run the Vietnamese UI language QA helper:

```bash
npm run i18n:qa
```

## Local Troubleshooting

### PowerShell blocks `npm`

If PowerShell shows `npm.ps1 cannot be loaded because running scripts is disabled`, use:

```powershell
npm.cmd run dev
```

The same applies to other commands:

```powershell
npm.cmd run seed
npm.cmd test
npm.cmd run build
```

If PowerShell blocks `npx`, use the `.cmd` command too:

```powershell
npx.cmd tsc --noEmit
```

### Do not run `App.tsx` with Python

`src/app/App.tsx` is a React TypeScript file. Do not use VS Code's **Run Python File** button on it. Python will fail with `SyntaxError: invalid syntax` at the first React import.

Run the app through Vite instead:

```powershell
npm.cmd run dev
```

Then open the frontend URL printed by Vite, usually:

```txt
http://localhost:5173
```

### Frontend port changes to 5174 or 5175

Vite automatically chooses another port when `5173` is already busy. Open the exact URL printed in the terminal, for example:

```txt
http://localhost:5175
```

### Backend port 5050 is already in use

TravChain uses backend port `5050`. If a TravChain API is already running there, the new backend process will reuse it instead of crashing.

Check the API:

```txt
http://127.0.0.1:5050/api/health
```

If another application is using `5050`, either stop that application or change the backend port in `.env`:

```env
PORT=5051
VITE_API_PROXY_TARGET=http://127.0.0.1:5051
```

Then restart:

```powershell
npm.cmd run dev
```

### Protected API links return `Missing token`

Routes such as `/api/bookings/my`, `/api/auth/me`, `/api/admin/dashboard`, and `/api/partner/dashboard` require login. Use the app login flow or call the API with a Bearer token.

## API Proxy

Frontend code should call relative API paths such as:

```txt
/api/services
/api/bookings
/api/auth/login
```

Vite forwards `/api/*` to `VITE_API_PROXY_TARGET`, which defaults to `http://127.0.0.1:5050`.

## Main API Groups

- `GET /api/health`
- `/api/auth`
- `/api/services`
- `/api/reviews`
- `/api/refunds`
- `/api/cart`
- `/api/bookings`
- `/api/payments`
- `/api/payment-sources`
- `/api/wallet`
- `/api/assistant`
- `/api/exchange-rate`
- `/api/notifications`
- `/api/partner`
- `/api/passport`
- `/api/membership`
- `/api/admin`

Full API details: [docs/api.md](docs/api.md)

## TravChain Assistant API

`POST /api/assistant/chat` powers the in-app booking assistant. The frontend sends the message, selected language, optional user ID, and route/session context:

```json
{
  "message": "Tối nay Đà Nẵng có phim gì?",
  "language": "vi",
  "userId": "optional-user-id",
  "context": {
    "currentRoute": "/services/cinema",
    "selectedCity": "Đà Nẵng",
    "selectedDate": "today",
    "cartItems": [],
    "userRole": "traveler"
  }
}
```

The API normalizes Vietnamese text, detects city/category/date words, queries MongoDB services, and returns a structured response for chat cards and expanded workspace panels:

```json
{
  "intent": "cinema_showtimes",
  "answer": "Short localized assistant answer",
  "confidence": 0.86,
  "items": [],
  "followUps": [],
  "actions": [],
  "filters": [],
  "emptyStateType": null
}
```

Supported intent groups include cinema showtimes, provider search, hotels, homestays, attractions, local tours, events, restaurants, transport, destination recommendations, itinerary planning, budget/family/couple/weekend trip planning, booking status, cancellation, refunds, wallet, payment methods, Travel Passport, membership, partner help, and fallback discovery.

## Documentation

- [API Design](docs/api.md)
- [Database Design](docs/database.md)
- [User Flow](docs/user-flow.md)
- [Deployment Guide](docs/deployment.md)

## i18n QA

The app keeps visible UI labels in JSON dictionaries:

- `src/locales/vi/common.json` and `src/locales/en/common.json`
- `src/locales/vi/traveler.json` and `src/locales/en/traveler.json`
- `src/locales/vi/partner.json` and `src/locales/en/partner.json`
- `src/locales/vi/admin.json` and `src/locales/en/admin.json`
- `src/locales/vi/wallet.json` and `src/locales/en/wallet.json`
- `src/locales/vi/booking.json` and `src/locales/en/booking.json`
- `src/locales/vi/assistant.json` and `src/locales/en/assistant.json`

Use `npm run i18n:qa` to check locale key parity and scan `src/**/*.ts` and `src/**/*.tsx` for likely hardcoded visible UI strings. Warnings may include route paths, CSS class names, seed place names, or allowed product terms; failures mean missing locale files or missing language keys.

## Encoding Safety

TravChain stores Vietnamese UI text as UTF-8 without BOM. Correct labels should render as `Tổng quan`, `Nguồn thanh toán`, `Hoàn tiền`, and `Dịch vụ`.

Do not commit mojibake or replacement-character output. The development helper `detectBrokenVietnamese(text)` checks common broken UTF-8 signatures by code point, and `warnBrokenVietnamese(...)` logs warnings in development without blocking the UI.

Encoding expectations:

- `index.html` declares `<meta charset="UTF-8" />`.
- Express JSON responses use `application/json; charset=utf-8`.
- Locale, seed, mock, notification, wallet, booking, refund, review, partner, admin, and assistant text files stay UTF-8 without BOM.
- The app font stack is `"Be Vietnam Pro", "Inter", "Noto Sans", system-ui, sans-serif`.

## Deployment Summary

- Frontend: Vercel or Netlify.
- Backend: Render, Railway, or Fly.io.
- Database: MongoDB Atlas.
- Build command: `npm run build`
- Backend start command: `npm run start`
- Required production env: `CLIENT_ORIGIN`, `MONGODB_URI`, `JWT_SECRET`, `PORT`.

## Notes

The blockchain, NFT membership, and payment gateway parts are simulated in this MVP through hashes, membership token IDs, and payment records. The code is structured so those parts can later be replaced with real on-chain transactions, NFT membership contracts, and a production payment provider.

Seed data generates 80 approved services across Da Nang, Hoi An, Hue, Ha Noi, Ho Chi Minh, Ninh Binh, Sa Pa, Ha Giang, Phong Nha, Da Lat, Phu Quoc, and Nha Trang. Categories include cinema, hotel, homestay, attraction, event, local tour, restaurant, and transport, with brands and destinations such as CGV, Lotte, Galaxy, Beta, Cinestar, Ba Na Hills, Hoi An, Hue, Trang An, Fansipan, Phong Nha, VinWonders, Lo Lo Chai, Quynh Son, Bay Mau, and food/community tours.

Seeded traveler wallets use PIN `1234` for wallet payment, withdrawal, and conversion testing.
