import { useState, useEffect } from 'react';

// Define breakpoints that match Tailwind's default breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Breakpoint values in pixels (matching Tailwind's defaults)
const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Custom hook for responsive design
 * @returns Object with current breakpoint and utility functions
 */
export function useResponsive() {
  // Initialize with a default breakpoint
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Function to update all responsive states
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update window size
      setWindowSize({ width, height });
      
      // Determine current breakpoint
      let newBreakpoint: Breakpoint = 'xs';
      
      if (width >= breakpoints['2xl']) {
        newBreakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        newBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        newBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        newBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        newBreakpoint = 'sm';
      }
      
      setCurrentBreakpoint(newBreakpoint);
      
      // Update device type flags
      setIsMobile(width < breakpoints.md);
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
      setIsDesktop(width >= breakpoints.lg);
    };

    // Set initial values
    updateResponsiveState();

    // Add event listener for window resize
    window.addEventListener('resize', updateResponsiveState);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
    };
  }, []);

  // Utility functions to check if current breakpoint is at least a certain size
  const isAtLeast = (breakpoint: Breakpoint): boolean => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  };

  // Utility functions to check if current breakpoint is at most a certain size
  const isAtMost = (breakpoint: Breakpoint): boolean => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  };

  // Utility function to check if current breakpoint is between two sizes
  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return isAtLeast(min) && isAtMost(max);
  };

  return {
    // Current state
    breakpoint: currentBreakpoint,
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    
    // Utility functions
    isAtLeast,
    isAtMost,
    isBetween,
    
    // Specific breakpoint checks
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
  };
}

export default useResponsive;
