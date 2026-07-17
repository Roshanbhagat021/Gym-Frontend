import axios from 'axios';
import toast from 'react-hot-toast';
import { SITE } from '../config/site';
import { authStorage } from '../utils/authStorage';

export const apiClient = axios.create({
  baseURL: SITE.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const normalizeApiError = (error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.';

  return { ...error, message };
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        authStorage.clear();
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(normalizeApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        authStorage.clear();
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(normalizeApiError(error));
      }

      try {
        const response = await axios.post(`${SITE.apiBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        const session = response.data?.data?.accessToken ? response.data.data : response.data;
        authStorage.setSession(session);

        const newAccessToken = session.accessToken;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStorage.clear();
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export async function request(promise, options = {}) {
  try {
    const response = await promise;
    if (options.successMessage) toast.success(options.successMessage);
    return response?.data ?? response;
  } catch (error) {
    if (options.showError !== false) toast.error(error.message);
    throw error;
  }
}
