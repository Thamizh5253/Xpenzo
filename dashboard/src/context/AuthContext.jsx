import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Load tokens from cookies when the app first loads
  useEffect(() => {
    const storedAccessToken = Cookies.get('access_token');
    const storedRefreshToken = Cookies.get('refresh_token');

    if (storedAccessToken) setAccessToken(storedAccessToken);
    if (storedRefreshToken) setRefreshToken(storedRefreshToken);
  }, []);

  const updateTokens = (newAccessToken, newRefreshToken) => {
    if (newAccessToken) {
      Cookies.set('access_token', newAccessToken, { secure: true, sameSite: 'Strict' });
      setAccessToken(newAccessToken);
    }

    if (newRefreshToken) {
      Cookies.set('refresh_token', newRefreshToken, { secure: true, sameSite: 'Strict' });
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
    <AuthContext.Provider value={{ accessToken, refreshToken, updateTokens, clearTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
