export function ensureJwtSecret() {
  if (process.env.JWT_SECRET) return;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }

  process.env.JWT_SECRET = 'travchain-local-dev-secret';
}
