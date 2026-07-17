// src/lib/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000, // Increase to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down');
    } else if (!error.response) {
      console.error('Network error - server may not be running');
    }
    return Promise.reject(error);
  }
);

export default API;