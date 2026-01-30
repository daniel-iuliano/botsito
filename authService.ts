
let currentKey = "";
let currentSecret = "";

export function setKeys(key: string, secret: string) {
  currentKey = key;
  currentSecret = secret;
}

export function clearKeys() {
  currentKey = "";
  currentSecret = "";
}

export function getKeys() {
  if (!currentKey || !currentSecret) throw new Error("No API keys in memory");
  return { key: currentKey, secret: currentSecret };
}
