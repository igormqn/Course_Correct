import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  getCourses: async () => {
    const response = await api.get('/courses/');
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/assignments/');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
