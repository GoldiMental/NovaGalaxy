import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'novaGalaxyJWT'; 
const API_URL = "https://a8mol3jod5.execute-api.eu-central-1.amazonaws.com/api"; 


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      setUser({ token });
    }
    setLoading(false);
    return () => {}; 
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
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser({ token: data.token }); 
        return { success: true };
      } else {
        return { success: false, msg: data.msg || 'Anmeldung fehlgeschlagen.' };
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      return { success: false, msg: 'Netzwerkfehler.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};