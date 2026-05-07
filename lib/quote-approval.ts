import { createHash, randomBytes } from 'crypto';

export function hashApprovalToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateApprovalToken(): string {
  return randomBytes(32).toString('base64url');
}

export function isTokenExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}
