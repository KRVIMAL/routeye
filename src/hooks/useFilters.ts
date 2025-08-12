import { useState, useEffect } from 'react';

interface Filter {
  field: string;
  value: any[];
  label?: string;
}

const STORAGE_KEY = 'devices_filters';

export const useDeviceFilters = () => {
  const [filters, setFilters] = useState<Filter[]>([]);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (error) {
        console.error('Failed to parse saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateFilters = (newFilters: Filter[]) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    filters,
    updateFilters,
    clearFilters,
  };
};