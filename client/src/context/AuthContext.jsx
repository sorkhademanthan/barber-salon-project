import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authReducer, initialState } from '../utils/authReducer';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('smartqueue_token');
    if (token) {
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      getCurrentUser();
    } else {
      dispatch({ type: 'AUTH_COMPLETE' });
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: response.data.data.user 
        });
      }
    } catch (error) {
      console.error('Get current user error:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token
        localStorage.setItem('smartqueue_token', token);
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        toast.success('Login successful!');
        
        return { success: true, user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token
        localStorage.setItem('smartqueue_token', token);
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        toast.success('Registration successful!');
        
        return { success: true, user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('smartqueue_token');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    dispatch({ type: 'AUTH_LOGOUT' });
    toast.success('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
