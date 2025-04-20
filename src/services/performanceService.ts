/**
 * Performance monitoring service
 * 
 * This service provides utilities for monitoring and optimizing application performance
 */

// Interface for performance metrics
interface PerformanceMetrics {
  timeToFirstByte?: number;
  timeToFirstPaint?: number;
  timeToFirstContentfulPaint?: number;
  domContentLoaded?: number;
  windowLoaded?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  longTasks?: number;
  memoryUsage?: number;
}

// Initialize performance metrics
let metrics: PerformanceMetrics = {};

/**
 * Start monitoring performance
 */
export const startPerformanceMonitoring = (): void => {
  try {
    // Create a performance observer for Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      // LCP observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
        console.log('LCP:', metrics.largestContentfulPaint);
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // FID observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-input') {
            metrics.firstInputDelay = entry.processingStart - entry.startTime;
            console.log('FID:', metrics.firstInputDelay);
          }
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // CLS observer
      const clsObserver = new PerformanceObserver((entryList) => {
        let cls = 0;
        entryList.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
          }
        });
        metrics.cumulativeLayoutShift = cls;
        console.log('CLS:', metrics.cumulativeLayoutShift);
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Long tasks observer
      const longTasksObserver = new PerformanceObserver((entryList) => {
        metrics.longTasks = (metrics.longTasks || 0) + entryList.getEntries().length;
        console.log('Long tasks:', metrics.longTasks);
      });
      
      longTasksObserver.observe({ type: 'longtask', buffered: true });
    }
    
    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (performance.timing) {
          const timing = performance.timing;
          
          metrics.timeToFirstByte = timing.responseStart - timing.navigationStart;
          metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
          metrics.windowLoaded = timing.loadEventEnd - timing.navigationStart;
          
          console.log('Performance metrics:', metrics);
        }
        
        // Get memory usage if available
        if ((performance as any).memory) {
          metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
          console.log('Memory usage (MB):', metrics.memoryUsage);
        }
      }, 0);
    });
  } catch (error) {
    console.error('Error starting performance monitoring:', error);
  }
};

/**
 * Measure execution time of a function
 * @param fn Function to measure
 * @param name Name of the measurement
 * @returns Result of the function
 */
export function measureExecutionTime<T>(fn: () => T, name: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

/**
 * Create a performance mark
 * @param name Name of the mark
 */
export const mark = (name: string): void => {
  try {
    performance.mark(name);
  } catch (error) {
    console.error(`Error creating mark ${name}:`, error);
  }
};

/**
 * Measure time between two marks
 * @param name Name of the measure
 * @param startMark Start mark name
 * @param endMark End mark name
 * @returns Duration in milliseconds
 */
export const measure = (name: string, startMark: string, endMark: string): number | null => {
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      return entries[0].duration;
    }
  } catch (error) {
    console.error(`Error measuring ${name}:`, error);
  }
  
  return null;
};

/**
 * Get current performance metrics
 * @returns Performance metrics object
 */
export const getPerformanceMetrics = (): PerformanceMetrics => {
  return { ...metrics };
};

export default {
  startPerformanceMonitoring,
  measureExecutionTime,
  mark,
  measure,
  getPerformanceMetrics
};
