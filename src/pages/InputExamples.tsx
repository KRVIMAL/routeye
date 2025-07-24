// src/examples/InputExamples.tsx - Complete Usage Examples
import React, { useState } from 'react';
import {
    Input,
    PasswordInput,
    SearchInput,
    EmailInput,
    NumberInput,
    PhoneInput,
    FormInput,
    RouteYeInput,
    RouteYeFormInput
} from '../components/ui/Input';
import { FiUser, FiMail, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';

// Example component showing all input variants and validation
export const InputExamples: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        salary: '',
        website: '',
        bio: ''
    });

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">

            {/* 1. RouteYe Design System Inputs */}
            <section>
                <h3 className="text-lg font-semibold mb-4">RouteYe Design System Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Exact match for your existing CustomInput usage */}
                    <RouteYeFormInput
                        label="Enter full name"
                        required
                        asteriskPosition="right"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                        validation={{
                            required: true,
                            minLength: 2,
                            pattern: /^[A-Za-z\s]+$/,
                            custom: (value) => {
                                if (value.includes('admin')) return 'Cannot contain "admin"';
                                return null;
                            }
                        }}
                        helperText="Only letters and spaces allowed"
                    />

                    <RouteYeFormInput
                        label="Email address"
                        required
                        type="email"
                        placeholder="Enter your email"
                        // leftIcon={FiMail}
                        value={formData.email}
                        onValueChange={(value) => setFormData({ ...formData, email: value })}
                        validation={{
                            required: true,
                            email: true,
                            minLength: 5
                        }}
                    />

                </div>
            </section>

            {/* 2. Validation Examples */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Validation Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Required validation */}
                    <FormInput
                        label="Required Field"
                        required
                        placeholder="This field is required"
                        validation={{ required: true }}
                        helperText="This field is required"
                    />

                    {/* Email validation */}
                    <EmailInput
                        label="Email Address"
                        required
                        placeholder="Enter valid email"
                        // leftIcon={FiMail}
                        validation={{
                            required: true,
                            email: true
                        }}
                    />

                    {/* Phone validation */}
                    <PhoneInput
                        label="Phone Number"
                        required
                        placeholder="Enter phone number"
                        // leftIcon={FiPhone}
                        phoneFormat="US"
                        validation={{
                            required: true,
                            phone: true
                        }}
                    // helperText="US format: (123) 456-7890"
                    />

                    {/* Length validation */}
                    <Input
                        label="Username"
                        required
                        placeholder="Enter username"
                        // leftIcon={FiUser}
                        validation={{
                            required: true,
                            minLength: 3,
                            maxLength: 20,
                            pattern: /^[A-Za-z0-9_]+$/
                        }}
                        helperText="3-20 characters, letters, numbers, underscore only"
                    />

                    {/* Number validation */}
                    <NumberInput
                        label="Age"
                        required
                        placeholder="Enter your age"
                        validation={{
                            required: true,
                            min: 18,
                            max: 100
                        }}
                        allowNegative={false}
                        allowDecimal={false}
                        helperText="Must be between 18 and 100"
                    />

                    {/* Custom validation */}
                    <Input
                        label="Password"
                        type="password"
                        required
                        placeholder="Create strong password"
                        validation={{
                            required: true,
                            minLength: 8,
                            custom: (value) => {
                                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                                    return 'Must contain uppercase, lowercase, and number';
                                }
                                return null;
                            }
                        }}
                        helperText="Min 8 chars with uppercase, lowercase, and number"
                    />

                </div>
            </section>

            {/* 3. Specialized Input Types */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Specialized Input Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Password with toggle */}
                    <PasswordInput
                        label="Password"
                        required
                        placeholder="Enter password"
                        showPasswordToggle={true}
                        validation={{
                            required: true,
                            minLength: 8
                        }}
                    />

                    {/* Search input */}
                    <SearchInput
                        placeholder="Search anything..."
                        size="lg"
                    />

                    {/* Number with formatting */}
                    <NumberInput
                        label="Salary"
                        placeholder="Enter salary"
                        // leftIcon={FiDollarSign}
                        allowNegative={false}
                        allowDecimal={true}
                        decimalPlaces={2}
                        validation={{
                            min: 0,
                            max: 1000000
                        }}
                        formatValue={(value) => {
                            // Custom formatting for currency
                            const num = parseFloat(value);
                            return isNaN(num) ? value : num.toLocaleString();
                        }}
                        helperText="Enter amount in USD"
                    />

                    {/* Phone with international format */}
                    <PhoneInput
                        label="International Phone"
                        placeholder="Enter international number"
                        phoneFormat="international"
                        validation={{ phone: true }}
                        helperText="Include country code"
                    />

                </div>
            </section>

            {/* 4. Input States */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Input States</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Input
                        label="Loading State"
                        placeholder="Processing..."
                        loading={true}
                    // leftIcon={FiUser}
                    />

                    <Input
                        label="Success State"
                        placeholder="Valid input"
                        success={true}
                        // leftIcon={FiMail}
                        value="john@example.com"
                        readOnly
                    />

                    <Input
                        label="Error State"
                        placeholder="Invalid input"
                        error="This field is required"
                    // leftIcon={FiPhone}
                    />

                    <Input
                        label="Disabled State"
                        placeholder="Disabled input"
                        disabled={true}
                        // leftIcon={FiMapPin}
                        value="Cannot edit this"
                    />

                </div>
            </section>

            {/* 5. Different Sizes */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Input Sizes</h3>
                <div className="space-y-4">
                    <Input size="xs" placeholder="Extra Small (xs)" />
                    <Input size="sm" placeholder="Small (sm)" />
                    <Input size="md" placeholder="Medium (md)" />
                    <Input size="lg" placeholder="Large (lg)" />
                    <Input size="xl" placeholder="Extra Large (xl)" />
                </div>
            </section>

            {/* 6. Different Variants */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Input Variants</h3>
                <div className="space-y-4">

                    <Input
                        label="Default Variant"
                        variant="default"
                        placeholder="Default input"
                    />

                    <Input
                        label="Outlined Variant"
                        variant="outlined"
                        placeholder="Outlined input"
                    />

                    <Input
                        label="Filled Variant"
                        variant="filled"
                        placeholder="Filled input"
                    />

                    <Input
                        label="Underlined Variant"
                        variant="underlined"
                        placeholder="Underlined input"
                    />

                </div>
            </section>

        </div>
    );
};

// ================================================================
// REAL-WORLD FORM EXAMPLE (Same as your existing vehicle form)
// ================================================================

// Form state type (same as your existing structure)
interface VehicleFormState {
    brandName: {
        value: string;
        error: string;
    };
    modelName: {
        value: string;
        error: string;
    };
    vehicleType: {
        value: string;
        error: string;
    };
    icon: {
        value: string;
        error: string;
    };
    email: {
        value: string;
        error: string;
    };
    phone: {
        value: string;
        error: string;
    };
}

// Initial form state
const initialFormState = (): VehicleFormState => ({
    brandName: { value: '', error: '' },
    modelName: { value: '', error: '' },
    vehicleType: { value: '', error: '' },
    icon: { value: '', error: '' },
    email: { value: '', error: '' },
    phone: { value: '', error: '' },
});

export const VehicleFormExample: React.FC = () => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<VehicleFormState>(initialFormState());

    // Handle input change (same as your existing pattern)
    const handleInputChange = (field: keyof VehicleFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [field]: {
                value: e.target.value,
                error: '', // Clear error when user types
            },
        }));
    };

    // Handle blur validation (same as your existing pattern)
    const handleBlur = (field: keyof VehicleFormState) => () => {
        const value = formData[field].value;
        let error = '';

        switch (field) {
            case 'brandName':
                if (!value.trim()) error = 'Brand Name is required';
                else if (value.length < 2) error = 'Brand Name must be at least 2 characters';
                break;
            case 'modelName':
                if (!value.trim()) error = 'Model Name is required';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'phone':
                if (!value.trim()) error = 'Phone is required';
                break;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: { ...prev[field], error },
        }));
    };

    const handleSave = () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert('Form saved successfully!');
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-surface rounded-lg border border-border-default p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Vehicle Information Form
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Brand Name - Using FormInput exactly like your existing CustomInput */}
                    <FormInput
                        label="Brand Name"
                        value={formData.brandName.value}
                        onChange={handleInputChange('brandName')}
                        onBlur={handleBlur('brandName')}
                        required
                        placeholder="Enter brand name (e.g., Toyota, Honda)"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.brandName.error}
                        // leftIcon={FiUser}
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                    {/* Model Name */}
                    <FormInput
                        label="Model Name"
                        value={formData.modelName.value}
                        onChange={handleInputChange('modelName')}
                        onBlur={handleBlur('modelName')}
                        required
                        placeholder="Enter model name (e.g., Camry, Civic)"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.modelName.error}
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                    {/* Email with automatic validation */}
                    <FormInput
                        label="Contact Email"
                        type="email"
                        value={formData.email.value}
                        onChange={handleInputChange('email')}
                        required
                        placeholder="Enter contact email"
                        disabled={saving}
                        // leftIcon={FiMail}
                        validation={{
                            required: true,
                            email: true
                        }}
                        autoValidate={true}
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                    {/* Phone with formatting */}
                    <FormInput
                        label="Contact Phone"
                        type="tel"
                        value={formData.phone.value}
                        onChange={handleInputChange('phone')}
                        required
                        placeholder="Enter phone number"
                        disabled={saving}
                        // leftIcon={FiPhone}
                        phoneFormat="US"
                        validation={{
                            required: true,
                            phone: true
                        }}
                        autoValidate={true}
                        helperText="US format: (123) 456-7890"
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                    {/* Icon URL with custom validation */}
                    <FormInput
                        label="Icon URL"
                        value={formData.icon.value}
                        onChange={handleInputChange('icon')}
                        onBlur={handleBlur('icon')}
                        required
                        placeholder="Enter icon URL"
                        disabled={saving}
                        autoValidate={false}
                        error={formData.icon.error}
                        helperText="Enter the URL for the vehicle icon"
                        validation={{
                            required: true,
                            pattern: /^https?:\/\/.+/,
                            custom: (value) => {
                                if (value && !value.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                                    return 'Must be a valid image URL (.jpg, .png, .gif, .svg)';
                                }
                                return null;
                            }
                        }}
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                    {/* Password example */}
                    <PasswordInput
                        label="Admin Password"
                        placeholder="Enter admin password"
                        required
                        disabled={saving}
                        validation={{
                            required: true,
                            minLength: 8,
                            custom: (value) => {
                                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                                    return 'Must contain uppercase, lowercase, and number';
                                }
                                return null;
                            }
                        }}
                        helperText="Min 8 chars with uppercase, lowercase, and number"
                        size="lg"
                        variant="default"
                        className="border-2 border-[#4285F4] focus:border-[#4285F4] focus:outline-none"
                    />

                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        type="button"
                        className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                        {saving ? 'Saving...' : 'Save Vehicle'}
                    </button>
                </div>

            </div>
        </div>
    );
};

// ================================================================
// QUICK START TEMPLATES
// ================================================================

// Login Form Template
export const LoginFormTemplate: React.FC = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    return (
        <div className="max-w-md mx-auto p-6 bg-surface rounded-lg border border-border-default">
            <h2 className="text-2xl font-bold text-center mb-6">Login to RouteYe</h2>

            <div className="space-y-4">
                <RouteYeFormInput
                    label="Email Address"
                    type="email"
                    required
                    placeholder="Enter your email"
                    // leftIcon={FiMail}
                    value={credentials.email}
                    onValueChange={(value) => setCredentials({ ...credentials, email: value })}
                    validation={{
                        required: true,
                        email: true
                    }}
                />

                <RouteYeFormInput
                    label="Password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={credentials.password}
                    onValueChange={(value) => setCredentials({ ...credentials, password: value })}
                    validation={{
                        required: true,
                        minLength: 6
                    }}
                />

                <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors">
                    Sign In
                </button>
            </div>
        </div>
    );
};

// Registration Form Template
export const RegistrationFormTemplate: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    return (
        <div className="max-w-2xl mx-auto p-6 bg-surface rounded-lg border border-border-default">
            <h2 className="text-2xl font-bold text-center mb-6">Create RouteYe Account</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                    <RouteYeFormInput
                        label="Full Name"
                        required
                        placeholder="Enter your full name"
                        // leftIcon={FiUser}
                        value={formData.fullName}
                        onValueChange={(value) => setFormData({ ...formData, fullName: value })}
                        validation={{
                            required: true,
                            minLength: 2,
                            pattern: /^[A-Za-z\s]+$/
                        }}
                    />
                </div>

                <RouteYeFormInput
                    label="Email Address"
                    type="email"
                    required
                    placeholder="Enter your email"
                    // leftIcon={FiMail}
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    validation={{
                        required: true,
                        email: true
                    }}
                />

                <RouteYeFormInput
                    label="Phone Number"
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    // leftIcon={FiPhone}
                    phoneFormat="US"
                    value={formData.phone}
                    onValueChange={(value) => setFormData({ ...formData, phone: value })}
                    validation={{
                        required: true,
                        phone: true
                    }}
                />

                <RouteYeFormInput
                    label="Password"
                    type="password"
                    required
                    placeholder="Create password"
                    value={formData.password}
                    onValueChange={(value) => setFormData({ ...formData, password: value })}
                    validation={{
                        required: true,
                        minLength: 8,
                        custom: (value) => {
                            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                                return 'Must contain uppercase, lowercase, and number';
                            }
                            return null;
                        }
                    }}
                />

                <RouteYeFormInput
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onValueChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                    validation={{
                        required: true,
                        custom: (value) => {
                            if (value !== formData.password) {
                                return 'Passwords do not match';
                            }
                            return null;
                        }
                    }}
                />

                <div className="md:col-span-2">
                    <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors">
                        Create Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InputExamples;