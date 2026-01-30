
import axios from 'axios';
import { signCoinEx, decryptSession } from './crypto';

const BASE_URL = 'https://api.coinex.com/v1';

export async function coinexRequest(endpoint: string, params: any = {}, sessionToken?: string) {
  let finalParams = { ...params };
  let authHeaders = {};

  if (sessionToken) {
    const credentials = decryptSession(sessionToken);
    if (!credentials) throw new Error('Session invalid or expired. Please re-connect.');
    
    const tonce = Date.now();
    const authParams = { ...params, access_id: credentials.apiKey, tonce };
    const signature = signCoinEx(authParams, credentials.apiSecret);
    
    finalParams = { ...authParams, signature };
    authHeaders = { 'Authorization': credentials.apiKey };
  }

  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: finalParams,
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      timeout: 10000
    });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'CoinEx Gateway Error';
    throw new Error(msg);
  }
}

export async function getMarketDataSnapshot() {
  const res = await axios.get(`${BASE_URL}/market/ticker/all`);
  return res.data.data.ticker;
}
