// src/components/ui/Input.tsx - Themed input component
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-body-small font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'border-error-500 focus:border-error-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-caption text-error-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-caption text-text-muted">{helper}</p>
      )}
    </div>
  );
};

export default Input;