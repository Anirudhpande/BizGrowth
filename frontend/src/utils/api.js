const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers dynamically. Do not set Content-Type if we are sending FormData
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, config);
    
    let data;
    try {
      data = await response.json();
    } catch (err) {
      // Handle cases where the server returns a non-JSON success or error
      data = { success: response.ok, message: 'Response parsing failed' };
    }

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Standardize network/fetch errors
    if (!error.status) {
      console.error(`API Network Error for ${path}:`, error);
      throw new Error('Network connection error. Please check if backend is running.');
    }
    throw error;
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: isFormData(body) ? body : JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: isFormData(body) ? body : JSON.stringify(body) }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: isFormData(body) ? body : JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

function isFormData(body) {
  return typeof window !== 'undefined' && body instanceof FormData;
}
