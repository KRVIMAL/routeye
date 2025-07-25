export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  maxHeight?: number;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  onSearch?: (searchTerm: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (option: SelectOption | SelectOption[]) => React.ReactNode;
  asteriskPosition?: "left" | "right";
  fullWidth?: boolean;
  variant?: "floating" | "normal";
  onBlur?: (value: string | string[] | null | undefined) => void;
  validateOnBlur?: boolean;
}
