import { useState } from 'react';
import { Autocomplete } from './Autocomplete';
import { AutocompleteOption } from './Autocomplete.types';

export const AutocompleteExamples = () => {
  const [singleValue, setSingleValue] = useState<AutocompleteOption | null>(null);
  const [multipleValue, setMultipleValue] = useState<AutocompleteOption[]>([]);
  const [inputValue, setInputValue] = useState('');

  const options: AutocompleteOption[] = [
    { value: 'js', label: 'JavaScript', icon: '🟨' },
    { value: 'ts', label: 'TypeScript', icon: '🔷' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'vue', label: 'Vue.js', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'nodejs', label: 'Node.js', icon: '💚' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
  ];

  const groupedOptions: AutocompleteOption[] = [
    { value: 'js', label: 'JavaScript', group: 'Frontend' },
    { value: 'ts', label: 'TypeScript', group: 'Frontend' },
    { value: 'react', label: 'React', group: 'Frontend' },
    { value: 'nodejs', label: 'Node.js', group: 'Backend' },
    { value: 'python', label: 'Python', group: 'Backend' },
    { value: 'java', label: 'Java', group: 'Backend' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Autocomplete Examples</h2>

      {/* Single Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Selection</h3>
        <Autocomplete
          id="single-autocomplete"
          options={options}
          value={singleValue}
          onChange={(_, value) => setSingleValue(value as AutocompleteOption | null)}
          variant='floating'
         
          label="Choose a technology"
          placeholder="Search technologies..."
          helperText="Select one technology"
        />
      </div>

      {/* Multiple Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Multiple Selection with Checkboxes</h3>
        <Autocomplete
          id="multiple-autocomplete"
          options={options}
          value={multipleValue}
          onChange={(_, value) => setMultipleValue(value as AutocompleteOption[])}
          multiple
          showCheckbox
          label="Choose technologies"
          placeholder="Search multiple technologies..."
          helperText="Select multiple technologies with checkboxes"
          limitTags={2}
        />
      </div>

      {/* Single Selection with Checkbox */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Selection with Checkbox</h3>
        <Autocomplete
          id="single-checkbox-autocomplete"
          options={options}
          value={singleValue}
          onChange={(_, value) => setSingleValue(value as AutocompleteOption | null)}
          showCheckbox
          label="Choose a technology (with checkbox)"
          placeholder="Search technologies..."
          helperText="Single selection with checkbox display"
        />
      </div>

      {/* Grouped Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Grouped Options</h3>
        <Autocomplete
          id="grouped-autocomplete"
          options={groupedOptions}
          value={null}
          onChange={(_, value) => console.log(value)}
          groupBy={(option) => option.group || 'Other'}
          label="Choose by category"
          placeholder="Search by frontend/backend..."
        />
      </div>

      {/* With Error */}
      <div>
        <h3 className="text-lg font-semibold mb-4">With Error State</h3>
        <Autocomplete
          id="error-autocomplete"
          options={options}
          value={null}
          onChange={(_, value) => console.log(value)}
          label="Required field"
          placeholder="This field has an error..."
          errorMessage="This field is required"
          required
        />
      </div>

      {/* Different Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Different Variants</h3>
        <div className="space-y-4">
          <Autocomplete
            id="outlined-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            variant="outlined"
            label="Outlined Variant"
            placeholder="Search technologies..."
          />
          <Autocomplete
            id="filled-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            variant="filled"
            label="Filled Variant"
            placeholder="Search technologies..."
          />
          <Autocomplete
            id="floating-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            variant="floating"
            label="Floating Label Variant"
            placeholder="Search technologies..."
          />
        </div>
      </div>

      {/* Different Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
        <div className="space-y-4">
          <Autocomplete
            id="small-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            size="sm"
            placeholder="Small size"
          />
          <Autocomplete
            id="medium-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            size="md"
            placeholder="Medium size"
          />
          <Autocomplete
            id="large-autocomplete"
            options={options}
            value={null}
            onChange={(_, value) => console.log(value)}
            size="lg"
            placeholder="Large size"
          />
        </div>
      </div>

      {/* Loading & Disabled States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="space-y-4">
          <Autocomplete
            id="loading-autocomplete"
            options={[]}
            value={null}
            onChange={(_, value) => console.log(value)}
            loading
            placeholder="Loading..."
            helperText="Loading state example"
          />
          <Autocomplete
            id="disabled-autocomplete"
            options={options}
            value={options[0]}
            onChange={(_, value) => console.log(value)}
            disabled
            placeholder="Disabled..."
            helperText="Disabled state example"
          />
        </div>
      </div>

      {/* Current Values Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Values:</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Single:</strong> {singleValue ? singleValue.label : 'None'}</div>
          <div><strong>Multiple:</strong> {multipleValue?.map(v => v.label).join(', ') || 'None'}</div>
          <div><strong>Input Value:</strong> {inputValue || 'Empty'}</div>
        </div>
      </div>
    </div>
  );
};

// Export everything
export { Autocomplete } from './Autocomplete';
export type { AutocompleteProps, AutocompleteOption } from './Autocomplete.types';