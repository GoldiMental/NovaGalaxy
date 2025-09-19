import { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from './dev.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []); 
  const login = async (usernameOrEmail, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        console.log('Token LocalStorage:', data.token);
        setUser({ token: data.token });
        console.log('userstate:', {token:data.token});
        return { success: true };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      return { success: false, msg: 'Netzwerkfehler.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};