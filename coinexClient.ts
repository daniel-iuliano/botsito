
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
  const fullParams = {
    ...params,
    access_id: apiKey,
    tonce
  };

  const signature = signCoinEx(fullParams, apiSecret);

  // Note: CoinEx API authentication headers and parameter placement 
  // vary by version. Following the specific architecture requested.
  const res = await axios.get(`${BASE}${endpoint}`, {
    params: { ...fullParams, authorization: signature },
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    }
  });

  return res.data;
}

export async function getAllMarkets() {
  const resp = await axios.get(`${BASE}/market/list`);
  return resp.data.data || [];
}

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
