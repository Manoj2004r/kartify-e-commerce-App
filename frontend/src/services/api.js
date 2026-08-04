import axios from 'axios';

// In production the frontend is served by nginx, which proxies /api to the
// backend service inside the cluster (see frontend/nginx.conf). In local
// dev, Vite talks straight to the backend on VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kartify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kartify_token');
      localStorage.removeItem('kartify_user');
    }
    return Promise.reject(error);
  }
);

export default api;
