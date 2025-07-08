import axios from 'axios';
import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const usersApi = {
  downloadUsersCSV: async () => {
    const response = await api.get('/users/download', {
      responseType: 'blob',
    });
    return response.data;
  },
};
