import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const tokenData = await authAPI.login(credentials);
      localStorage.setItem('access_token', tokenData.access);
      localStorage.setItem('refresh_token', tokenData.refresh);
      const userData = await authAPI.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Invalid username or password',
      };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      const result = await login({
        username: userData.username,
        password: userData.password,
      });
      return result;
    } catch (err) {
      const errorData = err.response?.data;
      let errorMsg = 'Registration failed';
      if (errorData && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        const val = errorData[firstKey];
        errorMsg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
