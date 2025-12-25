import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5173/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth Services
export const authAPI = {
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  register: (data) => api.post('/auth/register', data),
};

// User Services
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changeUPIPin: (data) => api.post('/user/change-upi-pin', data),
  deleteAccount: () => api.delete('/user/delete-account'),
  getReferrals: () => api.get('/user/referrals'),
  getPendingTransactions: () => api.get('/user/pending-transactions'),
};

// Transaction Services
export const transactionAPI = {
  getTransactions: () => api.get('/user/transactions'),
  sendMoney: (data) => api.post('/transaction/send-money', data),
  rechargeMobile: (data) => api.post('/transaction/recharge', data),
  payBill: (data) => api.post('/transaction/pay-bill', data),
};

// Scratch Card Services
export const scratchCardAPI = {
  getScratchCards: () => api.get('/user/scratch-cards'),
  scratchCard: (id) => api.post(`/user/scratch-card/${id}`),
  claimScratchCard: (id) => api.post(`/user/claim-scratch-card/${id}`),
};

// Bank Services
export const bankAPI = {
  getBanks: () => api.get('/banks'),
};

// Health Check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;