
import axios from 'axios';
import { signCoinEx, decryptSession } from './crypto';

const BASE_URL = 'https://api.coinex.com/v1';

export async function coinexRequest(endpoint: string, params: any = {}, sessionToken?: string) {
  let authHeaders = {};
  let finalParams = { ...params };

  if (sessionToken) {
    const credentials = decryptSession(sessionToken);
    if (!credentials) throw new Error('Invalid or expired session');
    
    const tonce = Date.now();
    const authParams = { ...params, access_id: credentials.apiKey, tonce };
    const signature = signCoinEx(authParams, credentials.apiSecret);
    
    finalParams = { ...authParams, signature };
    authHeaders = { 'Authorization': credentials.apiKey };
  }

  const res = await axios.get(`${BASE_URL}${endpoint}`, {
    params: finalParams,
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    timeout: 8000
  });

  return res.data;
}

export async function getMarketTickers() {
  const res = await axios.get(`${BASE_URL}/market/ticker/all`);
  return res.data.data.ticker;
}

export async function getMarketDepth(market: string) {
  const res = await axios.get(`${BASE_URL}/market/depth`, {
    params: { market, merge: '0', limit: '20' }
  });
  return res.data.data;
}
