export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    return data.status === 'healthy' || response.status === 200;
  } catch {
    return false;
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('evolvevita_auth_token') || localStorage.getItem('evolvevita_token');
  
  // Set standard headers unless doing multipart upload (FormData)
  const isFormData = options.body instanceof FormData;
  const baseHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

  const authHeaders = token && !options.headers?.Authorization
    ? { Authorization: `Bearer ${token}` }
    : {};

  const config = {
    ...options,
    headers: {
      ...baseHeaders,
      ...authHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(`[API Error] ${options.method || 'GET'} ${url} returned ${response.status}:`, errData);
      
      let message = 'API request failed.';
      if (errData.detail) {
        message = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      } else if (errData.message) {
        message = errData.message;
      }
      
      throw {
        status: response.status,
        message,
        detail: errData.detail,
        ...errData
      };
    }
    
    return await response.json();
  } catch (err) {
    if (err.status) {
      throw err;
    }
    console.error(`[API Network Error] Could not connect to: ${url}`, err);
    throw {
      status: 0,
      isOffline: true,
      message: 'Unable to connect to EvolveVita backend services. Please ensure the backend is running at ' + API_BASE_URL
    };
  }
};

export default apiFetch;
