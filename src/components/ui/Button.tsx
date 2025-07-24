// src/components/ui/Button.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

// Icon component type for flexibility
export interface IconProps {
  className?: string;
}

// Comprehensive Button Props Interface
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  // Core button properties
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'custom';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

  // Loading and disabled states
  loading?: boolean;
  disabled?: boolean;

  // Icon configuration
  icon?: React.ComponentType<IconProps> | React.ReactNode;
  iconPosition?: 'left' | 'right' | 'only';

  // Custom styling
  width?: string | number;
  height?: string | number;
  customColors?: {
    background?: string;
    text?: string;
    border?: string;
    hover?: {
      background?: string;
      text?: string;
      border?: string;
    };
  };

  // Content
  children?: React.ReactNode;

  // Additional styling
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  // Layout
  fullWidth?: boolean;

  // Custom className for additional styling
  className?: string;
}

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "w-4 h-4" }) => (
  <svg
    className={`animate-spin ${size}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Default Icons for your use cases
export const CheckIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  width,
  height,
  customColors,
  children,
  rounded = 'md',
  shadow = 'sm',
  fullWidth = false,
  className = '',
  style,
  onClick,
  ...props
}) => {
  const { theme } = useTheme();

  // Base button classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-1',
    'focus:ring-offset-1',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ];

  // Size configurations
  const sizeConfig = {
    xs: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      iconSize: 'w-3 h-3',
      spinnerSize: 'w-3 h-3',
      height: 'h-6',
      gap: 'gap-1'
    },
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      iconSize: 'w-4 h-4',
      spinnerSize: 'w-4 h-4',
      height: 'h-8',
      gap: 'gap-1.5'
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      iconSize: 'w-4 h-4',
      spinnerSize: 'w-4 h-4',
      height: 'h-9',
      gap: 'gap-2'
    },
    lg: {
      padding: 'px-6 py-2.5',
      text: 'text-base',
      iconSize: 'w-5 h-5',
      spinnerSize: 'w-5 h-5',
      height: 'h-11',
      gap: 'gap-2'
    },
    xl: {
      padding: 'px-8 py-3',
      text: 'text-lg',
      iconSize: 'w-6 h-6',
      spinnerSize: 'w-6 h-6',
      height: 'h-12',
      gap: 'gap-2.5'
    },
    custom: {
      padding: '',
      text: '',
      iconSize: 'w-4 h-4',
      spinnerSize: 'w-4 h-4',
      height: '',
      gap: 'gap-2'
    }
  };

  // Variant configurations with your specified colors
  const variantConfig = {
    primary: {
      background: 'bg-primary-500',
      text: 'text-white',
      border: 'border-primary-500',
      hover: 'hover:bg-primary-600',
      focus: 'focus:ring-primary-500',
      hoverColors: '#1D40B0' // Your specified hover color
    },
    secondary: {
      background: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
      hover: 'hover:bg-neutral-200',
      focus: 'focus:ring-neutral-500',
      hoverColors: '#F1F1F1' // Your specified hover color
    },
    ghost: {
      background: 'bg-transparent',
      text: 'text-text-primary',
      border: 'border-transparent',
      hover: 'hover:bg-surface',
      focus: 'focus:ring-primary-500'
    },
    danger: {
      background: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-500',
      hover: 'hover:bg-red-600',
      focus: 'focus:ring-red-500'
    },
    success: {
      background: 'bg-green-500',
      text: 'text-white',
      border: 'border-green-500',
      hover: 'hover:bg-green-600',
      focus: 'focus:ring-green-500'
    },
    warning: {
      background: 'bg-yellow-500',
      text: 'text-white',
      border: 'border-yellow-500',
      hover: 'hover:bg-yellow-600',
      focus: 'focus:ring-yellow-500'
    },
    custom: {
      background: '',
      text: '',
      border: '',
      hover: '',
      focus: 'focus:ring-primary-500'
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

  // Build classes array
  const buttonClasses = [
    ...baseClasses,
    // Size classes
    size !== 'custom' ? currentSize.padding : '',
    size !== 'custom' ? currentSize.text : '',
    size !== 'custom' ? currentSize.height : '',
    currentSize.gap,

    // Variant classes (unless custom)
    variant !== 'custom' ? currentVariant.background : '',
    variant !== 'custom' ? currentVariant.text : '',
    variant !== 'custom' ? `border ${currentVariant.border}` : 'border',
    variant !== 'custom' ? currentVariant.hover : '',
    currentVariant.focus,

    // Layout classes
    currentRounded,
    currentShadow,
    fullWidth ? 'w-full' : '',

    // Custom className
    className
  ].filter(Boolean).join(' ');

  // Custom styles object
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

  // Add hover styles if custom colors provided
  const hoverStyles = customColors?.hover ? {
    '--hover-bg': customColors.hover.background,
    '--hover-text': customColors.hover.text,
    '--hover-border': customColors.hover.border,
  } as React.CSSProperties : {};

  // Render icon
  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size={currentSize.spinnerSize} />;
    }

    if (!icon) return null;

    // If it's a React component
    if (React.isValidElement(icon)) {
      return icon;
    }

    // If it's a component type
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<IconProps>;
      return <IconComponent className={currentSize.iconSize} />;
    }

    return icon;
  };

  // Determine content layout
  const renderContent = () => {
    const iconElement = renderIcon();

    if (iconPosition === 'only') {
      return iconElement;
    }

    if (iconPosition === 'right') {
      return (
        <>
          {children}
          {iconElement}
        </>
      );
    }

    // Default: left position
    return (
      <>
        {iconElement}
        {children}
      </>
    );
  };

  return (
    <button
      className={buttonClasses}
      style={{ ...customStyles, ...hoverStyles }}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Example usage and button variants for your designs
export const SubmitButton: React.FC<Omit<ButtonProps, 'variant' | 'icon'>> = (props) => (
  <Button variant="primary" icon={CheckIcon} {...props}>
    Submit
  </Button>
);

export const SubmitLoadingButton: React.FC<Omit<ButtonProps, 'variant' | 'loading'>> = (props) => (
  <Button variant="primary" loading={true} {...props}>
    Submit
  </Button>
);

export const DeleteButton: React.FC<Omit<ButtonProps, 'variant' | 'icon'>> = (props) => (
  <Button variant="secondary" icon={DeleteIcon} {...props}>
    Delete
  </Button>
);

export const EditButton: React.FC<Omit<ButtonProps, 'variant' | 'icon'>> = (props) => (
  <Button variant="primary" icon={EditIcon} {...props}>
    Edit
  </Button>
);

export default Button;