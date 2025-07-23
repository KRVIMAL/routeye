// src/components/ui/PhoneInput.tsx - Specialized Phone Input
import React from 'react';
import CustomInput from './CustomInput';
import {FiPhone} from "react-icons/fi"
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

interface CustomInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local";
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
  size?: "sm" | "md" | "lg";
  variant?: "outlined" | "filled" | "underlined";
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
  phoneFormat?: "US" | "international" | "none";

  className?: string;
}

interface PhoneInputProps extends Omit<CustomInputProps, 'type'> {
  country?: 'US' | 'international';
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  country = 'US',
  validation,
  ...props
}) => {
  const phoneValidation: ValidationRules = {
    phone: true,
    maxLength: country === 'US' ? 14 : 15, // Formatted length
    ...validation
  };

  return (
    <CustomInput
      {...props}
      type="tel"
      phoneFormat={country}
      validation={phoneValidation}
      leftIcon={FiPhone}
      placeholder={country === 'US' ? '(555) 123-4567' : '+1234567890'}
      helperText={
        country === 'US' 
          ? 'Enter US phone number'
          : 'Enter international phone number'
      }
    />
  );
};