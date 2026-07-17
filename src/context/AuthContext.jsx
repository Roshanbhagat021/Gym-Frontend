import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, request } from '../api/client';
import { authStorage } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [theme, setTheme] = useState(() => authStorage.getTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    authStorage.setTheme(theme);
  }, [theme]);

  const login = async (credentials) => {
    const response = await request(apiClient.post('/auth/login', credentials), {
      successMessage: 'Welcome back',
    });
    // `request` unwraps the API envelope, but this also supports deployments
    // that return one additional `data` wrapper.
    const session = response?.data?.accessToken ? response.data : response;

    authStorage.setSession(session);
    setUser(session.user);
    return session.user;
  };

  const logout = async () => {
    try {
      await request(apiClient.post('/auth/logout'), { showError: false });
    } finally {
      authStorage.clear();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && authStorage.getAccessToken()),
      theme,
      setTheme,
      login,
      logout,
    }),
    [user, theme],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook intentionally lives beside its provider for a small auth module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
