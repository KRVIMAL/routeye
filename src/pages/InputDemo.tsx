// src/pages/InputDemo.tsx - Demo page for all input components
import React, { useState } from 'react';
// import CustomInput, { NumberInput, PhoneInput, EmailInput } from '../components/ui/CustomInput';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FiSearch, FiUser, FiMapPin } from 'react-icons/fi';
import CustomInput from '../components/ui/CustomInput';
import { PhoneInput } from '../components/ui/PhoneInput';
import { NumberInput } from '../components/ui/NumberInput';
import { EmailInput } from '../components/ui/EmailInput';

const InputDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    salary: '',
    bio: '',
    website: '',
    search: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const simulateAsyncValidation = async (field: string) => {
    setLoading(prev => ({ ...prev, [field]: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(prev => ({ ...prev, [field]: false }));
    
    // Simulate validation result
    if (field === 'email' && formData.email === 'admin@test.com') {
      setErrors(prev => ({ ...prev, email: 'This email is already taken' }));
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
    return null;
  };

  const validateConfirmPassword = (confirmPassword: string): string | null => {
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return null;
  };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-heading-1 text-text-primary mb-md">Custom Input Components Demo</h1>
        <p className="text-body text-text-secondary">
          Comprehensive input components with validation, formatting, and enhanced UX features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Basic Inputs */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Basic Inputs</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-lg">
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                validation={{ minLength: 2 }}
                helperText="Enter your first and last name"
                leftIcon={FiUser}
              />
              
              <CustomInput
                label="Search"
                placeholder="Search anything..."
                value={formData.search}
                onChange={handleInputChange('search')}
                type="search"
                leftIcon={FiSearch}
                helperText="Try searching for something"
              />
              
              <CustomInput
                label="Website URL"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleInputChange('website')}
                type="url"
                validation={{
                  pattern: /^https?:\/\/.+/,
                }}
                helperText="Enter a valid URL starting with http:// or https://"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Specialized Inputs */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Specialized Inputs</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-lg">
              <EmailInput
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange('email')}
                onBlur={() => simulateAsyncValidation('email')}
                loading={loading.email}
                error={errors.email}
                required
                helperText="We'll never share your email"
              />
              
              <PhoneInput
                label="Phone Number"
                country="US"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                required
                helperText="US phone number format"
              />
              
              <CustomInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                validation={{ custom: validatePassword }}
                required
                helperText="Must contain uppercase, lowercase, number, and be 8+ characters"
                showPasswordToggle
              />
              
              <CustomInput
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                validation={{ custom: validateConfirmPassword }}
                required
                showPasswordToggle
              />
            </div>
          </Card.Body>
        </Card>

        {/* Number Inputs */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Number Inputs</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-lg">
              <CustomInput
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange('age')}
                validation={{ min: 1, max: 120 }}
                allowNegative={false}
                allowDecimal={false}
                required
                helperText="Enter your age (1-120)"
              />
              
              <NumberInput
                label="Annual Salary"
                currency
                value={formData.salary}
                onChange={handleInputChange('salary')}
                thousandSeparator
                validation={{ min: 0 }}
                allowNegative={false}
                helperText="Enter your annual salary"
              />
              
              <CustomInput
                label="Height (cm)"
                type="number"
                value=""
                onChange={() => {}}
                step={0.1}
                decimalPlaces={1}
                validation={{ min: 50, max: 250 }}
                helperText="Enter height in centimeters"
              />
              
              <CustomInput
                label="Phone (Max 10 digits)"
                type="tel"
                value=""
                onChange={() => {}}
                propsToInputElement={{ maxLength: 10 }}
                validation={{ 
                  pattern: /^\d{10}$/,
                  maxLength: 10 
                }}
                helperText="Enter exactly 10 digits"
                placeholder="1234567890"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Input Variants & States */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Variants & States</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-lg">
              <div className="space-y-md">
                <h4 className="text-body font-semibold text-text-primary">Sizes</h4>
                <CustomInput
                  size="sm"
                  placeholder="Small input"
                  value=""
                  onChange={() => {}}
                />
                <CustomInput
                  size="md"
                  placeholder="Medium input (default)"
                  value=""
                  onChange={() => {}}
                />
                <CustomInput
                  size="lg"
                  placeholder="Large input"
                  value=""
                  onChange={() => {}}
                />
              </div>
              
              <div className="space-y-md">
                <h4 className="text-body font-semibold text-text-primary">Variants</h4>
                <CustomInput
                  variant="outlined"
                  placeholder="Outlined (default)"
                  value=""
                  onChange={() => {}}
                />
                <CustomInput
                  variant="filled"
                  placeholder="Filled variant"
                  value=""
                  onChange={() => {}}
                />
                <CustomInput
                  variant="underlined"
                  placeholder="Underlined variant"
                  value=""
                  onChange={() => {}}
                />
              </div>
              
              <div className="space-y-md">
                <h4 className="text-body font-semibold text-text-primary">States</h4>
                <CustomInput
                  placeholder="Success state"
                  value="Valid input"
                  onChange={() => {}}
                  success
                />
                <CustomInput
                  placeholder="Error state"
                  value="Invalid input"
                  onChange={() => {}}
                  error="This field has an error"
                />
                <CustomInput
                  placeholder="Loading state"
                  value=""
                  onChange={() => {}}
                  loading
                />
                <CustomInput
                  placeholder="Disabled state"
                  value="Cannot edit this"
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Advanced Features */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Advanced Features</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-lg">
              <CustomInput
                label="Location"
                placeholder="Enter location"
                value=""
                onChange={() => {}}
                leftIcon={FiMapPin}
                rightIcon={FiSearch}
                onRightIconClick={() => alert('Search clicked!')}
                helperText="Click the search icon to find location"
              />
              
              <CustomInput
                label="Custom Validation"
                placeholder="Type 'hello'"
                value=""
                onChange={() => {}}
                validation={{
                  custom: (value) => value !== 'hello' ? 'You must type "hello"' : null
                }}
                helperText="Custom validation: must type 'hello'"
              />
              
              <CustomInput
                label="Date Input"
                type="date"
                value=""
                onChange={() => {}}
                required
              />
              
              <CustomInput
                label="Time Input"
                type="time"
                value=""
                onChange={() => {}}
                required
              />
              
              <CustomInput
                label="Auto-format Number"
                type="number"
                value=""
                onChange={() => {}}
                formatValue={(value) => {
                  // Add commas for thousands
                  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }}
                helperText="Automatically formats with commas"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Form Example */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Complete Form Example</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-md">
                <CustomInput
                  label="First Name"
                  placeholder="John"
                  value=""
                  onChange={() => {}}
                  required
                  validation={{ minLength: 2 }}
                />
                <EmailInput
                  label="Email"
                  value=""
                  onChange={() => {}}
                  required
                />
                <CustomInput
                  label="Company"
                  placeholder="Acme Corp"
                  value=""
                  onChange={() => {}}
                />
              </div>
              
              <div className="space-y-md">
                <CustomInput
                  label="Last Name"
                  placeholder="Doe"
                  value=""
                  onChange={() => {}}
                  required
                  validation={{ minLength: 2 }}
                />
                <PhoneInput
                  label="Phone"
                  value=""
                  onChange={() => {}}
                  required
                />
                <CustomInput
                  label="Job Title"
                  placeholder="Software Engineer"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </div>
            
            <div className="mt-lg">
              <CustomInput
                label="Bio"
                placeholder="Tell us about yourself..."
                value=""
                onChange={() => {}}
                validation={{ maxLength: 500 }}
                helperText="Maximum 500 characters"
              />
            </div>
            
            <div className="flex justify-end space-x-md mt-lg">
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Submit</Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Current Form Data */}
      <Card>
        <Card.Header>
          <h3 className="text-heading-3 text-text-primary">Current Form Data</h3>
        </Card.Header>
        <Card.Body>
          <pre className="bg-theme-tertiary p-md rounded-md text-body-small text-text-secondary overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InputDemo;