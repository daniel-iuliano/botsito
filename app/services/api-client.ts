
export const apiClient = {
  setToken: (token: string) => {
    sessionStorage.setItem('nexus_session', token);
  },
  getToken: () => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('nexus_session') : null;
  },
  clearToken: () => {
    sessionStorage.removeItem('nexus_session');
  },
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = apiClient.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': token } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || data.message || 'API Error');
    return data;
  }
};
