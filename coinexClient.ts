import axios from "axios";
import { signCoinEx } from "./signer";
import { getSession } from "./apiKeyMemory";

const BASE = "https://api.coinex.com/v1";

/**
 * Executes an authenticated private request to the CoinEx API.
 */
export async function privateRequest(
  endpoint: string,
  params: Record<string, any> = {}
) {
  const { apiKey, apiSecret } = getSession();

  const tonce = Date.now();

  const fullParams: Record<string, any> = {
    ...params,
    access_id: apiKey,
    tonce
  };

  // 🔑 GENERATE SIGNATURE
  const signature = signCoinEx(fullParams, apiSecret);

  // 🔑 ADD SIGNATURE TO PARAMS (Required by CoinEx V1)
  fullParams.signature = signature;

  const res = await axios.get(`${BASE}${endpoint}`, {
    params: fullParams,
    headers: {
      Authorization: apiKey
    },
    timeout: 10000
  });

  return res.data;
}

/**
 * Fetches all available market pairs.
 */
export async function getAllMarkets() {
  const resp = await axios.get(`${BASE}/market/list`);
  return resp.data.data || [];
}

/**
 * Fetches real-time ticker data for a specific market.
 */
export async function getTicker(market: string) {
  const resp = await axios.get(`${BASE}/market/ticker`, {
    params: { market }
  });
  return resp.data.data?.ticker || {};
}

/**
 * Alias for testing connection using the private balance endpoint.
 */
export async function testConnection() {
  return privateRequest("/balance/info");
}
