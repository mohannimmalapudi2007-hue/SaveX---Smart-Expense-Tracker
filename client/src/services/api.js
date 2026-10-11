import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('savex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      status: error.response?.status,
      details: error.response?.data?.details
    };

    if (error.response?.status === 401 && window.location.pathname.startsWith('/app')) {
      localStorage.removeItem('savex_token');
      localStorage.removeItem('savex_user');
      window.location.href = '/login';
    }

    return Promise.reject(customError);
  }
);

export default api;
