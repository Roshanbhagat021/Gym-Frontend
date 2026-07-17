const ACCESS_TOKEN = 'gym_access_token';
const REFRESH_TOKEN = 'gym_refresh_token';
const USER = 'gym_user';
const THEME = 'gym_theme';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),
  getUser: () => {
    const value = localStorage.getItem(USER);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      // A stale or manually edited value must not prevent the login route from rendering.
      localStorage.removeItem(USER);
      return null;
    }
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    if (!accessToken || !user) {
      throw new Error('The login response did not include a valid session.');
    }

    localStorage.setItem(ACCESS_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN);
    localStorage.setItem(USER, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
  },
  getTheme: () => localStorage.getItem(THEME) || 'light',
  setTheme: (theme) => localStorage.setItem(THEME, theme),
};
