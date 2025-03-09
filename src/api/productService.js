import { AxiosInstance } from './axiosInstance';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchProducts = async ({ search = '', page = 0, limit = 10 }) => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    params.append('page', Number(page));
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await AxiosInstance.get(
      `${API_BASE_URL}/task/products/search?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
