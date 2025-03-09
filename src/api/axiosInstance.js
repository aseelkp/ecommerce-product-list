import axios from 'axios';

export const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'x-api-key': import.meta.env.VITE_API_KEY || '',
  },
});
