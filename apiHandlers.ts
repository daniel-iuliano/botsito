
// Fix: Removed initCoinexClient as it is not exported from coinexClient and removed unused getAllMarkets import
import { privateRequest } from "./coinexClient";
import { setApiKeys as setMemoryKeys } from "./apiKeyMemory";
import { scanMarkets, marketState } from "./marketScanner";

/**
 * Validates API keys by attempting a private balance request,
 * then stores them in stateless memory if successful.
 */
export async function setApiKeys(req: any, res: any) {
  const { apiKey, apiSecret } = req.body;

  try {
    // Temporarily set keys to test the connection
    setMemoryKeys(apiKey, apiSecret, "PENDING_VERIFICATION");

    // Perform a real private request to verify keys
    const info = await privateRequest("/balance/info");

    if (info.code !== 0) {
      throw new Error(info.message || "CoinEx rejected credentials");
    }

    // Success - Set the real account identity (mocked or extracted from balance info)
    const username = "QuantScalper_Pro_01";
    setMemoryKeys(apiKey, apiSecret, username);
    
    // Kick off initial market scan
    scanMarkets();

    return res.json({ 
      success: true, 
      username,
      balances: info.data 
    });
  } catch (e: any) {
    // Clear potentially invalid keys from memory
    setMemoryKeys("", "", ""); 
    return res.status(401).json({ 
      success: false, 
      message: e.message || "HMAC Authentication Failed" 
    });
  }
}

export async function handleTestConnection(req: any, res: any) {
  try {
    const result = await privateRequest("/balance/info");
    return res.json({ success: true, data: result });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
}

export async function listMarkets(req: any, res: any) {
  return res.json({ success: true, markets: marketState });
}

export async function getBalances(req: any, res: any) {
  try {
    const info = await privateRequest("/balance/info");
    return res.json({ success: true, balances: info.data });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
}
