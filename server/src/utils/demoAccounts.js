import bcrypt from 'bcryptjs';
import { PartnerWallet } from '../models/PartnerWallet.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';

const demoUsers = [
  { name: 'Admin TravChain', email: 'admin@travchain.vn', role: 'admin' },
  { name: 'Demo Traveler', email: 'demo@travchain.vn', role: 'traveler' },
  { name: 'Linh Nguyen', email: 'linh@travchain.vn', role: 'traveler' },
  {
    name: 'Central Vietnam Partner',
    email: 'partner@travchain.vn',
    role: 'partner',
    companyName: 'Central Vietnam Travel Co.',
    acceptsInternationalCard: true,
    settlementCurrency: 'VND',
  },
  {
    name: 'Local Culture Partner',
    email: 'local@travchain.vn',
    role: 'partner',
    companyName: 'Local Culture Studio',
    acceptsInternationalCard: true,
    settlementCurrency: 'USD',
  },
];

export async function ensureDemoAccounts() {
  if (process.env.NODE_ENV === 'production' || process.env.DEMO_ACCOUNTS_ENABLED === 'false') return;

  const passwordHash = await bcrypt.hash('123456', 10);
  const pinHash = await bcrypt.hash('1234', 10);
  const users = [];

  for (const demo of demoUsers) {
    const user = await User.findOneAndUpdate(
      { email: demo.email },
      { $set: { ...demo, passwordHash, status: 'active' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    users.push(user);
  }

  for (const user of users.filter((item) => item.role === 'traveler')) {
    await Wallet.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          vndBalance: user.email === 'demo@travchain.vn' ? 20000000 : 8500000,
          rewardPoints: user.email === 'demo@travchain.vn' ? 2480 : 820,
          membershipTier: user.email === 'demo@travchain.vn' ? 'Explorer Plus' : 'Explorer',
          pinHash,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  for (const user of users.filter((item) => item.role === 'partner')) {
    await PartnerWallet.findOneAndUpdate(
      { partnerId: user._id },
      {
        $setOnInsert: {
          partnerId: user._id,
          availableBalance: 0,
          pendingBalance: 0,
          totalRevenue: 0,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
}
