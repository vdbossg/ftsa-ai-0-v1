import React, { createContext, useState, useContext, useEffect } from 'react';
import APIControl from '../brain/APIControl';

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  const login = (userInfo, token) => {
    setUser(userInfo);
    setToken(token); // ✅ now reactive
    localStorage.setItem('authUser', JSON.stringify(userInfo));
    localStorage.setItem('authToken', token);
  };

  const logout = async () => {
    try {
      if (token) {
        await APIControl.gatemanDelete(token); // ✅ inside async
        console.log("Gateman JSON deleted successfully.");
      }
    } catch (err) {
      console.warn("Failed to delete Gateman JSON:", err.message);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!user;

  // Keep state in sync if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('authUser');
      const storedToken = localStorage.getItem('authToken');
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setToken(storedToken || null);
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
