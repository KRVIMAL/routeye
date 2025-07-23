import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CustomInput from '../components/ui/CustomInput';
import { EmailInput } from '../components/ui/EmailInput';
import { NumberInput } from '../components/ui/NumberInput';
import { PhoneInput } from '../components/ui/PhoneInput';
import Select from '../components/ui/Select';

// Example form component using all inputs:
import React, { useState } from 'react';
// import { CustomInput, NumberInput, PhoneInput, EmailInput, Select, Button, Card } from '../components/ui';

const ExampleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    district: '',
    salary: ''
  });

  const districtOptions = [
    { value: 'hamirpur', label: 'Hamirpur' },
    { value: 'bilaspur', label: 'Bilaspur' },
    { value: 'chamba', label: 'Chamba' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-heading-2">User Registration</h2>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <CustomInput
              label="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              validation={{ minLength: 2 }}
            />
            
            <EmailInput
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            
            <PhoneInput
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              country="US"
              required
            />
            
            <CustomInput
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              validation={{ min: 18, max: 100 }}
              allowNegative={false}
              allowDecimal={false}
              required
            />
            
            <Select
              label="District"
              options={districtOptions}
              value={formData.district}
              onChange={(value) => setFormData(prev => ({ ...prev, district: value as string }))}
              placeholder="Select District..."
              required={true}
            />
            
            <NumberInput
              label="Expected Salary"
              currency
              thousandSeparator
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
              allowNegative={false}
            />
          </div>
          
          <div className="flex justify-end space-x-md">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default ExampleForm;