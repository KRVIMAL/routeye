// src/components/ui/ImportModal/ImportModalExamples.tsx
import React, { useState } from 'react';
import { FiUpload, FiUsers, FiTruck, FiSmartphone } from 'react-icons/fi';
import ImportModal from './ImportModal';
import Button from '../Button';
import toast from 'react-hot-toast';

const ImportModalExamples: React.FC = () => {
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Simulate API call for importing
  const simulateImport = async (file: File, type: string): Promise<void> => {
    console.log(`Importing ${type}:`, file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.2) {
      toast.success(`${type} imported successfully!`);
    } else {
      throw new Error(`Failed to import ${type}. Please check your file format.`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Import Modal Examples</h1>

      {/* Example 1: Device Import */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Device Import Modal</h2>
        <p className="text-gray-600 mb-4">Import devices with specific CSV format requirements.</p>
        
        <Button
          variant="custom"
          customColors={{
            background: '#1F3A8A',
            text: '#FFFFFF',
            hover: { background: '#1D40B0' }
          }}
          icon={FiSmartphone}
          onClick={() => setDeviceModalOpen(true)}
        >
          Import Devices
        </Button>

        <ImportModal
          isOpen={deviceModalOpen}
          onClose={() => setDeviceModalOpen(false)}
          onImport={(file) => simulateImport(file, 'devices')}
          title="Import Devices"
          subtitle="Upload a CSV file to import multiple devices at once."
          formatRequirements={[
            "First row should contain column headers",
            "Required columns: name, imei, type, vehicle",
            "Optional columns: status, battery, location, team, etc.",
            "Use comma (,) as separator"
          ]}
        />
      </section>

      {/* Example 2: Driver Import */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Driver Import Modal</h2>
        <p className="text-gray-600 mb-4">Import drivers with different requirements.</p>
        
        <Button
          variant="custom"
          customColors={{
            background: '#1F3A8A',
            text: '#FFFFFF',
            hover: { background: '#1D40B0' }
          }}
          icon={FiUsers}
          onClick={() => setDriverModalOpen(true)}
        >
          Import Drivers
        </Button>

        <ImportModal
          isOpen={driverModalOpen}
          onClose={() => setDriverModalOpen(false)}
          onImport={(file) => simulateImport(file, 'drivers')}
          title="Import Drivers"
          subtitle="Upload a CSV file to import driver information."
          formatRequirements={[
            "First row should contain column headers",
            "Required columns: name, license_no, phone, email",
            "Optional columns: address, emergency_contact, experience_years",
            "Phone numbers should be in format: +1234567890",
            "Email addresses must be valid format"
          ]}
          maxFileSize={5}
        />
      </section>

      {/* Example 3: Vehicle Import */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3. Vehicle Import Modal</h2>
        <p className="text-gray-600 mb-4">Import vehicles with larger file size limit.</p>
        
        <Button
          variant="custom"
          customColors={{
            background: '#1F3A8A',
            text: '#FFFFFF',
            hover: { background: '#1D40B0' }
          }}
          icon={FiTruck}
          onClick={() => setVehicleModalOpen(true)}
        >
          Import Vehicles
        </Button>

        <ImportModal
          isOpen={vehicleModalOpen}
          onClose={() => setVehicleModalOpen(false)}
          onImport={(file) => simulateImport(file, 'vehicles')}
          title="Import Vehicles"
          subtitle="Upload a CSV file to import vehicle fleet data."
          formatRequirements={[
            "First row should contain column headers",
            "Required columns: vehicle_number, model, year, type",
            "Optional columns: color, fuel_type, capacity, insurance_details",
            "Year should be 4-digit format (e.g., 2023)",
            "Vehicle numbers should be unique"
          ]}
          maxFileSize={20} // Larger file size for vehicles
        />
      </section>

      {/* Example 4: Custom Implementation */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4. Custom Configuration</h2>
        <p className="text-gray-600 mb-4">Custom modal with different file types and styling.</p>
        
        <Button
          variant="secondary"
          icon={FiUpload}
          onClick={() => setCustomModalOpen(true)}
        >
          Custom Import
        </Button>

        <ImportModal
          isOpen={customModalOpen}
          onClose={() => setCustomModalOpen(false)}
          onImport={(file) => simulateImport(file, 'custom data')}
          title="Custom Data Import"
          subtitle="Import custom data with flexible format."
          acceptedFileTypes={['.csv', '.txt', '.xlsx']}
          formatRequirements={[
            "Supports CSV, TXT, and Excel files",
            "Maximum file size: 15MB",
            "Flexible column structure accepted",
            "Data will be validated during import"
          ]}
          maxFileSize={15}
          className="border-2 border-blue-200"
        />
      </section>

      {/* Example 5: Integration Example */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">5. Integration in Data Table</h2>
        <p className="text-gray-600 mb-4">Example of how to integrate with your existing data table.</p>
        
        <DataTableWithImport />
      </section>
    </div>
  );
};

// Example component showing integration with data table
const DataTableWithImport: React.FC = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'Device 001', imei: '123456789012345', status: 'Active' },
    { id: 2, name: 'Device 002', imei: '123456789012346', status: 'Inactive' },
  ]);

  const handleImport = async (file: File) => {
    // In real implementation, you would:
    // 1. Send file to your API
    // 2. Parse the response
    // 3. Update your data state
    // 4. Show success/error messages
    
    console.log('Importing file:', file.name);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate adding new devices
    const newDevices = [
      { id: devices.length + 1, name: `Imported Device ${devices.length + 1}`, imei: '987654321098765', status: 'Active' },
      { id: devices.length + 2, name: `Imported Device ${devices.length + 2}`, imei: '987654321098766', status: 'Active' },
    ];
    
    setDevices(prev => [...prev, ...newDevices]);
    toast.success(`Successfully imported ${newDevices.length} devices`);
  };

  return (
    <div className="space-y-4">
      {/* Table Header with Import Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Device Management</h3>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
          >
            Export
          </Button>
          <Button
            variant="custom"
            customColors={{
              background: '#1F3A8A',
              text: '#FFFFFF',
              hover: { background: '#1D40B0' }
            }}
            size="sm"
            icon={FiUpload}
            onClick={() => setImportModalOpen(true)}
          >
            Import
          </Button>
        </div>
      </div>

      {/* Simple Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMEI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{device.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{device.imei}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      device.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {device.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
        title="Import Devices"
        subtitle="Upload a CSV file to import multiple devices at once."
      />
    </div>
  );
};

export default ImportModalExamples;