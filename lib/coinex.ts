
import axios from 'axios';
import { decryptSession, signCoinEx } from './crypto';

const BASE_URL = 'https://api.coinex.com';

export async function coinexRequest(path: string, params: Record<string, any> = {}, sessionToken?: string) {
  let finalParams = { ...params };
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'NexusPro-Scalper/1.0'
  };

  if (sessionToken) {
    const credentials = decryptSession(sessionToken);
    if (!credentials) throw new Error('Session invalid');
    
    const timestamp = Date.now();
    const queryObj = { ...params, access_id: credentials.apiKey, tonce: timestamp };
    
    const sortedQuery = Object.keys(queryObj)
      .sort()
      .map(k => `${k}=${queryObj[k as keyof typeof queryObj]}`)
      .join('&');
    
    const signature = signCoinEx(sortedQuery, credentials.apiSecret);
    finalParams = { ...queryObj, signature };
    headers['Authorization'] = credentials.apiKey;
  }

  const res = await axios.get(`${BASE_URL}${path}`, {
    params: finalParams,
    headers,
    timeout: 10000
  });
  
  if (res.data && res.data.code !== 0 && res.data.code !== undefined) {
    throw new Error(res.data.message || `Exchange Error: ${res.data.code}`);
  }
  
  return res.data;
}

export async function getMarketTickers() {
  const res = await axios.get(`${BASE_URL}/v1/market/ticker/all`);
  return res.data?.data?.ticker || {};
}
