
import crypto from 'crypto';

// In production, this should be in process.env.ENCRYPTION_SECRET
const SECRET = Buffer.from('48656c6c6f576f726c644e6578757350726f3132333435363738393041424344', 'hex');
const ALGORITHM = 'aes-256-gcm';

export function encryptSession(data: any): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSession(token: string): any {
  if (!token || !token.includes(':')) return null;
  try {
    const [ivHex, authTagHex, encryptedHex] = token.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

export function signCoinEx(queryString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(queryString).digest("hex").toLowerCase();
}
