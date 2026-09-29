import { useState, useEffect, useCallback } from 'react';

export type RoutePath = '/' | '/useful' | '/not-useful';

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname.toLowerCase();
    if (path === '/useful' || path === '/not-useful') {
      return path;
    }
    return '/';
  });

  const navigate = useCallback((to: RoutePath) => {
    if (window.location.pathname !== to) {
      window.history.pushState(null, '', to);
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/useful' || path === '/not-useful') {
        setCurrentPath(path);
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentPath: (currentPath === '/useful' || currentPath === '/not-useful' ? currentPath : '/') as RoutePath,
    navigate
  };
}
