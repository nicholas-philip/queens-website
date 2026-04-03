import axios from 'axios';

const api = axios.create({
  // Forcefully defaults to the live Render backend to eliminate localhost errors
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'https://buyer-backend-5rw4.onrender.com/api',
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
