import { useState } from 'react';
import { Select } from './Select';
import { SelectOption } from '../Select';
import SelectValidationExample from './SelectValidationExample';

export { Select } from './Select';
// export type { SelectProps, SelectOption, SelectRef } from './Select.types';

// Usage Examples Component
export const SelectExamples: React.FC = () => {
  const [singleValue, setSingleValue] = useState<string>('');
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const vehicleOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-md bg-background">
      {/* Single Select - Closed State */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Single Select (Closed)</h3>
        <Select
          label="Select vehicle number"
          required
          asteriskPosition="right"
          options={vehicleOptions}
          value={singleValue}
          onChange={(value) => setSingleValue(value as string)}
          placeholder="Select vehicle number"
          size="lg"
          fullWidth
          variant="normal"
        />
      </div>

      {/* Single Select with Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Single Select (With Selection)</h3>
        <Select
          label="Select vehicle number"
          required
          asteriskPosition="right"
          options={vehicleOptions}
          value="option1"
          onChange={(value) => console.log(value)}
          placeholder="Select vehicle number"
          size="lg"
          fullWidth
          variant="floating"
        />
      </div>

      {/* Multi Select */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Multi Select</h3>
        <Select
          label="Select vehicle numbers"
          required
          asteriskPosition="right"
          options={vehicleOptions}
          value={multiValue}
          onChange={(value) => setMultiValue(value as string[])}
          placeholder="Select vehicle numbers"
          multiSelect
          size="lg"
          fullWidth
        />
      </div>

      {/* Multi Select with Selections */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Multi Select (With Selections)</h3>
        <Select
          label="Select vehicle numbers"
          required
          asteriskPosition="right"
          options={vehicleOptions}
          value={['option1', 'option2']}
          onChange={(value) => console.log(value)}
          placeholder="Select vehicle numbers"
          multiSelect
          size="lg"
          fullWidth
          searchable
          clearable
        />
      </div>
      <SelectValidationExample/>
    </div>
  );
};