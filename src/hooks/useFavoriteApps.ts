import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const FAVORITES_KEY = 'app-favorites';

// Get favorites from localStorage
const getFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : ['create'];
  } catch {
    return ['create'];
  }
};

// Set favorites to localStorage and notify
const setFavoritesToStorage = (favorites: string[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent('favorites-updated'));
};

// Subscribers for sync
let listeners: (() => void)[] = [];

const subscribe = (listener: () => void) => {
  listeners = [...listeners, listener];
  
  const handleUpdate = () => listener();
  
  window.addEventListener('favorites-updated', handleUpdate);
  window.addEventListener('storage', (e) => {
    if (e.key === FAVORITES_KEY) handleUpdate();
  });
  
  return () => {
    listeners = listeners.filter(l => l !== listener);
    window.removeEventListener('favorites-updated', handleUpdate);
  };
};

const getSnapshot = () => {
  return localStorage.getItem(FAVORITES_KEY) || JSON.stringify(['create']);
};

export const useFavoriteApps = () => {
  // Use useSyncExternalStore for proper sync across components
  const favoritesJson = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const favorites = JSON.parse(favoritesJson) as string[];

  const toggleFavorite = useCallback((appId: string) => {
    const currentFavorites = getFavorites();
    const newFavorites = currentFavorites.includes(appId) 
      ? currentFavorites.filter(id => id !== appId)
      : [...currentFavorites, appId];
    
    setFavoritesToStorage(newFavorites);
  }, []);

  const isFavorite = useCallback((appId: string) => {
    return favorites.includes(appId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavoriteApps;
