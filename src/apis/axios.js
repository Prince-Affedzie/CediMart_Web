// src/lib/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ← IMPORTANT: This sends cookies with requests
});

// Request interceptor - sends token from localStorage if it exists
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage (for web)
    const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down');
    } else if (!error.response) {
      console.error('Network error - server may not be running');
    }
    
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('token');
      localStorage.removeItem('vendorData');
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/vendor/login')) {
        window.location.href = '/vendor/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;