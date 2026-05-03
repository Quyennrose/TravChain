import crypto from 'crypto';

export function createHash(value) {
  return `0x${crypto.createHash('sha256').update(String(value)).digest('hex')}`;
}

export function referenceCode(prefix) {
  return `${prefix}-${Date.now().toString().slice(-8)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
