import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL for API calls.
    // If VITE_API_URL includes a trailing `/api`, strip it to avoid duplicated `/api/api` paths
    // when client code also prefixes endpoints with `/api` (and when vite proxy is used).
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    const normalizedBase = rawApiUrl.endsWith('/api')
      ? rawApiUrl.replace(/\/api$/, '')
      : rawApiUrl || 'http://localhost:5000';
    axios.defaults.baseURL = normalizedBase;

    // Request interceptor to add auth token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          // Verify token is still valid
          try {
            const response = await axios.get('/api/auth/verify');
            if (response.data.success) {
              setUser(JSON.parse(userData));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            // Token verification failed, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Student login
  const loginStudent = async (matricNumber) => {
    try {
      setError(null);
      setLoading(true);

  const response = await axios.post('/api/auth/login/student', {
        matricNumber: matricNumber.toUpperCase()
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);

        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Staff login
  const loginStaff = async (staffId, securityAnswer = '') => {
    try {
      setError(null);
      setLoading(true);

  const response = await axios.post('/api/auth/login/staff', {
        staffId: staffId.toUpperCase(),
        securityAnswer: securityAnswer
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);

        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Guest login
  const loginGuest = async () => {
    try {
      setError(null);
      setLoading(true);

  const response = await axios.post('/api/auth/login/guest');

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);

        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Guest login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear state
    setUser(null);
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is authenticated (not guest)
  const isAuthenticated = () => {
    return user && user.role !== 'guest';
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return '';
    if (user.role === 'guest') return 'Guest User';
    return user.name || user.displayId || 'User';
  };

  // Get user display ID
  const getDisplayId = () => {
    if (!user || user.role === 'guest') return '';
    return user.displayId || '';
  };

  // Context value
  const value = {
    // State
    user,
    loading,
    error,

    // Actions
    loginStudent,
    loginStaff,
    loginGuest,
    logout,

    // Helpers
    hasRole,
    isAuthenticated,
    getDisplayName,
    getDisplayId,

    // Clear error
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};