import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details & profile on mount or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setProfile(data.profile);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Failed to verify session token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password, phone = '', role = 'patient') => {
    const data = await api.post('/auth/register', { name, email, password, phone, role });
    if (data.success) {
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await api.get('/profile');
      if (data.success) {
        setProfile(data.profile);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
        setProfile
      }}
    >
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
