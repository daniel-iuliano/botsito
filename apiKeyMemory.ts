
let apiKey: string | null = null;
let apiSecret: string | null = null;
let username: string | null = null;

export function setApiKeys(key: string, secret: string, user: string) {
  apiKey = key;
  apiSecret = secret;
  username = user;
}

export function clearApiKeys() {
  apiKey = null;
  apiSecret = null;
  username = null;
}

export function getApiKeys() {
  if (!apiKey || !apiSecret) {
    throw new Error("API keys not loaded in memory");
  }
  return { apiKey, apiSecret, username };
}

/**
 * Returns the current active session credentials.
 */
export function getSession() {
  if (!apiKey || !apiSecret) {
    throw new Error("No active session. API keys missing from memory.");
  }
  return { apiKey, apiSecret, username };
}
