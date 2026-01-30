
import axios from 'axios';
import { signCoinEx, decryptSession } from './crypto';

const BASE_URL = 'https://api.coinex.com/v1';

export async function coinexRequest(endpoint: string, params: any = {}, sessionToken?: string) {
  let finalParams = { ...params };

  if (sessionToken) {
    const credentials = decryptSession(sessionToken);
    if (!credentials) throw new Error('Invalid or expired session');
    
    const tonce = Date.now();
    // CoinEx V1 requires access_id and tonce in the signature string
    const authParams = { ...params, access_id: credentials.apiKey, tonce };
    const signature = signCoinEx(authParams, credentials.apiSecret);
    
    // Add signature to the request parameters
    finalParams = { ...authParams, signature };
  }

  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: finalParams,
      headers: { 
        'Content-Type': 'application/json',
        // Authorization header is usually just the access_id in some V1 endpoints, 
        // but signature in params is the primary method.
        ...(sessionToken ? { 'Authorization': decryptSession(sessionToken).apiKey } : {})
      },
      timeout: 10000
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'CoinEx API Error');
  }
}

export async function getMarketTickers() {
  const res = await axios.get(`${BASE_URL}/market/ticker/all`);
  return res.data.data.ticker;
}

export async function getKlines(market: string, type: string = '1min', limit: number = 100) {
  const res = await axios.get(`${BASE_URL}/market/kline`, {
    params: { market, type, limit }
  });
  return res.data.data;
}
