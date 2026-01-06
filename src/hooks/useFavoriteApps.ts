import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'app-favorites';

export const useFavoriteApps = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : ['create'];
  });

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY && e.newValue) {
        setFavorites(JSON.parse(e.newValue));
      }
    };

    // Also listen for custom events within the same tab
    const handleCustomEvent = () => {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favorites-updated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-updated', handleCustomEvent);
    };
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((appId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId];
      
      // Save immediately
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      
      // Dispatch custom event for other components in the same tab
      window.dispatchEvent(new CustomEvent('favorites-updated'));
      
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((appId: string) => {
    return favorites.includes(appId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavoriteApps;
