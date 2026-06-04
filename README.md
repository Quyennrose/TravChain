# TravChain - All Travel One Tap

TravChain is a full-stack Web2.5 travel ecosystem platform for Vietnam. It combines booking marketplace, smart travel wallet, Travel Passport identity, refund operations, AI concierge, and partner SaaS tooling in one product surface. It supports three roles:

- **Traveler**: search, compare, build trips, book, pay, receive QR-style receipts, manage refunds, and grow Travel Passport history.
- **Partner**: manage services, inventory, bookings, revenue, payout timeline, refunds, disputes, analytics, and exports.
- **Admin**: manage users, partners, service approvals, bookings, platform revenue, and audit logs.

The MVP uses real API calls, MongoDB persistence, JWT authentication, role-based access control, simulated payment, simulated transaction hash, membership points, and Travel Passport stamps.
Wallet is now a first-class travel credit module. Traveler UI uses VND as the main "Tín dụng du lịch" balance, supports linked bank accounts, domestic QR, card payment sources, refund credits, reward points, PIN security, booking payment integration, transaction history, partner payout tracking, and admin revenue controls. Crypto/USDT balances are not shown in the customer wallet; Hash remains a transparent receipt record.

The traveler UI is route-based instead of one long page. Landing, discovery, service ecosystem, category flows, service detail, cart, checkout, trip dashboard, QR receipt, Travel Passport, wallet, and profile each have a dedicated screen.
The current brand asset lives at `public/travchain-logo.svg` and is used for the site logo, assistant identity, workspace logo, footer logo, and favicon.
The latest traveler polish redesigns TravChain as a mobile-first travel super app: the homepage is reduced to hero search, trending searches, service grid, featured destinations, recommended services, AI suggestions, trip inspiration, and footer.
The marketplace theme now uses a warm-light palette with dark navy contrast, quiet premium cards, connected booking steps, featured verified reviews, and clearer booking detail/refund surfaces.
Partner/admin workspaces share the global language switch and use dedicated dictionaries in `src/locales/vi/partner.json` and `src/locales/en/partner.json`.
Visible UI copy is centralized in locale dictionaries under `src/locales/{vi,en}` for common, traveler, partner, admin, wallet, booking, and assistant surfaces.
Source, locale, seed, and documentation files should stay UTF-8 without BOM so Vietnamese text renders correctly across the app.

## Production UX Direction

TravChain is moving from MVP screens toward a premium travel marketplace experience:

- Brand terms stay untranslated across UI and docs: TravChain, All Travel One Tap, Travel Passport, QR, NFT, Hash, VND, USD, CGV, Lotte, Galaxy, Beta, and Cinestar.
- Traveler pages use a warm-light marketplace palette: `#F8F4EC` background, `#FFFFFF` cards, `#FF6A00` primary orange, `#071326` dark navy, `#E8E2D8` borders, `#14B8A6` trust accent, and `#667085` muted text.
- The landing hero stays cinematic and quiet: AI-powered glass search, rotating query placeholders, one lightweight trending row, and no duplicated category chips.
- The homepage service grid is a clean 2-column mobile-first grid with eight primary services: movie tickets, hotels & homestays, attraction tickets, local tours, flights, transport, local dining, and trip bundles.
- The Service Hub at `/services` is a category-first ecosystem dashboard with tabs, smart filters, city filters, partner filters, sorting, and featured collections. It does not show random mixed cards before category context.
- The `/services` page must render without runtime exceptions in both languages. Service Hub labels, sorting options, category tabs, and airport transfer copy are read through the active language context so Vietnamese mode does not show stray English labels except approved brand terms.
- TravChain Assistant supports compact chat and expanded workspace modes. It calls `/api/assistant/chat`, detects booking and support intents across cinema, hotels, homestays, attractions, tours, events, restaurants, transport, flights, buses, trains, airport transfer, trip packages, itinerary, budget, family, couple, weekend, booking status, cancellation, refunds, wallet, bank linking, partner payment, payment methods, Travel Passport, membership, and partner help, then returns real service cards, filters, actions, follow-up chips, and booking CTAs.
- Service cards are unified premium listings with large imagery, one category badge, title, location, rating, review count, price, availability, wishlist affordance, and one clear CTA. Cards intentionally avoid excessive chips.
- Explore and destination pages use city-first storytelling, including local culture, food highlights, hidden gems, trending trips, attractions, stays, tours, events, and a map teaser.
- Search includes recent/trending destination suggestions such as Da Nang, Hoi An Lantern Festival, CGV Vincom, and Sa Pa Local Tour.
- Review surfaces include avatar, country, verified booking badge, date, helpful count, optional image, average score, and rating distribution bars.
- Checkout uses VND totals by default with a connected booking stepper from search through QR receipt and Travel Passport. Optional USD reference/card display appears only when a service or partner supports international card settlement.
- Post-booking surfaces continue the trip instead of ending at payment: upcoming/current/completed trips, trip timeline, countdown/weather-ready dashboard slots, QR check-in, smart reminders, cancellation support, refund support, and Travel Passport update.
- Travel Passport is treated as a premium travel identity: dark wallet-style card, membership tier, loyalty progress, collectible badges, QR stamps, verified stays, city badges, completed booking reviews, and blockchain hash history.
- Wallet surfaces use a fintech-style VND travel credit card, bank linking, payment source management, transaction categories, refund timeline, reward points, and Hash-backed receipt records.
- Refund Center surfaces show status timelines, refund method, refund amount, refund ETA, protected booking policy, partial refund support, and Hash-backed refund records.
- Partner dashboard is shaped like a modern SaaS workspace with analytics, revenue charts, booking trends, payout timeline, inventory alerts, refund/dispute signals, conversion, occupancy, and AI recommendations.
- Mobile navigation is sticky at the bottom with six main destinations: Home, Services, Bookings, Wallet, Passport, and Account.
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

## Gemini Assistant

TravChain Assistant uses Gemini for final chat answers while grounding responses in TravChain service and demo data. Add your Gemini key to `.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=12000
```

If `GEMINI_API_KEY` is missing, the API falls back to deterministic TravChain answers and still returns service cards, filters, and CTAs.

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
- Category booking flows for cinema, stays, attractions, events, local tours, restaurants, flights, transport, and trip packages.
- Service Hub at `/services` is category-first: stays, cinema, attractions, local tours, restaurants, trip packages, transport, flights, airport transfer, bus/shuttle, train, and events show clear descriptions, CTAs, smart filters, sorting, and featured service collections instead of a random mixed grid.
- Destination category cards are clickable and route into filtered service pages, for example `/services/stays?province=Da%20Nang`, `/services/tours?province=Da%20Nang`, and `/services/transport?province=Da%20Nang`.
- Booking history uses travel-app tabs for upcoming, current, completed, and refunds. Each booking card includes an image, QR receipt link, payment status, refund/support CTA, trip timeline, and receipt Hash visibility.
- Wallet uses VND travel credits as the customer-facing balance, with linked bank accounts, domestic QR, card payment sources, refund credits, reward points, wallet PIN, transaction detail, and wallet checkout.
- Checkout supports TravChain Wallet, domestic QR, and international card only when the service or partner supports it. Each successful booking creates a booking code, simulated transaction hash, QR receipt payload, success modal, and `/receipt/:bookingCode` receipt page.
- Travel Passport stamps now support all service categories: `cinema`, `hotel`, `homestay`, `attraction`, `event`, `local_tour`, `restaurant`, `transport`, `flight`, `trip`, plus `booking` and `reward`, with premium passport identity, QR stamp, city badge, loyalty progress, and hash history surfaces.
- Reviews support featured verified review cards, `GET /api/reviews/featured`, service reviews, and protected review creation for completed bookings only.
- Cancellation/refund flow supports `POST /api/bookings/:id/cancel`, `POST /api/refunds`, traveler refund history, partner refund approval/rejection, admin refund processing, wallet refund transactions, refund hashes, notifications, and inventory restoration for eligible cancellations.
- Partner dashboard includes localized metrics, refund/cancellation signals, low-inventory signal, notification badge, revenue charts for 7-day, 30-day, and service-level views, conversion rate, occupancy analytics, payout timeline, dispute center, and AI recommendation cards.
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

- `/`: mobile-first landing page with cinematic hero search, rotating AI placeholders, trending searches, 2-column service grid, featured destinations, recommended services, AI suggestions, trip inspiration, Passport teaser, and partner CTA.
- `/explore`: city storytelling, local highlights, food recommendations, hidden gems, and trending trip entry points.
- `/services`: service ecosystem hub with category tabs, city/provider filters, sorting, featured collections, and no random mixed cards before filtering.
- `/services/cinema`: provider-first cinema flow for CGV, Lotte, Galaxy, Beta, and Cinestar before location/movie/time inventory.
- `/services/stays`: hotel/homestay inventory by province and stay type.
- `/services/attractions`: attraction ticket inventory.
- `/services/events`: events and festivals.
- `/services/tours`: local and community tours.
- `/services/restaurants`: local dining, food sets, and restaurant experiences.
- `/services/flights`: flight search by origin, destination, date, passengers, airline, baggage, and seat class.
- `/services/transport`: transport hub for bus, train, airport transfer, private car, and shuttle services.
- `/services/transport/bus`: bus and shuttle routes.
- `/services/transport/train`: train routes.
- `/services/transport/airport-transfer`: airport transfer and shuttle options.
- `/services/trips`: trip packages that combine stays, transport, attraction tickets, local tours, and optional events/cinema.
- `/service/:id`: service gallery, rating, location, price, highlights, cancellation policy, reviews, and booking CTA.
- `/cart` and `/checkout`: booking flow with wallet/card/QR payment.
- `/bookings`: tabs for upcoming, current, completed, and refunds, with trip cards containing image, QR receipt, payment status, refund/support CTA, Passport stamp signal, and timeline.
- `/receipt/:bookingCode`: public QR receipt with transparent booking Hash.
- `/passport`: premium Travel Passport identity with wallet-style card, membership tier, loyalty progress, collectible badges, QR stamps, city badges, and hash verification.
- `/wallet`: travel wallet overview, payment sources, transactions, refunds, and security.

## Partner Routes

- `/partner/dashboard`: SaaS-style dashboard with bookings, revenue, payout, inventory, refunds, cancellation rate, conversion, occupancy, dispute center, AI insight, and chart cards.
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

## Current UI Notes

- The main customer UI is optimized mobile-first. Desktop layouts widen the same hierarchy instead of introducing separate desktop-only workflows.
- Homepage category access is intentionally limited to eight core service tiles to keep the first screen clean.
- The customer-facing wallet is VND-first. USD appears only as international card or partner settlement support, not as a primary wallet balance.
- The service card component is shared across home recommendations, category pages, and service collections, so card density and CTA behavior should stay consistent.
- The bottom navigation is visible only on mobile and routes to `/`, `/services`, `/bookings`, `/wallet`, `/passport`, and `/profile`.
- Bookings, Wallet, and Travel Passport render premium logged-out shells instead of disappearing behind an immediate redirect. Signed-in travelers still get the protected API data.
- Destination routing uses locale-aware destination objects. `/destination/da-nang` displays `Đà Nẵng`, and destination category cards route to `/services/{category}?province=da-nang`.
- The Service Hub depends on `text[language]` inside `ServicesPage`; keep new filter/sort labels in `src/locales/{vi,en}/traveler.json` and run both `npm run build` and `npm run i18n:qa` after changing `/services`.

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

### `/services` renders a blank page

If the Dịch vụ page is blank, check the browser console first. A previous regression was caused by `ServicesPage` reading locale keys such as `sortRecommended` without defining `const t = text[props.language]` in that component scope.

Quick checks:

```powershell
npm.cmd run build
npm.cmd run i18n:qa
```

Then open:

```txt
http://localhost:5173/services
```

The page should show the TravChain Ecosystem hero, category tabs, city/provider filters, sorting, and the Vietnamese label `Đưa đón sân bay` in Vietnamese mode.

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

## Service Architecture

The marketplace service model supports category-specific booking flows:

- `cinema`: provider, city, showtime, price, seats, and verified cinema brand.
- `hotel`, `homestay`, `stay`: province, stay type, price, amenities, availability, and review signals.
- `attraction`: province, ticket type, date, availability, and partner policy.
- `local_tour`: local, food, culture, eco, and community tour inventory.
- `restaurant`: local dining, tasting menus, food sets, and bookable dining experiences.
- `flight`: airline, flight number, origin airport, destination airport, departure/arrival time, baggage, seat class, refundable flag, and optional international card support.
- `transport`: transport type, origin, route destination, departure/arrival labels, seats, and VND pricing for bus, train, airport transfer, private car, and shuttle.
- `trip`: bundled package duration, destination, budget, traveler type, and included hotel/transport/attraction/tour components.

Traveler payment stays VND-first. `acceptsInternationalCard` and `settlementCurrency` allow selected services/partners to show card payment and optional USD reference without making USD a main wallet balance.

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

Supported intent groups include cinema showtimes, provider search, hotels, homestays, attractions, local tours, events, restaurants, flights, bus, train, airport transfer, trip packages, transport discovery, destination recommendations, itinerary planning, budget/family/couple/weekend trip planning, booking status, cancellation, refunds, wallet, bank linking, partner payment, payment methods, Travel Passport, membership, partner help, and fallback discovery.

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

Seed data generates approved services across Da Nang, Hoi An, Hue, Ha Noi, Ho Chi Minh, Ninh Binh, Sa Pa, Ha Giang, Phong Nha, Da Lat, Phu Quoc, and Nha Trang. Categories include cinema, hotel, homestay, attraction, event, local tour, restaurant, transport, flight, and trip packages. The expanded seed set includes at least 20 flight services, 20 transport services, 15 trip packages, 20 restaurant/local dining services, realistic cinema showtimes, realistic stay data, and route-based transport examples such as Da Nang to Hoi An shuttle, Ha Noi to Sa Pa sleeper bus, Da Nang airport transfer, Hue to Da Nang train, and Nha Trang airport shuttle.

Seeded traveler wallets use PIN `1234` for wallet payment and VND travel credit testing. Customer UI hides crypto/USDT balances; Hash remains visible only as a transparent booking/refund receipt record.
