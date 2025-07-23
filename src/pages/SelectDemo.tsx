// src/pages/SelectDemo.tsx - Demo page showing all select features
import React, { useState } from 'react';
import Select, { SelectOption } from '../components/ui/Select';
import { AsyncSelect } from '../components/ui/AsyncSelect';
import Card from '../components/ui/Card';

const SelectDemo: React.FC = () => {
  const [singleValue, setSingleValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[] | null>(null);
  const [asyncValue, setAsyncValue] = useState<string | null>(null);

  // District options from your image
  const districtOptions: SelectOption[] = [
    { value: 'all', label: 'All' },
    { value: 'bilaspur', label: 'Bilaspur' },
    { value: 'chamba', label: 'Chamba' },
    { value: 'hamirpur', label: 'Hamirpur' },
    { value: 'kangra', label: 'Kangra' },
    { value: 'kinnaur', label: 'Kinnaur' },
    { value: 'kullu', label: 'Kullu' },
    { value: 'lahul-spiti', label: 'Lahul And Spiti' },
    { value: 'mandi', label: 'Mandi' },
    { value: 'shimla', label: 'Shimla' },
    { value: 'sirmaur', label: 'Sirmaur' },
    { value: 'solan', label: 'Solan' },
    { value: 'una', label: 'Una' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled', disabled: true },
  ];

  // Mock async function
  const loadAsyncOptions = async (searchTerm: string): Promise<SelectOption[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allOptions = [
      { value: 'user1', label: 'John Doe' },
      { value: 'user2', label: 'Jane Smith' },
      { value: 'user3', label: 'Bob Johnson' },
      { value: 'user4', label: 'Alice Brown' },
      { value: 'user5', label: 'Charlie Wilson' },
    ];

    return allOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-heading-1 text-text-primary mb-md">Select Components Demo</h1>
        <p className="text-body text-text-secondary">
          Comprehensive select components with search, clear, multiple selection, and async loading.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Basic Single Select */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Basic Single Select</h3>
          </Card.Header>
          <Card.Body>
            <Select
              label="District"
              placeholder="Select District..."
              options={districtOptions}
              value={singleValue}
              onChange={(value) => setSingleValue(value as string)}
              helper="Choose a district from the list"
            />
            <div className="mt-md p-md bg-theme-tertiary rounded-md">
              <p className="text-body-small text-text-secondary">
                Selected: <strong>{singleValue || 'None'}</strong>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Multiple Select */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Multiple Select</h3>
          </Card.Header>
          <Card.Body>
            <Select
              label="Project Status"
              placeholder="Select statuses..."
              options={statusOptions}
              value={multiValue}
              onChange={(value) => setMultiValue(value as string[])}
              multiple
              helper="You can select multiple statuses"
            />
            <div className="mt-md p-md bg-theme-tertiary rounded-md">
              <p className="text-body-small text-text-secondary">
                Selected: <strong>{multiValue?.join(', ') || 'None'}</strong>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Async Select */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Async Select</h3>
          </Card.Header>
          <Card.Body>
            <AsyncSelect
              label="Assign User"
              placeholder="Search users..."
              loadOptions={loadAsyncOptions}
              value={asyncValue}
              onChange={(value:any) => setAsyncValue(value as string)}
              helper="Search for users dynamically"
              loadingMessage="Searching users..."
              noOptionsMessage="No users found"
            />
            <div className="mt-md p-md bg-theme-tertiary rounded-md">
              <p className="text-body-small text-text-secondary">
                Selected: <strong>{asyncValue || 'None'}</strong>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Advanced Options */}
        <Card>
          <Card.Header>
            <h3 className="text-heading-3 text-text-primary">Advanced Features</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-md">
              <Select
                label="Non-searchable"
                options={districtOptions.slice(0, 5)}
                value={null}
                onChange={() => {}}
                searchable={false}
                placeholder="No search available"
              />
              
              <Select
                label="Non-clearable"
                options={districtOptions.slice(0, 5)}
                value="hamirpur"
                onChange={() => {}}
                clearable={false}
                placeholder="Cannot clear selection"
              />
              
              <Select
                label="Disabled"
                options={districtOptions.slice(0, 5)}
                value="chamba"
                onChange={() => {}}
                disabled
                placeholder="Disabled select"
              />
              
              <Select
                label="With Error"
                options={districtOptions.slice(0, 5)}
                value={null}
                onChange={() => {}}
                error="This field is required"
                placeholder="Select with error"
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SelectDemo;