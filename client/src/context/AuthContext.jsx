import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('savex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('savex_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('savex_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('savex_user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('savex_token');
          localStorage.removeItem('savex_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('savex_token', newToken);
      localStorage.setItem('savex_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      showToast('Welcome back to SaveX!', 'success');
      return newUser;
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    }
  };

  const register = async (name, email, password, preferredCurrency = 'USD') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, preferredCurrency });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('savex_token', newToken);
      localStorage.setItem('savex_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      showToast('Account created successfully!', 'success');
      return newUser;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue cleanup regardless of network error
    } finally {
      localStorage.removeItem('savex_token');
      localStorage.removeItem('savex_user');
      setUser(null);
      setToken(null);
      showToast('Logged out safely.', 'info');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.patch('/auth/profile', profileData);
      setUser(res.data.user);
      localStorage.setItem('savex_user', JSON.stringify(res.data.user));
      showToast('Profile updated successfully.', 'success');
      return res.data.user;
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const res = await api.patch('/auth/onboarding', onboardingData);
      setUser(res.data.user);
      localStorage.setItem('savex_user', JSON.stringify(res.data.user));
      showToast('Setup completed! Welcome to your SaveX dashboard.', 'success');
      return res.data.user;
    } catch (err) {
      showToast(err.message || 'Failed to complete onboarding.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
