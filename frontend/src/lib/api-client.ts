import Axios, { type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // FastAPI returns 'detail' field, some APIs use 'message'
    const message = error.response?.data?.detail || error.response?.data?.message || error.message; // https://github.com/TanStack/query/discussions/1463

    if (error.response?.status === 401) {
      console.log(message);
    }

    // Override error message so it's accessible everywhere as error.message
    error.message = message;
    return Promise.reject(error);
  },
);
