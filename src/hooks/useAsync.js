import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(callback, deps = [], options = {}) {
  const callbackRef = useRef(callback);
  // Leave data undefined until the request resolves. This lets consumers use
  // normal defaults such as `const { data: rows = [] } = useAsync(...)` while
  // loading, instead of trying to call array methods on `null`.
  const [data, setData] = useState(options.initialData);
  const [loading, setLoading] = useState(Boolean(options.immediate ?? true));
  const [error, setError] = useState(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await callbackRef.current(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    // Consumers pass deps so filters can trigger fresh calls without inline callback loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    if (options.immediate !== false) execute();
  }, [execute, options.immediate]);

  return { data, loading, error, execute, setData };
}
