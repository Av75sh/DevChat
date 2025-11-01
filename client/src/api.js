const API_BASE = (process.env.SERVER_ORIGIN || 'http://localhost:5000') + '/api';


export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (data) config.body = JSON.stringify(data);
  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.message || 'API Error');
  return result;
};