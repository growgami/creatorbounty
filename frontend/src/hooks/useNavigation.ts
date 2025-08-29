'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useRole } from '@/features/rbac-landing/hooks/useRole';

interface NavigationState {
  previousRoute: string | null;
  canGoBack: boolean;
  backLabel: string;
  backRoute: string;
}

/**
 * Hook for intelligent navigation management
 * Tracks user's journey and provides context-aware back navigation
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    previousRoute: null,
    canGoBack: false,
    backLabel: 'Back to Home',
    backRoute: '/home'
  });

  // Track route changes and update navigation state
  useEffect(() => {
    const handleRouteChange = () => {
      // Get previous route from sessionStorage or referrer
      const storedPreviousRoute = sessionStorage.getItem('previousRoute');
      const referrer = document.referrer;
      
      let previousRoute = storedPreviousRoute;
      
      // If no stored route, try to infer from referrer
      if (!previousRoute && referrer) {
        try {
          const referrerUrl = new URL(referrer);
          if (referrerUrl.origin === window.location.origin) {
            previousRoute = referrerUrl.pathname;
          }
        } catch {
          // Ignore invalid referrer URLs
        }
      }

      // Determine back navigation based on current route and user role
      const state = determineBackNavigation(pathname, previousRoute, role);
      setNavigationState(state);

      // Store current route as previous for next navigation
      if (pathname !== '/profile') {
        sessionStorage.setItem('previousRoute', pathname);
      }
    };

    handleRouteChange();
  }, [pathname, role]);

  const goBack = useCallback(() => {
    if (navigationState.canGoBack && navigationState.previousRoute) {
      // Try to use browser back first if the previous route matches
      if (window.history.length > 1 && document.referrer.includes(navigationState.previousRoute)) {
        window.history.back();
      } else {
        router.push(navigationState.previousRoute);
      }
    } else {
      router.push(navigationState.backRoute);
    }
  }, [router, navigationState]);

  const navigateToProfile = useCallback((fromRoute?: string) => {
    // Store the current route before navigating to profile
    if (fromRoute) {
      sessionStorage.setItem('previousRoute', fromRoute);
    } else {
      sessionStorage.setItem('previousRoute', pathname);
    }
    router.push('/profile');
  }, [router, pathname]);

  return {
    ...navigationState,
    goBack,
    navigateToProfile
  };
};

/**
 * Determines the appropriate back navigation based on current route and context
 */
function determineBackNavigation(
  currentPath: string, 
  previousRoute: string | null, 
  userRole: string | null
): NavigationState {
  // If we're on the profile page
  if (currentPath === '/profile') {
    // Check if we have a previous route
    if (previousRoute) {
      // Clean the previous route (remove query parameters for comparison)
      const cleanPreviousRoute = previousRoute.split('?')[0];
      
      // Determine back label based on previous route
      if (cleanPreviousRoute === '/admin') {
        return {
          previousRoute,
          canGoBack: true,
          backLabel: 'Back to Admin Dashboard',
          backRoute: '/admin'
        };
      } else if (cleanPreviousRoute === '/creator') {
        return {
          previousRoute,
          canGoBack: true,
          backLabel: 'Back to Creator Dashboard',
          backRoute: '/creator'
        };
      } else if (cleanPreviousRoute === '/home') {
        return {
          previousRoute,
          canGoBack: true,
          backLabel: 'Back to Home',
          backRoute: '/home'
        };
      } else if (cleanPreviousRoute.startsWith('/admin') || cleanPreviousRoute.includes('admin')) {
        return {
          previousRoute,
          canGoBack: true,
          backLabel: 'Back to Admin Dashboard',
          backRoute: '/admin'
        };
      } else if (cleanPreviousRoute.startsWith('/creator') || cleanPreviousRoute.includes('creator')) {
        return {
          previousRoute,
          canGoBack: true,
          backLabel: 'Back to Creator Dashboard',
          backRoute: '/creator'
        };
      }
    }

    // Fallback based on user role
    if (userRole === 'admin') {
      return {
        previousRoute: '/admin',
        canGoBack: true,
        backLabel: 'Back to Admin Dashboard',
        backRoute: '/admin'
      };
    } else if (userRole === 'creator') {
      return {
        previousRoute: '/creator',
        canGoBack: true,
        backLabel: 'Back to Creator Dashboard',
        backRoute: '/creator'
      };
    }

    // Default fallback
    return {
      previousRoute: '/home',
      canGoBack: true,
      backLabel: 'Back to Home',
      backRoute: '/home'
    };
  }

  // For other routes, default behavior
  return {
    previousRoute,
    canGoBack: !!previousRoute,
    backLabel: 'Back',
    backRoute: previousRoute || '/home'
  };
}
