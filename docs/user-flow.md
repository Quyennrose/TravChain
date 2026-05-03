# TravChain User Flow

## Traveler Flow

1. Landing page.
2. Select language and currency.
3. Search by destination, travel date, and guest count.
4. Filter by service type: hotel, homestay, attraction, cinema, event, or local tour.
5. Open service detail.
6. Add service to cart.
7. Update quantity, guests, or date.
8. Checkout.
9. Select payment method: domestic QR, international card, or TravChain Wallet.
10. Confirm booking.
11. Backend creates booking code, QR payload, simulated transaction hash, payment record, passport stamp, membership points, and partner reconciliation.
12. Traveler views booking history and Travel Passport.

## Partner Flow

1. Partner logs in.
2. Opens partner dashboard.
3. Adds or edits service.
4. Service waits for admin approval unless created by admin.
5. Partner updates inventory.
6. Traveler books partner service.
7. Partner sees booking, revenue, reconciliation status, and transaction hash.
8. Partner exports booking report as JSON or CSV.

## Admin Flow

1. Admin logs in.
2. Opens admin dashboard.
3. Reviews pending services.
4. Approves or rejects service.
5. Manages users and partners.
6. Locks or unlocks accounts.
7. Monitors bookings and platform revenue.
8. Reviews admin logs.
