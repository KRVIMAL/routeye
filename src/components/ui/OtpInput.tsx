// src/components/ui/OtpInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface OtpInputProps {
    length?: number;
    value?: string;
    onChange?: (otp: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
    error?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    value = '',
    onChange,
    disabled = false,
    autoFocus = true,
    className = '',
    error = false,
}) => {
    const { theme } = useTheme();
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Update internal state when value prop changes
    useEffect(() => {
        if (value) {
            const otpArray = value.split('').slice(0, length);
            while (otpArray.length < length) {
                otpArray.push('');
            }
            setOtp(otpArray);
        }
    }, [value, length]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (disabled) return;

        const val = element.value;
        if (!/^\d*$/.test(val)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1); // Take only the last digit
        setOtp(newOtp);

        // Call onChange callback
        const otpString = newOtp.join('');
        onChange?.(otpString);

        // Move to next input if current field is filled
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // If current input is empty, move to previous input
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                onChange?.(newOtp.join(''));
            }
        }
        // Handle arrow keys
        else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        // Handle paste
        else if (e.key === 'Enter') {
            e.preventDefault();
            // You can add custom enter behavior here
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain');
        const digits = pasteData.replace(/\D/g, '').slice(0, length);

        if (digits) {
            const newOtp = new Array(length).fill('');
            for (let i = 0; i < digits.length && i < length; i++) {
                newOtp[i] = digits[i];
            }
            setOtp(newOtp);
            onChange?.(newOtp.join(''));

            // Focus on the next empty input or the last input
            const nextIndex = Math.min(digits.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const getInputClasses = () => {
        const baseClasses = [
            'w-12 h-12 text-center text-lg font-semibold',
            'border-2 rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'bg-background text-text-primary',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
        ];

        if (error) {
            baseClasses.push('border-red-500 focus:border-red-500');
        } else {
            baseClasses.push('border-[#4285F4] focus:border-[#4285F4]');
        }

        return baseClasses.join(' ');
    };

    return (
        <div className={`flex gap-3 justify-center ${className}`}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    autoFocus={autoFocus && index === 0}
                    className={getInputClasses()}
                    aria-label={`OTP digit ${index + 1}`}
                />
            ))}
        </div>
    );
};