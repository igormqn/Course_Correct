// src/services/api.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Créer l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si token expiré, essayer de le rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ========================================
// AUTH API
// ========================================
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

// ========================================
// SERVICES API
// ========================================
export const serviceAPI = {
  getAll: async () => {
    const response = await api.get('/services/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },
};

// ========================================
// COURSES API
// ========================================
export const courseAPI = {
  getAll: async () => {
    const response = await api.get('/courses/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },
};

export const subjectAPI = {
  getAll: async () => {
    const response = await api.get('/subjects/');
    return response.data;
  },
};

// ========================================
// ASSIGNMENTS API
// ========================================
export const assignmentAPI = {
  getAll: async () => {
    const response = await api.get('/assignments/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignments/${id}/`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get('/assignments/my_assignments/');
    return response.data;
  },

  getToCorrect: async () => {
    const response = await api.get('/assignments/to_correct/');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/assignments/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/assignments/${id}/`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/assignments/${id}/update_status/`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assignments/${id}/`);
    return response.data;
  },
};

// ========================================
// CORRECTIONS API
// ========================================
export const correctionAPI = {
  getAll: async () => {
    const response = await api.get('/corrections/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/corrections/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/corrections/', data);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.patch(`/corrections/${id}/complete/`);
    return response.data;
  },
};

export default api;