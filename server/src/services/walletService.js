import bcrypt from 'bcryptjs';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { createHash, referenceCode } from '../utils/hash.js';

export const balanceField = {
  VND: 'vndBalance',
  USD: 'usdBalance',
  USDT: 'usdtBalance',
};

export async function getOrCreateWallet(userId) {
  return Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true },
  );
}

export async function requireWalletPin(wallet, pin) {
  if (!wallet.pinHash) {
    const error = new Error('Wallet PIN has not been set');
    error.statusCode = 403;
    throw error;
  }
  const ok = await bcrypt.compare(String(pin || ''), wallet.pinHash);
  if (!ok) {
    const error = new Error('Invalid wallet PIN');
    error.statusCode = 403;
    throw error;
  }
}

export async function createWalletTransaction({
  userId,
  walletId,
  bookingId,
  paymentSourceId,
  type,
  amount,
  currency,
  status = 'completed',
  description = '',
  metadata = {},
}) {
  const reference = referenceCode(type.toUpperCase().replace('_', '-'));
  const transactionHash = createHash(`${userId}:${walletId}:${bookingId || ''}:${type}:${amount}:${currency}:${reference}`);
  return WalletTransaction.create({
    userId,
    walletId,
    bookingId,
    paymentSourceId,
    type,
    amount,
    currency,
    status,
    description,
    transactionHash,
    referenceCode: reference,
    metadata,
  });
}

export function ensureSufficientBalance(wallet, currency, amount) {
  const field = balanceField[currency];
  if (!field) {
    const error = new Error(`Unsupported wallet currency ${currency}`);
    error.statusCode = 400;
    throw error;
  }
  if (wallet[field] < amount) {
    const error = new Error('Insufficient wallet balance');
    error.statusCode = 409;
    throw error;
  }
  return field;
}
