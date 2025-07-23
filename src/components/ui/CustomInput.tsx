// src/components/ui/CustomInput.tsx - Enhanced Input Component
import React, { useState, useEffect, forwardRef } from 'react';
import { 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle, 
  FiCheck, 
  FiLoader,
  FiPhone,
  FiMail,
  FiUser,
  FiLock,
  FiDollarSign,
  FiCalendar
} from 'react-icons/fi';

interface InputRangeTypes {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

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

interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  name?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  helperText?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  
  // Enhanced props
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  validation?: ValidationRules;
  loading?: boolean;
  success?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  onRightIconClick?: () => void;
  showPasswordToggle?: boolean;
  autoValidate?: boolean;
  formatValue?: (value: string) => string;
  propsToInputElement?: InputRangeTypes;
  
  // Number input specific
  step?: number;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  decimalPlaces?: number;
  
  // Phone number specific
  phoneFormat?: 'US' | 'international' | 'none';
  
  className?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
  label,
  placeholder,
  value = '',
  onChange,
  type = 'text',
  name,
  onKeyPress,
  error: externalError,
  required = false,
  id,
  disabled = false,
  helperText,
  onBlur,
  onClick,
  
  // Enhanced props
  size = 'md',
  variant = 'outlined',
  validation,
  loading = false,
  success = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  showPasswordToggle = true,
  autoValidate = true,
  formatValue,
  propsToInputElement,
  
  // Number input specific
  step,
  allowNegative = true,
  allowDecimal = true,
  decimalPlaces = 2,
  
  // Phone number specific
  phoneFormat = 'US',
  
  className = '',
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(String(value || ''));
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const error = externalError || internalError;
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError && internalValue.length > 0;

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(String(value || ''));
  }, [value]);

  // Validation function
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

  // Format phone number
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

  // Format number input
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

  // Handle input change
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
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasBeenBlurred(true);
    
    if (autoValidate) {
      const validationError = validateValue(internalValue);
      setInternalError(validationError);
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle key press for number inputs
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const char = String.fromCharCode(e.which);
      const isValidChar = /[\d\.\-]/.test(char);
      const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'].includes(e.key);
      
      if (!isValidChar && !isControlKey) {
        e.preventDefault();
      }
    }
    
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  // Get appropriate icon based on input type
  const getDefaultIcon = () => {
    switch (type) {
      case 'email': return FiMail;
      case 'tel': return FiPhone;
      case 'password': return FiLock;
      case 'number': return FiDollarSign;
      case 'date':
      case 'time':
      case 'datetime-local': return FiCalendar;
      default: return FiUser;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variant classes
  const getVariantClasses = () => {
    const base = 'w-full transition-all duration-200 bg-theme-primary text-text-primary';
    
    switch (variant) {
      case 'filled':
        return `${base} bg-theme-tertiary border-0 border-b-2 rounded-t-md focus:bg-theme-primary`;
      case 'underlined':
        return `${base} bg-transparent border-0 border-b-2 rounded-none px-0`;
      default: // outlined
        return `${base} border rounded-md`;
    }
  };

  const getBorderClasses = () => {
    if (hasError) return 'border-error-500 focus:border-error-500 focus:ring-error-100';
    if (hasSuccess) return 'border-success-500 focus:border-success-500 focus:ring-success-100';
    if (isFocused) return 'border-primary-500 focus:border-primary-500 focus:ring-primary-100';
    return 'border-border-medium focus:border-primary-500 focus:ring-primary-100';
  };

  const inputClasses = `
    ${getVariantClasses()}
    ${sizeClasses[size]}
    ${getBorderClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${LeftIcon ? 'pl-12' : ''}
    ${RightIcon || (type === 'password' && showPasswordToggle) || hasError || hasSuccess || loading ? 'pr-12' : ''}
    focus:outline-none focus:ring-2
    placeholder:text-text-muted
    ${className}
  `.trim();

  const IconToShow = LeftIcon || getDefaultIcon();

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-body-small font-medium text-text-primary">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {/* {(LeftIcon || (!LeftIcon && (type === 'email' || type === 'tel' || type === 'password'))) && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
            <IconToShow className="w-5 h-5" />
          </div>
        )} */}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyPress={handleKeyPress}
          onClick={onClick}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Loading Spinner */}
          {loading && (
            <FiLoader className="w-5 h-5 text-primary-500 animate-spin" />
          )}

          {/* Success Icon */}
          {hasSuccess && !loading && (
            <FiCheck className="w-5 h-5 text-success-500" />
          )}

          {/* Error Icon */}
          {hasError && !loading && (
            <FiAlertCircle className="w-5 h-5 text-error-500" />
          )}

          {/* Password Toggle */}
          {type === 'password' && showPasswordToggle && !loading && !hasError && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          )}

          {/* Custom Right Icon */}
          {RightIcon && !loading && !hasError && !hasSuccess && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              <RightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-error-600 flex items-center space-x-1">
          <FiAlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-caption text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;





