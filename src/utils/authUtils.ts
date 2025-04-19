// Authentication utility functions
import guestAuthService from "@/services/guestAuthService";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import simpleSessionService from "@/services/simpleSessionService";

/**
 * Check if the current page is an authentication page or public page that doesn't require login
 * @returns boolean indicating if the current page is an auth/public page
 */
export const isAuthPage = (): boolean => {
  const path = window.location.pathname;

  // List of paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/about',
    '/help',
    '/changelog'
  ];

  // Check if the path is the root or matches any public path
  return path === '/' ||
         path === '/SafeBite-V1/' ||
         publicPaths.some(publicPath => path.includes(publicPath));
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
    '/grocery-products',
    '/community',
    '/healthbox',
    '/reports',
    '/recipes',
    '/settings',
    '/tools',
    '/questionnaire',
    '/health-check'
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
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${baseUrl}/auth/login?returnUrl=${returnUrl}`;
  }
};

/**
 * Check if user is authenticated (logged in or guest)
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const auth = getAuth(app);

  // Check for Firebase auth - more reliable than localStorage
  const hasFirebaseAuth = !!auth.currentUser;

  // Check for guest mode with valid session
  const isGuest = guestAuthService.isGuestUser();

  // Check if session is valid
  const isSessionValid = simpleSessionService.isAuthenticated();

  // Log authentication state for debugging
  console.log('Auth check:', { hasFirebaseAuth, isGuest, isSessionValid });

  return hasFirebaseAuth || (isGuest && isSessionValid);
};

/**
 * Ensure user is authenticated, redirect to login if not
 * @returns boolean indicating if user is authenticated
 */
export const ensureAuthenticated = (): boolean => {
  const authenticated = isAuthenticated();
  const onProtectedPage = isProtectedPage();
  const onAuthPage = isAuthPage();

  console.log('Ensure authenticated:', { authenticated, onProtectedPage, onAuthPage });

  if (!authenticated && onProtectedPage && !onAuthPage) {
    console.log('Not authenticated on protected page - redirecting to login');
    redirectToLogin();
    return false;
  }

  return authenticated;
};

/**
 * Get the base URL for the application
 * @returns string with the base URL
 */
export const getBaseUrl = (): string => {
  return window.location.pathname.includes('/SafeBite-V1')
    ? '/SafeBite-V1'
    : '';
};

/**
 * Fix the authentication state by checking and refreshing sessions
 * Call this function when there might be auth issues
 */
export const fixAuthState = (): void => {
  const auth = getAuth(app);

  // If we have a Firebase user but no valid session, refresh the session
  if (auth.currentUser && !simpleSessionService.getSessionInfo()) {
    simpleSessionService.refreshSession('logged-in');
    console.log('Fixed auth state: Created new session for Firebase user');
  }

  // If we're in guest mode but session is invalid, refresh it
  if (guestAuthService.isGuestUser() && !simpleSessionService.isAuthenticated()) {
    simpleSessionService.refreshSession('guest');
    console.log('Fixed auth state: Refreshed guest session');
  }

  // If we're on a protected page but not authenticated, redirect to login
  if (isProtectedPage() && !isAuthenticated() && !isAuthPage()) {
    console.log('Fixed auth state: Redirecting to login from protected page');
    redirectToLogin();
  }
};
