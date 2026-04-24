import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Erreur lors du chargement de l\'utilisateur', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    await authService.login(username, password);
    const userData = await authService.getCurrentUser();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
