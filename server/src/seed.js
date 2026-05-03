import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDb } from './config/db.js';
import { AdminLog } from './models/AdminLog.js';
import { Booking } from './models/Booking.js';
import { BookingItem } from './models/BookingItem.js';
import { Cart } from './models/Cart.js';
import { Category } from './models/Category.js';
import { Membership } from './models/Membership.js';
import { Passport } from './models/Passport.js';
import { Payment } from './models/Payment.js';
import { PaymentSource } from './models/PaymentSource.js';
import { Notification } from './models/Notification.js';
import { PartnerWallet } from './models/PartnerWallet.js';
import { Reconciliation } from './models/Reconciliation.js';
import { Refund } from './models/Refund.js';
import { Review } from './models/Review.js';
import { Service } from './models/Service.js';
import { TransactionLog } from './models/TransactionLog.js';
import { TravelPassportStamp } from './models/TravelPassportStamp.js';
import { User } from './models/User.js';
import { Wallet } from './models/Wallet.js';
import { WalletTransaction } from './models/WalletTransaction.js';
import { seedCategories, seedServices } from './data/seedData.js';

process.env.JWT_SECRET ||= 'travchain-local-dev-secret';

function txHash(value) {
  return `0x${crypto.createHash('sha256').update(value).digest('hex')}`;
}

await connectDb();

await Promise.all([
  AdminLog.deleteMany({}),
  Booking.deleteMany({}),
  BookingItem.deleteMany({}),
  Cart.deleteMany({}),
  Category.deleteMany({}),
  Membership.deleteMany({}),
  Passport.deleteMany({}),
  Payment.deleteMany({}),
  PaymentSource.deleteMany({}),
  Notification.deleteMany({}),
  PartnerWallet.deleteMany({}),
  Reconciliation.deleteMany({}),
  Refund.deleteMany({}),
  Review.deleteMany({}),
  Service.deleteMany({}),
  TransactionLog.deleteMany({}),
  TravelPassportStamp.deleteMany({}),
  User.deleteMany({}),
  Wallet.deleteMany({}),
  WalletTransaction.deleteMany({}),
]);

const passwordHash = await bcrypt.hash('123456', 10);
const pinHash = await bcrypt.hash('1234', 10);

const [admin, travelerA, travelerB, partnerA, partnerB] = await User.insertMany([
  { name: 'Admin TravChain', email: 'admin@travchain.vn', passwordHash, role: 'admin' },
  { name: 'Demo Traveler', email: 'demo@travchain.vn', passwordHash, role: 'traveler' },
  { name: 'Linh Nguyen', email: 'linh@travchain.vn', passwordHash, role: 'traveler' },
  { name: 'Central Vietnam Partner', email: 'partner@travchain.vn', passwordHash, role: 'partner', companyName: 'Central Vietnam Travel Co.' },
  { name: 'Local Culture Partner', email: 'local@travchain.vn', passwordHash, role: 'partner', companyName: 'Local Culture Studio' },
]);

const categories = await Category.insertMany(seedCategories);
const categoryMap = new Map(categories.map((category) => [category.type, category._id]));

const services = await Service.insertMany(seedServices.map((service, index) => ({
  ...service,
  categoryId: categoryMap.get(service.type),
  partnerId: index % 2 === 0 ? partnerA._id : partnerB._id,
  status: 'approved',
})));

const [travelerAWallet, travelerBWallet] = await Wallet.insertMany([
  {
    userId: travelerA._id,
    vndBalance: 20000000,
    usdBalance: 420,
    usdtBalance: 120,
    rewardPoints: 2480,
    membershipTier: 'Explorer Plus',
    pinHash,
  },
  {
    userId: travelerB._id,
    vndBalance: 8500000,
    usdBalance: 180,
    usdtBalance: 40,
    rewardPoints: 820,
    membershipTier: 'Explorer',
    pinHash,
  },
]);

const sources = await PaymentSource.insertMany([
  {
    userId: travelerA._id,
    type: 'domestic_qr',
    providerName: 'VietQR',
    maskedNumber: 'VietQR **** 2026',
    last4: '2026',
    currency: 'VND',
    isPrimary: true,
  },
  {
    userId: travelerA._id,
    type: 'card',
    providerName: 'Visa',
    maskedNumber: 'Visa **** 4242',
    last4: '4242',
    currency: 'USD',
  },
  {
    userId: travelerB._id,
    type: 'bank',
    providerName: 'VCB',
    maskedNumber: 'VCB **** 7788',
    last4: '7788',
    currency: 'VND',
    isPrimary: true,
  },
]);
travelerAWallet.defaultPaymentSourceId = sources[0]._id;
travelerBWallet.defaultPaymentSourceId = sources[2]._id;
await Promise.all([travelerAWallet.save(), travelerBWallet.save()]);

await PartnerWallet.insertMany([
  { partnerId: partnerA._id, availableBalance: 12600000, pendingBalance: 0, totalRevenue: 68000000 },
  { partnerId: partnerB._id, availableBalance: 9400000, pendingBalance: 0, totalRevenue: 51000000 },
]);

await Membership.insertMany([
  {
    userId: travelerA._id,
    tier: 'Explorer Plus',
    tokenId: `TRAV-${travelerA._id.toString().slice(-8)}`,
    points: 2480,
    perks: ['Priority deals', '2x passport points'],
  },
  {
    userId: travelerB._id,
    tier: 'Explorer',
    tokenId: `TRAV-${travelerB._id.toString().slice(-8)}`,
    points: 820,
    perks: ['Member-only deals'],
  },
]);

await Passport.insertMany([
  { userId: travelerA._id, passportCode: `TP-${travelerA._id.toString().slice(-8).toUpperCase()}`, stampCount: 3, lastTripAt: new Date() },
  { userId: travelerB._id, passportCode: `TP-${travelerB._id.toString().slice(-8).toUpperCase()}`, stampCount: 2, lastTripAt: new Date() },
]);

for (let index = 0; index < 5; index += 1) {
  const traveler = index % 2 === 0 ? travelerA : travelerB;
  const service = services[index];
  const quantity = index % 2 === 0 ? 1 : 2;
  const totalVnd = service.priceVnd * quantity;
  const hash = txHash(`${traveler.email}:${service._id}:${Date.now()}:${index}`);
  const booking = await Booking.create({
    userId: traveler._id,
    bookingCode: `TC-SEED-${String(index + 1).padStart(3, '0')}`,
    items: [{
      serviceId: service._id,
      partnerId: service.partnerId,
      titleSnapshot: service.title,
      typeSnapshot: service.type,
      locationSnapshot: service.location,
      priceVndSnapshot: service.priceVnd,
      quantity,
      guests: quantity,
      date: new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
    }],
    totalVnd,
    paymentMethod: index % 3 === 0 ? 'wallet' : index % 3 === 1 ? 'qr' : 'card',
    paymentStatus: 'paid',
    status: index < 2 ? 'completed' : 'confirmed',
    reconciliationStatus: 'ready',
    transactionHash: hash,
  });

  await BookingItem.create({ ...booking.items[0].toObject?.() || booking.items[0], bookingId: booking._id });
  const platformFeeVnd = Math.round(totalVnd * 0.08);
  await Reconciliation.create({
    partnerId: service.partnerId,
    bookingId: booking._id,
    grossVnd: totalVnd,
    platformFeeVnd,
    netVnd: totalVnd - platformFeeVnd,
    status: index === 4 ? 'pending' : 'ready',
  });
  await PartnerWallet.findOneAndUpdate(
    { partnerId: service.partnerId },
    { $inc: { pendingBalance: totalVnd - platformFeeVnd, totalRevenue: totalVnd } },
    { upsert: true },
  );
  await Payment.create({
    userId: traveler._id,
    bookingId: booking._id,
    amountVnd: totalVnd,
    method: booking.paymentMethod,
    status: 'succeeded',
    transactionHash: hash,
  });
  await TransactionLog.create({
    userId: traveler._id,
    bookingId: booking._id,
    type: 'seed.booking',
    status: 'succeeded',
    hash,
    payload: { bookingCode: booking.bookingCode },
  });
  await WalletTransaction.create({
    userId: traveler._id,
    walletId: traveler._id.equals(travelerA._id) ? travelerAWallet._id : travelerBWallet._id,
    bookingId: booking._id,
    type: 'booking_payment',
    amount: totalVnd,
    currency: 'VND',
    status: 'completed',
    description: `Seed booking payment ${booking.bookingCode}`,
    transactionHash: hash,
    referenceCode: `WT-SEED-${String(index + 1).padStart(3, '0')}`,
  });
  await Notification.create({
    userId: traveler._id,
    title: 'Booking confirmed',
    message: `${booking.bookingCode} is stored in Travel Passport.`,
    type: 'booking',
  });
  await Notification.create({
    userId: service.partnerId,
    title: 'New booking received',
    message: `${booking.bookingCode} is ready for reconciliation.`,
    type: 'partner',
  });
  await TravelPassportStamp.create({
    userId: traveler._id,
    bookingId: booking._id,
    serviceId: service._id,
    type: service.type,
    titleSnapshot: service.title,
    locationSnapshot: service.location,
    stampHash: txHash(`${booking._id}:${service._id}:stamp`),
    usedAt: booking.items[0].date,
  });
}

await AdminLog.create({
  adminId: admin._id,
  action: 'seed.completed',
  targetType: 'System',
  metadata: { services: services.length },
});

await Review.insertMany(services.slice(0, 12).map((service, index) => ({
  userId: index % 2 === 0 ? travelerA._id : travelerB._id,
  serviceId: service._id,
  rating: 4 + (index % 2),
  comment: `Verified TravChain review for ${service.title}.`,
  status: 'published',
})));

console.log('Seed completed');
console.log('Admin: admin@travchain.vn / 123456');
console.log('Traveler: demo@travchain.vn / 123456');
console.log('Partner: partner@travchain.vn / 123456');
process.exit(0);
