import React, { createContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true); // For initial token validation

  const parseJwt = (tokenToParse) => {
    if (!tokenToParse) return null;
    try {
      const base64Url = tokenToParse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT:", e);
      return null;
    }
  };
  
  // Validate token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedUser = parseJwt(storedToken);
      if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({ id: decodedUser.userId, username: decodedUser.username, role: decodedUser.role });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authToken'); // Token expired or invalid
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user); // Assuming backend returns user { id, username, role }
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // Optionally log in the user directly after registration or prompt them to log in
      // For now, just signal success.
      return true; 
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, register, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
