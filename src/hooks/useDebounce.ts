import { useState, useEffect, useCallback } from 'react';

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function debounceEventHandler(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  
  return function (event: any) {
    const later = () => {
      clearTimeout(timeout);
      func(event);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
