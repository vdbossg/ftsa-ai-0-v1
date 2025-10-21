// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
export { AuthContext };


export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem('authToken'); // get token from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (userInfo, token) => {
  setUser(userInfo);
  localStorage.setItem('authUser', JSON.stringify(userInfo));
  localStorage.setItem('authToken', token); // now uses passed token
};

const logout = () => {
  setUser(null);
  localStorage.removeItem('authUser');
  localStorage.removeItem('authToken'); // also clear token
};


  const isAuthenticated = !!user;

  // Keep state in sync if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('authUser');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
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
