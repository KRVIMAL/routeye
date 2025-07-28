import { useRef, useState } from 'react';
import { CustomSearch, SearchRef } from './CustomSearch';

// Example usage component
export const CustomSearchExamples = () => {
  const [basicSearch, setBasicSearch] = useState('');
  const [controlledSearch, setControlledSearch] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<SearchRef>(null);

  // Simulate API search
  const handleSearch = async (query: string) => {
    console.log('Searching for:', query);
    if (query.trim()) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        console.log('Search completed for:', query);
      }, 1000);
    }
  };

  const handleControlledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setControlledSearch(event.target.value);
  };

  const handleClear = () => {
    console.log('Search cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Custom Search Examples</h1>

      {/* Basic Search */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Basic Search</h2>
        <CustomSearch
          placeholder="Search for assets"
          onSearch={handleSearch}
          onClear={handleClear}
        />
        <p className="text-sm text-gray-600">
          Basic search with default styling and debounced search
        </p>
      </div>

      {/* Controlled Search */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Controlled Search</h2>
        <CustomSearch
          value={controlledSearch}
          onChange={handleControlledChange}
          placeholder="Controlled search input"
          onSearch={handleSearch}
        />
        <p className="text-sm text-gray-600">
          Current value: <span className="font-semibold">{controlledSearch}</span>
        </p>
      </div>

      {/* Search with Loading */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Search with Loading State</h2>
        <CustomSearch
          placeholder="Search with loading..."
          loading={loading}
          onSearch={handleSearch}
        />
      </div>

      {/* Different Sizes */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Different Sizes</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Small</h3>
          <CustomSearch
            size="xs"
            placeholder="Small search"
            onSearch={handleSearch}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Medium (Default)</h3>
          <CustomSearch
            size="md"
            placeholder="Medium search"
            onSearch={handleSearch}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Large</h3>
          <CustomSearch
            size="lg"
            placeholder="Large search"
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Compact Variant */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Compact Variant</h2>
        <CustomSearch
          variant="compact"
          placeholder="Compact search"
          onSearch={handleSearch}
        />
      </div>

      {/* Without Search Button */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Without Search Button</h2>
        <CustomSearch
          placeholder="Type to search..."
          showSearchButton={false}
          onSearch={handleSearch}
        />
      </div>

      {/* Custom Debounce */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Custom Debounce (1000ms)</h2>
        <CustomSearch
          placeholder="Slow debounce search"
          debounceMs={1000}
          onSearch={(query) => {
            setDebounceSearch(query);
            console.log('Debounced search:', query);
          }}
        />
        <p className="text-sm text-gray-600">
          Debounced value: <span className="font-semibold">{debounceSearch}</span>
        </p>
      </div>

      {/* Disabled State */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Disabled State</h2>
        <CustomSearch
          placeholder="Disabled search"
          disabled={true}
          value="Cannot edit this"
        />
      </div>

      {/* With Ref Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">With Ref Controls</h2>
        <CustomSearch
          ref={searchRef}
          placeholder="Search with ref controls"
          onSearch={handleSearch}
        />
        <div className="flex gap-2">
          <button
            onClick={() => searchRef.current?.focus()}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Focus
          </button>
          <button
            onClick={() => searchRef.current?.clear()}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={() => console.log('Current value:', searchRef.current?.getValue())}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Get Value
          </button>
        </div>
      </div>

      {/* Real-world Integration Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Employee Search Integration</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Employees</h3>
            <div className="flex gap-2">
              <CustomSearch
                placeholder="Search for Name and Status"
                onSearch={(query) => {
                  console.log('Employee search:', query);
                  // handleSearchParams logic here
                }}
                onClear={() => {
                  console.log('Employee search cleared');
                  // handleCancelIcon logic here
                }}
                className="w-80"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Employee
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            This shows how the search component integrates with your existing employee management system
          </div>
        </div>
      </div>
    </div>
  );
};

// Export components
export { CustomSearch } from './CustomSearch';
export type { CustomSearchProps, SearchRef } from './Search.types';