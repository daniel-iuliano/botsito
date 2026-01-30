
let sessionToken: string | null = null;

export const api = {
  setToken: (token: string) => {
    sessionToken = token;
    // Optional: Persist to sessionStorage for tab-level persistence
    sessionStorage.setItem('nexus_token', token);
  },
  
  getToken: () => {
    if (!sessionToken) {
      sessionToken = sessionStorage.getItem('nexus_token');
    }
    return sessionToken;
  },

  clearToken: () => {
    sessionToken = null;
    sessionStorage.removeItem('nexus_token');
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
      throw new Error(data.message || data.error || 'API Request Failed');
    }
    return data;
  }
};
