import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Routes that shouldn't be saved as "last visited"
const EXCLUDED_ROUTES = [
  '/login',
  '/signup',
  '/invite-verification',
  '/onboarding',
  '/signup-flow',
  '/',
];

export const useRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't save excluded routes
    if (EXCLUDED_ROUTES.some(route => currentPath.startsWith(route))) {
      return;
    }

    // Save the current route as last visited
    localStorage.setItem('last_visited_route', currentPath);
  }, [location.pathname]);
};

export const markOnboardingComplete = (userId: string) => {
  localStorage.setItem(`onboarding_completed_${userId}`, 'true');
};

export const isOnboardingComplete = (userId: string): boolean => {
  return localStorage.getItem(`onboarding_completed_${userId}`) === 'true';
};
