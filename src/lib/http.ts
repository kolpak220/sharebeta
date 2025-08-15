import axios from 'axios';

const BASE_URL = '/api';

export const http = axios.create({
  baseURL: BASE_URL,
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors and server unavailability
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      console.error('Backend server is unreachable:', error.message);
      return Promise.reject(new Error('Backend server is currently unavailable. Please try again later.'));
    }
    
    // Handle HTTP status code 521 (Web server is down)
    if (error.response?.status === 521) {
      console.error('Backend server returned status 521 (Web server is down)');
      return Promise.reject(new Error('Backend server is currently down. Please try again later.'));
    }
    
    // Handle other HTTP errors
    if (error.response) {
      console.error(`HTTP Error ${error.response.status}:`, error.response.data);
      return Promise.reject(new Error(`Server error: ${error.response.data}`));
    }
    
    // Handle request timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
      return Promise.reject(new Error('Request timed out. Please check your connection and try again.'));
    }
    
    return Promise.reject(error);
  }
);

export default http;


