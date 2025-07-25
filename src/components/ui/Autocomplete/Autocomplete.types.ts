export interface AutocompleteOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

export interface AutocompleteProps {
  id: string;
  options: AutocompleteOption[];
  value?: AutocompleteOption | AutocompleteOption[] | null;
  onChange: (event: React.SyntheticEvent, value: AutocompleteOption | AutocompleteOption[] | null) => void;
  onInputChange?: (event: React.SyntheticEvent, value: string, reason: 'input' | 'reset' | 'clear') => void;
  placeholder?: string;
  label?: string;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  required?: boolean;
  clearIcon?: boolean;
  showCheckbox?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'floating';
  className?: string;
  dropdownClassName?: string;
  maxDisplayedOptions?: number;
  freeSolo?: boolean;
  filterOptions?: (options: AutocompleteOption[], { inputValue }: { inputValue: string }) => AutocompleteOption[];
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: AutocompleteOption) => React.ReactNode;
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderTags?: (value: AutocompleteOption[], getTagProps: (index: number) => AutocompleteTagProps) => React.ReactNode;
  noOptionsText?: string;
  loadingText?: string;
  clearText?: string;
  openText?: string;
  closeText?: string;
  limitTags?: number;
  fullWidth?: boolean;
  autoHighlight?: boolean;
  autoSelect?: boolean;
  includeInputInList?: boolean;
  disableClearable?: boolean;
  disableCloseOnSelect?: boolean;
  disabledItemsFocusable?: boolean;
  groupBy?: (option: AutocompleteOption) => string;
  isOptionEqualToValue?: (option: AutocompleteOption, value: AutocompleteOption) => boolean;
  getOptionLabel?: (option: AutocompleteOption) => string;
  getOptionDisabled?: (option: AutocompleteOption) => boolean;
}

export interface AutocompleteRenderInputParams {
  className: string;
  disabled?: boolean;
  fullWidth?: boolean;
  id: string;
  size?: 'sm' | 'md' | 'lg';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  InputLabelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  InputProps: {
    ref: React.Ref<any>;
    className: string;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
}

export interface AutocompleteTagProps {
  key: number;
  className: string;
  disabled?: boolean;
  onDelete: (event: React.SyntheticEvent) => void;
}