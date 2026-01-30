
let sessionToken: string | null = null;

export const api = {
  setToken: (token: string) => {
    sessionToken = token;
    sessionStorage.setItem('nexus_token_v1', token);
  },
  
  getToken: () => {
    if (!sessionToken) {
      sessionToken = sessionStorage.getItem('nexus_token_v1');
    }
    return sessionToken;
  },

  clearToken: () => {
    sessionToken = null;
    sessionStorage.removeItem('nexus_token_v1');
  },

  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': token } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Gateway Timeout or API Error');
    }
    return data;
  }
};
