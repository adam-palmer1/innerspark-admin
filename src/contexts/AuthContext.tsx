import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin, LoginRequest } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  admin: Admin | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = admin !== null;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminUser');
      
      if (token && savedAdmin) {
        try {
          setAdmin(JSON.parse(savedAdmin));
          const profile = await apiService.getProfile();
          setAdmin(profile);
          localStorage.setItem('adminUser', JSON.stringify(profile));
        } catch (error) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.admin));
      setAdmin(response.admin);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setAdmin(null);
    }
  };

  const value = {
    admin,
    login,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};