
let sessionToken: string | null = null;

export const api = {
  setToken: (token: string) => {
    sessionToken = token;
    sessionStorage.setItem('nexus_pro_session_v1', token);
  },
  
  getToken: () => {
    if (!sessionToken) {
      sessionToken = sessionStorage.getItem('nexus_pro_session_v1');
    }
    return sessionToken;
  },

  clearToken: () => {
    sessionToken = null;
    sessionStorage.removeItem('nexus_pro_session_v1');
  },

  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': token } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    try {
      const res = await fetch(endpoint, { ...options, headers });
      const text = await res.text();
      
      if (!res.ok) {
        let errorMessage = text;
        if (res.status === 404) {
          errorMessage = `Endpoint ${endpoint} not found (404). Ensure serverless functions are deployed at root /api/`;
        } else {
          try {
            const json = JSON.parse(text);
            errorMessage = json.message || json.error || text;
          } catch (e) {}
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn(`[API] Failed to parse JSON from ${endpoint}. Response was:`, text);
        throw new Error("Invalid server response (Expected JSON).");
      }
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }
};
