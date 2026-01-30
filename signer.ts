
import crypto from "crypto";

/**
 * Generates an HMAC-SHA256 signature for CoinEx API requests.
 * Sorts parameters alphabetically and signs the query string.
 */
export function signCoinEx(
  params: Record<string, any>,
  secret: string
) {
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
