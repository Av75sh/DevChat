const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  };
  if (data) config.body = JSON.stringify(data);
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API Error');
    }
    
    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};