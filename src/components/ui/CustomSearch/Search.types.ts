// types/Search.types.ts - Add these props
export interface CustomSearchProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  maxLength?: number;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  showSearchButton?: boolean;
  ref?: React.RefObject<HTMLInputElement>;
  // New responsive props
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  responsive?: boolean;
  fullWidth?: boolean;
}
// types/Search.types.ts - Add this interface
export interface SearchRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}
