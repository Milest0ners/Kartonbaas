export const ADMIN_AUTH_COOKIE = 'kartonbaas_admin_auth';

export function getAdminPassword(): string {
  return process.env.ADMIN_DASHBOARD_PASSWORD ?? process.env.ADMIN_DASHBOARD_TOKEN ?? '';
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionToken(expectedPassword: string): Promise<string> {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? expectedPassword;
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = toBase64Url(nonceBytes);
  const payload = `v1.${expiresAt}.${nonce}`;
  const signature = await signValue(payload, sessionSecret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined, expectedPassword: string): Promise<boolean> {
  if (!token || !expectedPassword) return false;
  const [version, expiresAtRaw, nonce, signature] = token.split('.');
  if (!version || !expiresAtRaw || !nonce || !signature) return false;
  if (version !== 'v1') return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  try {
    fromBase64Url(nonce);
  } catch {
    return false;
  }
  const payload = `${version}.${expiresAtRaw}.${nonce}`;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? expectedPassword;
  const expectedSignature = await signValue(payload, sessionSecret);
  return timingSafeEqual(signature, expectedSignature);
}

