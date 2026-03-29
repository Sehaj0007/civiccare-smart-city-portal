import React, { createContext, useState, useCallback } from 'react';
import { authService } from '../services/apiService';
import { initSocket, disconnectSocket } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  const [supervisor, setSupervisor] = useState(
    localStorage.getItem('supervisor') ? JSON.parse(localStorage.getItem('supervisor')) : null
  );
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthErrorMessage = (err, fallbackMessage) => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    if (err?.code === 'ERR_NETWORK') {
      return 'Cannot reach backend API. Ensure backend is running on http://localhost:5000 and try again.';
    }
    return fallbackMessage;
  };

  const login = useCallback(async (email, password, isAdmin = false, isSupervisor = false) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = 'login';
      if (isAdmin) endpoint = 'adminLogin';
      else if (isSupervisor) endpoint = 'supervisorLogin';
      const response = await authService[endpoint]({ email, password });
      const { user, token, supervisor } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      if (isSupervisor && supervisor) {
        localStorage.setItem('supervisor', JSON.stringify(supervisor));
      } else {
        localStorage.removeItem('supervisor');
      }

      setUser(user);
      setToken(token);
      setSupervisor(isSupervisor && supervisor ? supervisor : null);

      if (user._id) {
        initSocket(user._id);
      }

      return { success: true, user, supervisor };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login failed');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      setUser(user);
      setToken(token);

      if (user._id) {
        initSocket(user._id);
      }

      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration failed');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('supervisor');
      setUser(null);
      setToken(null);
      setSupervisor(null);
      disconnectSocket();
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    isSupervisor: user?.role === 'SUPERVISOR',
    isTeamMember: user?.role === 'TEAM_MEMBER',
    supervisor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
