
let sessionToken: string | null = null;

export const api = {
  setToken: (token: string) => {
    sessionToken = token;
  },
  
  getToken: () => sessionToken,

  request: async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(sessionToken ? { 'Authorization': sessionToken } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(endpoint, { ...options, headers });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'API Request Failed');
    }
    return res.json();
  }
};
