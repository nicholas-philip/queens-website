import axios from 'axios';

const api = axios.create({
  // Completely hardcoded live Render URL to overwrite ANY incorrect dashboard settings
  baseURL: 'https://buyer-backend-5rw4.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Session ID for security
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('queens_session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Response interceptor for easy error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
