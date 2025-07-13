// Performance optimization utilities

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory management utilities
export const createWeakCache = <K extends object, V>() => {
  const cache = new WeakMap<K, V>();
  return {
    get: (key: K): V | undefined => cache.get(key),
    set: (key: K, value: V) => cache.set(key, value),
    has: (key: K): boolean => cache.has(key),
    delete: (key: K): boolean => cache.delete(key),
  };
};

// Performance monitoring
export const measurePerformance = <T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}; 