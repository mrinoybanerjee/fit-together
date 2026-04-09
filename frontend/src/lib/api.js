import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 from non-auth endpoints → clear token and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('fit_token');
      localStorage.removeItem('fit_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { token, user }
}

export async function getPartnersSummary() {
  const res = await api.get('/partners/summary');
  return { data: res.data, source: res.headers['x-data-source'] ?? 'unknown' };
}

export async function checkHealth() {
  const res = await api.get('/health');
  return res.data;
}

export default api;
