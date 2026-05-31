import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('diary_access');
    if (token) {
      api.get('/auth/profile/')
        .then(({ data }) => setUser(data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, access, refresh) => {
    localStorage.setItem('diary_access', access);
    localStorage.setItem('diary_refresh', refresh);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('diary_refresh') });
    } catch {}
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
