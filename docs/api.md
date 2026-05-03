# TravChain REST API

Base URL in local development: `http://127.0.0.1:5050/api`

Use `Authorization: Bearer <token>` for protected routes.

## Health

### GET `/health`

Response `200`:

```json
{ "ok": true, "name": "TravChain API" }
```

## Categories

### GET `/categories`

Returns traveler category routes for cinema, stays, attractions, events, local tours, restaurants, and transport.

## Auth

### POST `/auth/register`

Body:

```json
{
  "name": "Demo Traveler",
  "email": "demo@travchain.vn",
  "password": "123456",
  "role": "traveler"
}
```

Response `201`: `{ "token": "...", "user": {...} }`

Errors: `400` validation, `409` email exists.

### POST `/auth/login`

Body: `{ "email": "demo@travchain.vn", "password": "123456" }`

Response `200`: `{ "token": "...", "user": {...} }`

Errors: `401` invalid credentials, `403` locked account.

### GET `/auth/me`

Protected. Response `200`: current user.

### POST `/auth/logout`

Protected. Stateless logout acknowledgement.

### PATCH `/auth/profile`

Protected. Updates name, phone, companyName.

## Services

### GET `/services`

Query:

- `q`
- `type`
- `providerBrand`
- `province`
- `destination`
- `page`
- `limit`

Supported category aliases:

- `type=cinema`
- `type=stays` maps to hotel, homestay, and stay inventory.
- `type=attraction`
- `type=event`
- `type=local_tour`

Response `200`: `{ "data": [...], "meta": {...} }`

### GET `/services/:id`

Response `200`: service detail.

### GET `/services/:id/reviews`

Response `200`: published reviews for a service.

### POST `/services`

Roles: partner, admin.

Body includes service type, title, location, priceVnd, imageUrl, description, highlights, availability.

Partner-created services default to `pending`. Admin-created services default to `approved`.

### PATCH `/services/:id`

Roles: owner partner, admin.

### DELETE `/services/:id`

Roles: owner partner, admin.

### PATCH `/services/:id/inventory`

Roles: owner partner, admin.

Body: `{ "delta": -1 }` or `{ "availability": 20 }`

### PATCH `/services/:id/status`

Role: admin.

Body: `{ "status": "approved" }`

## Cart

All cart routes require traveler auth.

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

## Bookings

### POST `/bookings`

Role: traveler.

Body:

```json
{
  "items": [
    {
      "serviceId": "...",
      "quantity": 1,
      "guests": 2,
      "date": "2026-05-10"
    }
  ],
  "paymentMethod": "qr",
  "displayCurrency": "VND"
}
```

Response `201`: booking with booking code and transaction hash.

Side effects:

- Decreases inventory.
- Creates payment record.
- Creates booking item records.
- Creates passport stamps.
- Adds membership points.
- Creates partner reconciliation rows.
- Creates transaction log.

Errors: `400` validation, `401` auth, `409` sold out or overbooked.

### GET `/bookings/my`

Traveler booking history.

### GET `/bookings/:id`

Traveler can view own booking. Partner can view bookings containing their services. Admin can view any booking.

### PATCH `/bookings/:id/cancel`

Traveler cancels own booking and inventory is restored.

### GET `/bookings/:id/receipt`

Returns booking code, QR payload, total, status, and transaction hash.

## Payments

- `POST /payments/intent`
- `POST /payments/confirm`
- `GET /payments/:id`

Payments are simulated for MVP and designed to be replaced by a real gateway later.

## Payment Sources

Protected.

- `GET /payment-sources`
- `POST /payment-sources`
- `PATCH /payment-sources/:id/set-primary`
- `DELETE /payment-sources/:id`

Only one active payment source can be primary for a user. Setting a new primary source clears the previous primary source.

## Wallet

Protected.

- `GET /wallet`
- `POST /wallet/set-pin`
- `POST /wallet/verify-pin`
- `GET /wallet/transactions`
- `GET /wallet/transactions/:id`
- `POST /wallet/deposit`
- `POST /wallet/withdraw`
- `POST /wallet/convert`
- `POST /wallet/pay-booking`

Wallet supports VND, USD, USDT, pending balance, reward points, and membership tier. Withdrawal, currency conversion, and wallet booking payment require the wallet PIN.

### POST `/wallet/deposit`

Body:

```json
{
  "amount": 1000000,
  "currency": "VND",
  "paymentSourceId": "..."
}
```

Response `201`: updated wallet and wallet transaction.

### POST `/wallet/convert`

Body:

```json
{
  "fromCurrency": "USD",
  "toCurrency": "VND",
  "amount": 10,
  "pin": "1234"
}
```

Supported pairs: USD to VND, VND to USD, USDT to USD, USDT to VND.

### POST `/wallet/pay-booking`

Role: traveler.

Body:

```json
{
  "pin": "1234",
  "items": [
    {
      "serviceId": "...",
      "quantity": 1,
      "guests": 2,
      "date": "2026-05-10"
    }
  ],
  "displayCurrency": "VND"
}
```

Side effects: checks balance, deducts wallet balance, creates booking, decreases service inventory, creates booking payment transaction, creates QR payload, creates Travel Passport stamps, adds membership points, creates partner reconciliation, updates partner pending wallet balance, and creates notifications.

## Exchange Rate

- `GET /exchange-rate`

Returns mock MVP rates such as `USD_VND = 24500` and `USDT_USD = 1`.

## Notifications

Protected.

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Partner

Roles: partner, admin.

- `GET /partner/dashboard`
- `GET /partner/services`
- `GET /partner/bookings`
- `GET /partner/reconciliation`
- `GET /partner/revenue`
- `GET /partner/export`
- `GET /partner/wallet`
- `POST /partner/payout-request`

Use `?format=csv` on `/partner/export` for CSV.

## Passport

Protected.

- `GET /passport`
- `POST /passport/stamps`
- `GET /passport/stamps`

## Membership

Protected.

- `GET /membership`
- `POST /membership/earn`
- `POST /membership/redeem`

## Admin

Role: admin.

- `GET /admin/dashboard`
- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `GET /admin/partners`
- `GET /admin/services`
- `PATCH /admin/services/:id/approve`
- `PATCH /admin/services/:id/reject`
- `GET /admin/bookings`
- `GET /admin/logs`
- `GET /admin/categories`
- `GET /admin/platform-revenue`
- `GET /admin/commission-report`
- `POST /admin/manual-adjustment`

Partner-created services use `pending_review` until admin approval.
