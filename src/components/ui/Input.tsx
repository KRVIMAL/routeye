// src/components/ui/Input.tsx
import React, { forwardRef, useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { useTheme } from '../../hooks/useTheme';

// Icon component type for flexibility
export interface IconProps {
  className?: string;
}

// Validation rules interface (same as your existing CustomInput)
interface ValidationRules {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

// Input range types (same as your existing CustomInput)
interface InputRangeTypes {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// Comprehensive Input Props Interface
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Core input properties
  variant?: 'default' | 'outlined' | 'filled' | 'underlined' | 'custom';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

  // Label and validation
  label?: string;
  required?: boolean;
  error?: string | boolean;
  helperText?: string;
  showAsterisk?: boolean;
  asteriskPosition?: 'left' | 'right';

  // Icons
  leftIcon?: IconType | React.ComponentType<IconProps> | React.ReactNode;
  rightIcon?: IconType | React.ComponentType<IconProps> | React.ReactNode;
  onRightIconClick?: () => void;

  // Input states
  loading?: boolean;
  success?: boolean;

  // Validation system (same as your existing CustomInput)
  validation?: ValidationRules;
  autoValidate?: boolean;
  propsToInputElement?: InputRangeTypes;

  // Custom styling
  width?: string | number;
  height?: string | number;
  customColors?: {
    background?: string;
    text?: string;
    border?: string;
    label?: string;
    placeholder?: string;
    focus?: {
      background?: string;
      text?: string;
      border?: string;
    };
    error?: {
      background?: string;
      text?: string;
      border?: string;
    };
  };

  // Layout
  fullWidth?: boolean;

  // Additional styling
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  // Password toggle
  showPasswordToggle?: boolean;

  // Number input specific (same as your existing CustomInput)
  step?: number;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  decimalPlaces?: number;

  // Phone format (same as your existing CustomInput)
  phoneFormat?: 'US' | 'international' | 'none';

  // Formatting (same as your existing CustomInput)
  formatValue?: (value: string) => string;

  // Container props
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;

  // Custom className for input element
  className?: string;

  // Callback for value changes
  onValueChange?: (value: string) => void;
}

// Loading Spinner Component for input
const InputSpinner: React.FC<{ size?: string }> = ({ size = "w-4 h-4" }) => (
  <div className={`animate-spin rounded-full border-b-2 border-current ${size}`} />
);

// Default Icons
export const SearchIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.121-6.121A9.97 9.97 0 0121 12c0 .966-.133 1.905-.389 2.799m-17.222 0A9.97 9.97 0 003 12a9.97 9.97 0 00.389-2.799" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const ExclamationIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  loading: loadingProp = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconClick,
  label,
  required = false,
  error: externalError,
  helperText,
  showAsterisk = true,
  asteriskPosition = 'right',
  success = false,
  showPasswordToggle = true,

  // Validation props (same as your existing CustomInput)
  validation,
  autoValidate = true,
  propsToInputElement,

  // Number input props
  step,
  allowNegative = true,
  allowDecimal = true,
  decimalPlaces = 2,

  // Phone format
  phoneFormat = 'US',

  // Formatting
  formatValue,

  width,
  height,
  customColors,
  fullWidth = false,
  rounded = 'md',
  shadow = 'none',
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  className = '',
  onValueChange,
  onChange,
  type = 'text',
  style,
  value: externalValue = '',
  ...props
}, ref) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(String(externalValue || ''));
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(String(externalValue || ''));
  }, [externalValue]);

  // Determine if there's an error
  const error = externalError || internalError;
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : '';
  const hasSuccess = success && !hasError && internalValue.length > 0;

  // Handle input type for password toggle
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Validation function (same as your existing CustomInput)
  const validateValue = (val: string): string => {
    if (!validation && !required) return '';

    const trimmedValue = val.trim();

    // Required validation
    if (required && !trimmedValue) {
      return `${label || 'This field'} is required`;
    }

    if (!trimmedValue) return ''; // Skip other validations if empty and not required

    // Email validation
    if (validation?.email || type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (validation?.phone || type === 'tel') {
      const phoneRegex = phoneFormat === 'US'
        ? /^[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/
        : /^[\+]?[1-9]\d{1,14}$/;

      if (!phoneRegex.test(trimmedValue.replace(/[\s\-\.\(\)]/g, ''))) {
        return phoneFormat === 'US'
          ? 'Please enter a valid US phone number'
          : 'Please enter a valid phone number';
      }
    }

    // Length validations
    const minLen = validation?.minLength || propsToInputElement?.minLength;
    const maxLen = validation?.maxLength || propsToInputElement?.maxLength;

    if (minLen && trimmedValue.length < minLen) {
      return `Minimum ${minLen} characters required`;
    }

    if (maxLen && trimmedValue.length > maxLen) {
      return `Maximum ${maxLen} characters allowed`;
    }

    // Number validations
    if (type === 'number') {
      const numValue = parseFloat(trimmedValue);
      const minVal = validation?.min || propsToInputElement?.min;
      const maxVal = validation?.max || propsToInputElement?.max;

      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }

      if (!allowNegative && numValue < 0) {
        return 'Negative numbers are not allowed';
      }

      if (minVal !== undefined && numValue < minVal) {
        return `Value must be at least ${minVal}`;
      }

      if (maxVal !== undefined && numValue > maxVal) {
        return `Value must not exceed ${maxVal}`;
      }
    }

    // Pattern validation
    if (validation?.pattern && !validation.pattern.test(trimmedValue)) {
      return 'Please enter a valid format';
    }

    // Custom validation
    if (validation?.custom) {
      const customError = validation.custom(trimmedValue);
      if (customError) return customError;
    }

    return '';
  };

  // Format phone number (same as your existing CustomInput)
  const formatPhoneNumber = (val: string): string => {
    if (type !== 'tel' || phoneFormat === 'none') return val;

    const cleaned = val.replace(/\D/g, '');

    if (phoneFormat === 'US') {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }

    return cleaned;
  };

  // Format number input (same as your existing CustomInput)
  const formatNumber = (val: string): string => {
    if (type !== 'number') return val;

    let cleaned = val;

    // Remove non-numeric characters except decimal point and minus sign
    if (!allowDecimal) {
      cleaned = cleaned.replace(/[^\d\-]/g, '');
    } else {
      cleaned = cleaned.replace(/[^\d\.\-]/g, '');
    }

    // Handle negative numbers
    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, '');
    }

    // Handle decimal places
    if (allowDecimal && decimalPlaces !== undefined) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts[1] && parts[1].length > decimalPlaces) {
        cleaned = parts[0] + '.' + parts[1].slice(0, decimalPlaces);
      }
    }

    return cleaned;
  };

  // Handle input change (same logic as your existing CustomInput)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Apply number formatting
    if (type === 'number') {
      newValue = formatNumber(newValue);
    }

    // Apply phone formatting
    if (type === 'tel') {
      newValue = formatPhoneNumber(newValue);
    }

    // Apply custom formatting
    if (formatValue) {
      newValue = formatValue(newValue);
    }

    // Apply max length restriction
    const maxLen = propsToInputElement?.maxLength || validation?.maxLength;
    if (maxLen && newValue.length > maxLen) {
      newValue = newValue.slice(0, maxLen);
    }

    setInternalValue(newValue);

    // Validate if auto-validate is enabled and field has been blurred
    if (autoValidate && hasBeenBlurred) {
      const validationError = validateValue(newValue);
      setInternalError(validationError);
    }

    // Call external onChange
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: newValue }
      };
      onChange(syntheticEvent);
    }

    // Call onValueChange
    onValueChange?.(newValue);
  };

  // Handle blur (same as your existing CustomInput)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasBeenBlurred(true);

    if (autoValidate) {
      const validationError = validateValue(internalValue);
      setInternalError(validationError);
    }

    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle key press for number inputs (same as your existing CustomInput)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const char = String.fromCharCode(e.which);
      const isValidChar = /[\d\.\-]/.test(char);
      const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'].includes(e.key);

      if (!isValidChar && !isControlKey) {
        e.preventDefault();
      }
    }

    if (props.onKeyPress) {
      props.onKeyPress(e);
    }
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      input: 'pl-2.5 pr-2 py-1 text-xs',
      height: 'h-6',
      iconSize: 'w-3 h-3',
      iconPadding: { left: 'pl-7', right: 'pr-7' },
      iconPosition: { left: 'left-2', right: 'right-2' },
      label: 'text-xs',
      helper: 'text-xs',
      labelLeft: 'left-2'
    },
    sm: {
      input: 'pl-3.5 pr-3 py-1.5 text-sm',
      height: 'h-8',
      iconSize: 'w-4 h-4',
      iconPadding: { left: 'pl-9', right: 'pr-9' },
      iconPosition: { left: 'left-2.5', right: 'right-2.5' },
      label: 'text-sm',
      helper: 'text-xs',
      labelLeft: 'left-3'
    },
    md: {
      input: 'pl-3.5 pr-3 py-2 text-sm',
      height: 'h-10',
      iconSize: 'w-4 h-4',
      iconPadding: { left: 'pl-10', right: 'pr-10' },
      iconPosition: { left: 'left-3', right: 'right-3' },
      label: 'text-sm',
      helper: 'text-sm',
      labelLeft: 'left-3'
    },
    lg: {
      input: 'pl-3.5 pr-3 py-2.5 text-base',
      height: 'h-12',
      iconSize: 'w-5 h-5',
      iconPadding: { left: 'pl-12', right: 'pr-12' },
      iconPosition: { left: 'left-3.5', right: 'right-3.5' },
      label: 'text-base',
      helper: 'text-sm',
      labelLeft: 'left-3'
    },
    xl: {
      input: 'pl-5.5 pr-5 py-3 text-lg',
      height: 'h-14',
      iconSize: 'w-6 h-6',
      iconPadding: { left: 'pl-14', right: 'pr-14' },
      iconPosition: { left: 'left-4', right: 'right-4' },
      label: 'text-lg',
      helper: 'text-base',
      labelLeft: 'left-5'
    },
    custom: {
      input: '',
      height: '',
      iconSize: 'w-4 h-4',
      iconPadding: { left: 'pl-10', right: 'pr-10' },
      iconPosition: { left: 'left-3', right: 'right-3' },
      label: 'text-sm',
      helper: 'text-sm',
      labelLeft: 'left-3'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      base: 'border bg-background text-text-primary',
      normal: 'border-[#4285F4]',
      focus: 'focus:border-[#4285F4] focus:outline-none',
      error: 'border-red-500 focus:border-red-500 focus:outline-none',
      success: 'border-green-500 focus:border-green-500 focus:outline-none',
      placeholder: 'placeholder:text-[#808080]'
    },
    outlined: {
      base: 'border-2 bg-transparent text-text-primary',
      normal: 'border-[#4285F4]',
      focus: 'focus:border-[#4285F4] focus:outline-none',
      error: 'border-red-500 focus:border-red-500 focus:outline-none',
      success: 'border-green-500 focus:border-green-500 focus:outline-none',
      placeholder: 'placeholder:text-[#808080]'
    },
    filled: {
      base: 'border-0 bg-surface text-text-primary',
      normal: 'bg-surface',
      focus: 'focus:bg-background focus:outline-none',
      error: 'bg-red-50 dark:bg-red-900/20 focus:outline-none',
      success: 'bg-green-50 dark:bg-green-900/20 focus:outline-none',
      placeholder: 'placeholder:text-[#808080]'
    },
    underlined: {
      base: 'border-0 border-b-2 bg-transparent text-text-primary rounded-none',
      normal: 'border-[#4285F4]',
      focus: 'focus:border-[#4285F4] focus:outline-none',
      error: 'border-red-500 focus:border-red-500 focus:outline-none',
      success: 'border-green-500 focus:border-green-500 focus:outline-none',
      placeholder: 'placeholder:text-[#808080]'
    },
    custom: {
      base: '',
      normal: '',
      focus: 'focus:outline-none',
      error: 'focus:outline-none',
      success: 'focus:outline-none',
      placeholder: 'placeholder:text-[#808080]'
    }
  };

  // Rounded configurations
  const roundedConfig = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
    custom: ''
  };

  // Shadow configurations
  const shadowConfig = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  // Get current configurations
  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];
  const currentRounded = roundedConfig[rounded];
  const currentShadow = shadowConfig[shadow];

  // Determine state classes
  const getStateClasses = () => {
    if (hasError) return currentVariant.error;
    if (hasSuccess) return currentVariant.success;
    return currentVariant.normal;
  };

  // Build input classes
  const inputClasses = [
    currentVariant.base,
    getStateClasses(),
    variant !== 'custom' ? currentVariant.focus : '',
    variant !== 'custom' ? currentVariant.placeholder : '',
    size !== 'custom' ? currentSize.input : '',
    size !== 'custom' ? currentSize.height : '',
    currentRounded,
    currentShadow,
    'transition-all duration-200 outline-none',
    fullWidth ? 'w-full' : '',
    // Icon padding
    leftIcon ? currentSize.iconPadding.left : '',
    (rightIcon || type === 'password' || loadingProp || hasSuccess || hasError) ? currentSize.iconPadding.right : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  // Custom styles
  const customStyles: React.CSSProperties = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(customColors && {
      backgroundColor: customColors.background,
      color: customColors.text,
      borderColor: customColors.border,
    }),
  };

  // Render icon
  const renderIcon = (icon: typeof leftIcon, position: 'left' | 'right') => {
    if (!icon) return null;

    // Handle react-icons IconType
    if (typeof icon === 'function') {
      const IconComponent = icon as IconType | React.ComponentType<IconProps>;
      return (
        <div className={`absolute ${currentSize.iconPosition[position]} top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none`}>
          <IconComponent className={currentSize.iconSize} />
        </div>
      );
    }

    // If it's a React element
    if (React.isValidElement(icon)) {
      return (
        <div className={`absolute ${currentSize.iconPosition[position]} top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none`}>
          {React.cloneElement(icon as React.ReactElement<any>, {
            className: currentSize.iconSize
          })}
        </div>
      );
    }

    return (
      <div className={`absolute ${currentSize.iconPosition[position]} top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none`}>
        {icon}
      </div>
    );
  };

  // Render right side icons (password toggle, loading, success, custom icon)
  const renderRightIcons = () => {
    const icons = [];

    // Loading spinner
    if (loadingProp) {
      icons.push(
        <div key="loading" className={`absolute ${currentSize.iconPosition.right} top-1/2 transform -translate-y-1/2 text-primary-500`}>
          <InputSpinner size={currentSize.iconSize} />
        </div>
      );
    }
    // Success icon
    else if (hasSuccess) {
      icons.push(
        <div key="success" className={`absolute ${currentSize.iconPosition.right} top-1/2 transform -translate-y-1/2 text-green-500`}>
          <CheckIcon className={currentSize.iconSize} />
        </div>
      );
    }
    // Remove this entire error icon block
    // else if (hasError) {
    //   icons.push(
    //     <div key="error" className={`absolute ${currentSize.iconPosition.right} top-1/2 transform -translate-y-1/2 text-red-500`}>
    //       <ExclamationIcon className={currentSize.iconSize} />
    //     </div>
    //   );
    // }
    // Password toggle
    else if (type === 'password' && showPasswordToggle) {
      icons.push(
        <button
          key="password-toggle"
          type="button"
          className={`absolute ${currentSize.iconPosition.right} top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer`}
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? <EyeOffIcon className={currentSize.iconSize} /> : <EyeIcon className={currentSize.iconSize} />}
        </button>
      );
    }
    // Custom right icon
    else if (rightIcon) {
      icons.push(
        <button
          key="custom-right-icon"
          type="button"
          className={`absolute ${currentSize.iconPosition.right} top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer`}
          onClick={onRightIconClick}
          tabIndex={-1}
        >
          {renderIcon(rightIcon, 'right')}
        </button>
      );
    }

    return icons;
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {/* Input Container with Label */}
      <div className="relative">
        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          style={customStyles}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          step={step}
          aria-invalid={hasError}
          aria-describedby={hasError ? `input-error` : helperText ? `input-helper` : undefined}
          {...props}
        />

        {/* Floating Label positioned in the middle of top border */}
        {label && (
          <label className={`absolute -top-3 ${currentSize.labelLeft} px-1 bg-background text-text-primary font-medium ${currentSize.label} ${labelClassName}`}>
            {required && showAsterisk && asteriskPosition === 'left' && <span className="text-red-500 mr-1">*</span>}
            {label}
            {required && showAsterisk && asteriskPosition === 'right' && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Left Icon */}
        {leftIcon && renderIcon(leftIcon, 'left')}

        {/* Right Icons */}
        {renderRightIcons()}
      </div>

      {/* Error Message */}
      {hasError && (
        <div id="input-error" className={`flex items-center mt-1 text-red-500 ${currentSize.helper} ${errorClassName}`}>
          <ExclamationIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <div id="input-helper" className={`mt-1 text-text-secondary ${currentSize.helper} ${helperClassName}`}>
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Specialized Input Components
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="password" {...props} />
);

export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon = SearchIcon, placeholder = "Search...", ...props }, ref) => (
    <Input ref={ref} leftIcon={leftIcon} placeholder={placeholder} {...props} />
  )
);

export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="email" validation={{ email: true }} {...props} />
);

export const NumberInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="number" {...props} />
);

export const PhoneInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="tel" validation={{ phone: true }} {...props} />
);

// Form Input with validation example (same API as your existing CustomInput)
export const FormInput: React.FC<InputProps & {
  validation?: ValidationRules
}> = ({ validation, onValueChange, autoValidate = true, ...props }) => {
  return (
    <Input
      {...props}
      validation={validation}
      autoValidate={autoValidate}
      onValueChange={onValueChange}
    />
  );
};

// RouteYe Input presets for your project
export const RouteYeInput: React.FC<InputProps> = ({
  className = '',
  size = 'lg',
  rounded = 'lg',
  ...props
}) => (
  <Input
    variant="default"
    size={size}
    rounded={rounded}
    className={`border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none placeholder:text-[#808080] ${className}`}
    {...props}
  />
);

export const RouteYeFormInput: React.FC<InputProps & { validation?: ValidationRules }> = ({
  className = '',
  validation,
  onValueChange,
  autoValidate = true,
  ...props
}) => {
  return (
    <Input
      variant="default"
      size="lg"
      rounded="lg"
      className={`border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none placeholder:text-[#808080] ${className}`}
      validation={validation}
      autoValidate={autoValidate}
      onValueChange={onValueChange}
      {...props}
    />
  );
};

export const CustomInput = RouteYeFormInput;
