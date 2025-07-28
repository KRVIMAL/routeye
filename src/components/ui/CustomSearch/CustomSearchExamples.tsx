// CustomSearchExamples.tsx
import React, { useState, useRef } from 'react';
import { CustomSearch, SearchRef } from './CustomSearch';

export const CustomSearchExamples = () => {
  const [basicSearch, setBasicSearch] = useState('');
  const [controlledSearch, setControlledSearch] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-12">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Custom Search Component Examples
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Fully responsive search component with complete dimensional control and various configuration options
          </p>
        </div>

        {/* Basic Examples */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Basic Usage
          </h2>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Default Search</h3>
              <CustomSearch
                placeholder="Search for assets"
                onSearch={handleSearch}
                onClear={handleClear}
              />
              <p className="text-sm text-gray-600 mt-2">
                Basic search with default styling and 300ms debounce
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Controlled Search</h3>
              <CustomSearch
                value={controlledSearch}
                onChange={handleControlledChange}
                placeholder="Controlled search input"
                onSearch={handleSearch}
              />
              <p className="text-sm text-gray-600 mt-2">
                Current value: <span className="font-semibold">{controlledSearch}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Responsive Examples */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Responsive Design
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Full Width Responsive</h3>
              <CustomSearch
                fullWidth={true}
                placeholder="Full width - adapts to container"
                onSearch={handleSearch}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Scales to 100% of parent container width with responsive height and icons
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Responsive with Constraints</h3>
              <CustomSearch
                minWidth="250px"
                maxWidth="600px"
                placeholder="Constrained responsive"
                onSearch={handleSearch}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Minimum 250px, maximum 600px width with responsive behavior
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Mobile-First Design</h3>
              <div className="grid gap-4">
                <CustomSearch
                  width="100%"
                  minWidth="200px"
                  maxWidth="400px"
                  size="sm"
                  placeholder="Mobile optimized"
                  onSearch={handleSearch}
                  className="sm:hidden"
                />
                <CustomSearch
                  width="100%"
                  minWidth="300px"
                  maxWidth="500px"
                  size="md"
                  placeholder="Tablet optimized"
                  onSearch={handleSearch}
                  className="hidden sm:block lg:hidden"
                />
                <CustomSearch
                  width="100%"
                  minWidth="400px"
                  maxWidth="600px"
                  size="lg"
                  placeholder="Desktop optimized"
                  onSearch={handleSearch}
                  className="hidden lg:block"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Different sizes shown on different screen sizes (resize window to see)
              </p>
            </div>
          </div>
        </section>

        {/* Custom Dimensions */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Custom Dimensions
          </h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Fixed Dimensions</h3>
              <div className="space-y-4">
                <CustomSearch
                  width="400px"
                  height="50px"
                  placeholder="400px × 50px"
                  onSearch={handleSearch}
                  responsive={false}
                />
                <CustomSearch
                  width={586}
                  height={57}
                  placeholder="Original Figma size (586px × 57px)"
                  onSearch={handleSearch}
                  responsive={false}
                />
                <CustomSearch
                  width="300px"
                  height="40px"
                  placeholder="Compact 300px × 40px"
                  onSearch={handleSearch}
                  responsive={false}
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Flexible Dimensions</h3>
              <div className="space-y-4">
                <CustomSearch
                  minWidth="200px"
                  maxWidth="100%"
                  height="60px"
                  placeholder="Flexible width, fixed height"
                  onSearch={handleSearch}
                />
                <CustomSearch
                  width="100%"
                  minHeight="45px"
                  maxHeight="70px"
                  placeholder="Fixed width, flexible height"
                  onSearch={handleSearch}
                />
                <CustomSearch
                  minWidth="250px"
                  maxWidth="450px"
                  minHeight="40px"
                  maxHeight="60px"
                  placeholder="Fully flexible"
                  onSearch={handleSearch}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Size Variants
          </h2>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Small Size</h3>
              <CustomSearch
                size="sm"
                placeholder="Small search component"
                onSearch={handleSearch}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">Height: 40px (mobile) → 48px (desktop)</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Medium Size (Default)</h3>
              <CustomSearch
                size="md"
                placeholder="Medium search component"
                onSearch={handleSearch}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">Height: 48px (mobile) → 56px (desktop)</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Large Size</h3>
              <CustomSearch
                size="lg"
                placeholder="Large search component"
                onSearch={handleSearch}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">Height: 56px (mobile) → 64px (desktop)</p>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Advanced Features
          </h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Loading State</h3>
              <CustomSearch
                placeholder="Search with loading..."
                loading={loading}
                onSearch={handleSearch}
                width="100%"
                maxWidth="400px"
              />
              <button
                onClick={() => setLoading(!loading)}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Toggle Loading
              </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Custom Debounce</h3>
              <CustomSearch
                placeholder="1000ms debounce"
                debounceMs={1000}
                width="100%"
                maxWidth="400px"
                onSearch={(query) => {
                  setDebounceSearch(query);
                  console.log('Debounced search:', query);
                }}
              />
              <p className="text-sm text-gray-600 mt-2">
                Debounced value: <span className="font-semibold">{debounceSearch}</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Without Search Button</h3>
              <CustomSearch
                placeholder="Type to search (no button)"
                showSearchButton={false}
                onSearch={handleSearch}
                width="100%"
                maxWidth="400px"
              />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Disabled State</h3>
              <CustomSearch
                placeholder="Disabled search"
                disabled={true}
                value="Cannot edit this"
                width="100%"
                maxWidth="400px"
              />
            </div>
          </div>
        </section>

        {/* Ref Controls */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Ref Controls
          </h2>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">External Control</h3>
            <CustomSearch
              ref={searchRef}
              placeholder="Search with ref controls"
              onSearch={handleSearch}
              width="100%"
              maxWidth="500px"
              className="mb-4"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => searchRef.current?.focus()}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Focus
              </button>
              <button
                onClick={() => searchRef.current?.clear()}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => console.log('Current value:', searchRef.current?.getValue())}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Get Value
              </button>
              <button
                onClick={() => searchRef.current?.blur()}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                Blur
              </button>
            </div>
          </div>
        </section>

        {/* Grid Integration */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Layout Integration
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">CSS Grid Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CustomSearch
                  placeholder="Grid item 1"
                  onSearch={handleSearch}
                  className="col-span-1"
                />
                <CustomSearch
                  placeholder="Grid item 2"
                  onSearch={handleSearch}
                  className="col-span-1 md:col-span-2 lg:col-span-1"
                />
                <CustomSearch
                  placeholder="Grid item 3"
                  onSearch={handleSearch}
                  className="col-span-1 lg:col-span-1"
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Flexbox Integration</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <CustomSearch
                  placeholder="Flex item"
                  onSearch={handleSearch}
                  className="flex-1"
                  minWidth="200px"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap">
                  Search Button
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Real-world Integration
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Employee Management</h3>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                  <h4 className="text-xl font-semibold">Employees</h4>
                  <p className="text-gray-600 text-sm">Manage your team members</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <CustomSearch
                    placeholder="Search for Name and Status"
                    onSearch={(query) => {
                      console.log('Employee search:', query);
                    }}
                    onClear={() => {
                      console.log('Employee search cleared');
                    }}
                    className="flex-1 lg:w-80"
                    minWidth="250px"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                    Add Employee
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                This demonstrates integration with your existing employee management system with responsive design.
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Asset Search Dashboard</h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <CustomSearch
                    placeholder="Search for assets"
                    onSearch={handleSearch}
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    className="flex-1"
                    minWidth="300px"
                    size="lg"
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                      Export
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded">
                    <h5 className="font-semibold">Total Assets</h5>
                    <p className="text-2xl font-bold text-blue-600">1,234</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <h5 className="font-semibold">Active</h5>
                    <p className="text-2xl font-bold text-green-600">1,100</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded">
                    <h5 className="font-semibold">Maintenance</h5>
                    <p className="text-2xl font-bold text-yellow-600">89</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded">
                    <h5 className="font-semibold">Inactive</h5>
                    <p className="text-2xl font-bold text-red-600">45</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Search value: <span className="font-semibold">{mobileSearch}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Testing */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 border-b pb-2">
            Responsive Testing
          </h2>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resize Your Browser</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded lg:hidden">
                <p className="text-sm font-medium text-red-800">Mobile/Tablet View</p>
                <CustomSearch
                  placeholder="Mobile optimized search"
                  size="sm"
                  fullWidth={true}
                  onSearch={handleSearch}
                />
              </div>
              <div className="p-4 bg-green-50 rounded hidden lg:block">
                <p className="text-sm font-medium text-green-800">Desktop View</p>
                <CustomSearch
                  placeholder="Desktop optimized search"
                  size="lg"
                  width="600px"
                  onSearch={handleSearch}
                />
              </div>
              <p className="text-sm text-gray-600">
                Resize your browser window to see responsive behavior in action. 
                The component adapts its size, padding, and icon dimensions automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>Custom Search Component - Fully Responsive with Complete Dimensional Control</p>
        </footer>
      </div>
    </div>
  );
};

export default CustomSearchExamples;