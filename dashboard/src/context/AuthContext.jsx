// context/AuthContext.js
import  { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check token validity
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = Cookies.get('access_token');
      const storedRefreshToken = Cookies.get('refresh_token');

      if (storedAccessToken && isTokenValid(storedAccessToken)) {
        setAccessToken(storedAccessToken);
      } else if (storedRefreshToken) {
        // Attempt to refresh token if access token is invalid
        try {
          setIsAuthenticating(true);
          const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: storedRefreshToken,
          });
          setTokens(response.data.access, storedRefreshToken);
        } catch (error) {
          clearTokens();
        } finally {
          setIsAuthenticating(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Axios interceptors setup (same as before)
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
              refresh: refreshToken,
            });
            setTokens(response.data.access, refreshToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axios(originalRequest);
          } catch {
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]);

  const setTokens = (newAccessToken, newRefreshToken) => {
    if (newAccessToken) {
      Cookies.set('access_token', newAccessToken, {
        secure: true,
        sameSite: 'Strict',
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      setAccessToken(newAccessToken);
    }
    if (newRefreshToken) {
      Cookies.set('refresh_token', newRefreshToken, {
        secure: true,
        sameSite: 'Strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      setRefreshToken(newRefreshToken);
    }
  };

  const clearTokens = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{
      accessToken,
      refreshToken,
      isLoading: isLoading || isAuthenticating,
      isAuthenticated: !!accessToken && isTokenValid(accessToken),
      setTokens,
      clearTokens
    }}>
      {children}
    </AuthContext.Provider>
  );
};