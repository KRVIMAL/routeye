// src/components/ui/EmailInput.tsx - Specialized Email Input
import { FiMail } from "react-icons/fi";
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
export const EmailInput: React.FC<Omit<CustomInputProps, "type">> = ({
  validation,
  ...props
}) => {
  const emailValidation: ValidationRules = {
    email: true,
    ...validation,
  };

  return (
    <CustomInput
      {...props}
      type="email"
      validation={emailValidation}
      leftIcon={FiMail}
      placeholder="example@email.com"
    />
  );
};
