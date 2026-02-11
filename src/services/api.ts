import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Base API configuration - usar variable de entorno o valor por defecto
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds para operaciones más complejas
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('vetclinic_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('vetclinic_refresh_token');

      if (!refreshToken) {
        // No hay refresh token, redirigir a login
        processQueue(error, null);
        localStorage.removeItem('vetclinic_token');
        localStorage.removeItem('vetclinic_refresh_token');
        localStorage.removeItem('vetclinic_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intentar refrescar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { data } = response.data;
        const newToken = data.token;
        const newRefreshToken = data.refreshToken;

        localStorage.setItem('vetclinic_token', newToken);
        localStorage.setItem('vetclinic_refresh_token', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Error al refrescar token, redirigir a login
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        localStorage.removeItem('vetclinic_token');
        localStorage.removeItem('vetclinic_refresh_token');
        localStorage.removeItem('vetclinic_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Otros errores
    return Promise.reject(error);
  }
);

export default api;
