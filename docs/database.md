# TravChain Database Design

MongoDB is modeled with Mongoose. All major schemas use timestamps.

## User

- `name`: String, required.
- `email`: String, required, unique, indexed.
- `passwordHash`: String, required.
- `role`: traveler, partner, admin. Default traveler.
- `status`: active or locked. Default active.
- `companyName`: partner profile field.
- `phone`: optional contact field.

## Category

- `name`: String, required.
- `slug`: String, required, unique.
- `type`: hotel, homestay, attraction, cinema, event, local_tour, restaurant, transport.
- `isActive`: Boolean.

## Service

- `type`: indexed service type.
- `categoryId`: references Category.
- `title`, `province`, `location`, `destination`.
- `priceVnd`, `priceUsd`: Number.
- `rating`, `reviewCount`.
- `inventory`, `availability`: Number.
- `duration`.
- `imageUrl`, `coverImage`, `gallery`.
- `description`, `detail`.
- `highlights`, `tags`: String arrays.
- `sustainabilityScore`.
- `isFeatured`.
- `status`: draft, pending, approved, rejected, archived.
- `partnerId`: references User.
- Text index: title, location, destination, description.

## Cart

- `userId`: references User, unique.
- `items`: serviceId, quantity, guests, date.

## Booking

- `userId`: references User.
- `bookingCode`: unique business code.
- `items`: embedded booking item snapshots.
- `totalVnd`.
- `displayCurrency`.
- `exchangeRateVndPerUsd`.
- `paymentMethod`: wallet, card, qr.
- `paymentStatus`: pending, paid, failed, refunded, cancelled.
- `reconciliationStatus`: pending, ready, paid.
- `transactionHash`: unique simulated blockchain hash.

## BookingItem

Separate collection for reporting and partner analytics.

- `bookingId`, `serviceId`, `partnerId`.
- Snapshot fields: title, type, location, price.
- `quantity`, `guests`, `date`.

## Payment

- `userId`, `bookingId`.
- `amountVnd`.
- `method`.
- `status`.
- `provider`.
- `transactionHash`.

## PaymentSource

- `userId`: references User, indexed.
- `type`: bank, card, domestic_qr, crypto_wallet.
- `providerName`.
- `maskedNumber`.
- `last4`.
- `currency`: VND, USD, USDT.
- `isPrimary`: only one active source should be primary per user.
- `status`: active or disabled.

## Wallet

- `userId`: references User, unique.
- `vndBalance`, `usdBalance`, `usdtBalance`.
- `pendingBalance`.
- `rewardPoints`.
- `membershipTier`.
- `defaultPaymentSourceId`: references PaymentSource.
- `pinHash`: bcrypt hash for wallet PIN.

## WalletTransaction

- `userId`, `walletId`.
- `bookingId`: optional.
- `paymentSourceId`: optional.
- `type`: deposit, withdraw, convert, booking_payment, refund, reward, fee.
- `amount`, `currency`.
- `status`: pending, processing, completed, failed, cancelled, expired.
- `description`.
- `transactionHash`.
- `referenceCode`.
- `metadata`.

## PartnerWallet

- `partnerId`: references User, unique.
- `availableBalance`.
- `pendingBalance`.
- `totalRevenue`.

## TransactionLog

- `userId`, `bookingId`, `paymentId`.
- `type`, `status`, `hash`, `payload`.

## Passport

- `userId`.
- `passportCode`.
- `stampCount`.
- `lastTripAt`.

## PassportStamp

- `userId`, `bookingId`, `serviceId`.
- Snapshot fields.
- `stampHash`.
- `usedAt`.

## Membership

- `userId`.
- `tier`.
- `tokenId`.
- `walletAddress`.
- `points`.
- `perks`.

## Review

- `userId`, `serviceId`, `bookingId`.
- `rating`, `comment`, `status`.

When a review is created or updated, service `rating` and `reviewCount` are recalculated.

## Reconciliation

- `partnerId`, `bookingId`.
- `grossVnd`.
- `platformFeeRate`.
- `platformFeeVnd`.
- `netVnd`.
- `status`.
- `paidAt`.

## AdminLog

- `adminId`.
- `action`.
- `targetType`.
- `targetId`.
- `metadata`.

## Notification

- `userId`: references User.
- `title`.
- `message`.
- `type`: booking, refund, partner, system, wallet.
- `readStatus`: unread or read.
