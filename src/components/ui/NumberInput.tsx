// src/components/ui/NumberInput.tsx - Specialized Number Input
import React from "react";
import { FiDollarSign } from "react-icons/fi";
import CustomInput from "./CustomInput";

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

interface NumberInputProps extends Omit<CustomInputProps, "type"> {
  currency?: boolean;
  percentage?: boolean;
  thousandSeparator?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  currency = false,
  percentage = false,
  thousandSeparator = false,
  formatValue,
  ...props
}) => {
  const customFormatValue = (value: string): string => {
    if (formatValue) return formatValue(value);

    let formatted = value;

    if (thousandSeparator) {
      // Add thousand separators
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatted = parts.join(".");
    }

    return formatted;
  };

  return (
    <CustomInput
      {...props}
      type="number"
      formatValue={customFormatValue}
      leftIcon={currency ? FiDollarSign : undefined}
      helperText={
        percentage ? "Enter value as percentage (0-100)" : props.helperText
      }
    />
  );
};
