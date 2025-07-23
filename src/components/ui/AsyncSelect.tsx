// src/components/ui/AsyncSelect.tsx - Async version for API data
import React, { useState, useEffect, useCallback } from 'react';
import Select from './Select';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[]|any;
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  className?: string;
  maxHeight?: number;
  renderOption?: (option: SelectOption) => React.ReactNode;
  noOptionsMessage?: string;
  loadingMessage?: string;
  onSearchChange?: (searchTerm: string) => void;
}

interface AsyncSelectProps extends Omit<SelectProps, 'options' | 'loading'> {
  loadOptions: (searchTerm: string) => Promise<SelectOption[]>;
  debounceMs?: number;
  cacheOptions?: boolean;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({
  loadOptions,
  debounceMs = 100,
  cacheOptions = true,
  searchable = true,
  ...props
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, SelectOption[]>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedLoadOptions = useCallback(
    debounce(async (term: string) => {
      if (cacheOptions && cache[term]) {
        setOptions(cache[term]);
        return;
      }

      setLoading(true);
      try {
        const newOptions = await loadOptions(term);
        setOptions(newOptions);
        
        if (cacheOptions) {
          setCache(prev => ({ ...prev, [term]: newOptions }));
        }
      } catch (error) {
        console.error('Failed to load options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [loadOptions, cacheOptions, cache, debounceMs]
  );

  useEffect(() => {
    debouncedLoadOptions(searchTerm);
  }, [searchTerm, debouncedLoadOptions]);

  // Load initial options
  useEffect(() => {
    debouncedLoadOptions('');
  }, []);

  // Custom Select component that handles search
  return (
    <Select
      {...props}
      options={options}
      loading={loading}
      searchable={searchable}
      onSearchChange={setSearchTerm}
    />
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export { AsyncSelect };

