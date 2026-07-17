import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi } from '../services/api';

const SiteContentContext = createContext(null);
const DEFAULT_GYM_NAME = 'Gym';

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextContent = await publicApi.content();
      setContent(nextContent);
      return nextContent;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const value = useMemo(
    () => ({
      content,
      setContent,
      refreshContent,
      loading,
      error,
      gymName: content?.gymName || DEFAULT_GYM_NAME,
    }),
    [content, loading, error],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

// Small global content module; keeping hook and provider together is intentional.
// eslint-disable-next-line react-refresh/only-export-components
export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error('useSiteContent must be used inside SiteContentProvider');
  return value;
}
