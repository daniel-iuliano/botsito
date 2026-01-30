
import crypto from 'crypto';

// In a real Vercel env, this comes from process.env.ENCRYPTION_SECRET
const INTERNAL_SECRET = 'nexus-pro-v1-stateless-secret-key-32-chars';

export function signCoinEx(params: Record<string, any>, secret: string) {
  const query = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&");

  return crypto
    .createHmac("sha256", secret)
    .update(query)
    .digest("hex")
    .toUpperCase();
}

/**
 * Encrypts API keys into a stateless token for the frontend to hold.
 * This satisfies the "No DB / No Session" requirement.
 */
export function encryptSession(data: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(INTERNAL_SECRET.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptSession(token: string): any {
  try {
    const [ivHex, encryptedHex] = token.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(INTERNAL_SECRET.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (e) {
    return null;
  }
}
