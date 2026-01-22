import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage body classes for page-specific zoom exclusions.
 * Landing and assistant pages are excluded from the global 80% zoom.
 */
export const usePageZoom = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Pages that should NOT be zoomed (remain at 100%)
    const fullZoomPages = ['/', '/landing', '/sales', '/assistant'];
    const isFullZoomPage = fullZoomPages.includes(path);

    // Remove all page-* classes first
    document.body.classList.remove('page-landing', 'page-assistant');

    // Add appropriate class for full-zoom pages
    if (isFullZoomPage) {
      if (path === '/assistant') {
        document.body.classList.add('page-assistant');
      } else {
        document.body.classList.add('page-landing');
      }
    }

    return () => {
      document.body.classList.remove('page-landing', 'page-assistant');
    };
  }, [location.pathname]);
};
