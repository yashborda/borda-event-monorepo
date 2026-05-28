import { createHash, randomBytes } from 'crypto';

/** Generate a cryptographically random URL-safe token (48 bytes → 64 hex chars). */
export function generateToken(): string {
  return randomBytes(48).toString('hex');
}

/** SHA-256 hash of a raw token for safe DB storage. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Generate a refresh token with its hash and a new family ID (for rotation chains). */
export function generateRefreshToken(): {
  raw: string;
  hash: string;
  familyId: string;
} {
  const raw = generateToken();
  const hash = hashToken(raw);
  const familyId = randomBytes(16).toString('hex');
  return { raw, hash, familyId };
}

/** Expiry timestamp helpers */
export function refreshTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

export function magicLinkExpiry(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 15);
  return d;
}

export function passwordResetExpiry(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d;
}

export function emailVerificationExpiry(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d;
}
