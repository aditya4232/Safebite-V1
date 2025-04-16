// Authentication utility functions
import guestAuthService from "@/services/guestAuthService";

/**
 * Check if the current page is an authentication page (login, signup, forgot password)
 * @returns boolean indicating if the current page is an auth page
 */
export const isAuthPage = (): boolean => {
  const path = window.location.pathname;
  return path.includes('/auth/login') ||
         path.includes('/auth/signup') ||
         path.includes('/auth/forgot-password') ||
         path === '/' ||
         path === '/SafeBite-V1/' ||
         path.includes('/about') ||
         path.includes('/features');
};

/**
 * Check if the current page is a protected page that requires authentication
 * @returns boolean indicating if the current page is a protected page
 */
export const isProtectedPage = (): boolean => {
  const path = window.location.pathname;
  const protectedRoutes = [
    '/dashboard',
    '/nutrition',
    '/food-search',
    '/food-delivery',
    '/product-recommendations',
    '/products',
    '/community',
    '/healthbox',
    '/reports',
    '/recipes',
    '/settings',
    '/tools',
    '/features'
  ];

  return protectedRoutes.some(route =>
    path.toLowerCase().includes(route.toLowerCase())
  );
};

/**
 * Redirect to login page if not on an auth page
 * @returns void
 */
export const redirectToLogin = (): void => {
  if (!isAuthPage()) {
    const baseUrl = window.location.pathname.includes('/SafeBite-V1')
      ? '/SafeBite-V1'
      : '';
    window.location.href = `${baseUrl}/auth/login`;
  }
};

/**
 * Check if user is authenticated (logged in or guest)
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // Check for Firebase auth
  const hasFirebaseAuth = localStorage.getItem('firebase:authUser:AIzaSyDCl5yM0z-eQCyQMCvZ4U-iFLyAn4iGi-0:[DEFAULT]') !== null;

  // Check for guest mode with valid session
  const isGuest = guestAuthService.isGuestUser();

  return hasFirebaseAuth || isGuest;
};

/**
 * Ensure user is authenticated, redirect to login if not
 * @returns boolean indicating if user is authenticated
 */
export const ensureAuthenticated = (): boolean => {
  const authenticated = isAuthenticated();

  if (!authenticated && isProtectedPage()) {
    redirectToLogin();
  }

  return authenticated;
};
