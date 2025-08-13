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
  (error) => Promise.reject(error)
);

export default http;


