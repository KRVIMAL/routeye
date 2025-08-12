// src/hooks/useImportModal.ts - Custom hook for import functionality
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ImportConfig {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useImportModal = (config: ImportConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      config.onSuccess?.(data);
      toast.success('Import completed successfully');
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Import failed');
      config.onError?.(err);
      toast.error(err.message);
      throw err; // Re-throw to let modal handle the error state
    } finally {
      setIsImporting(false);
    }
  }, [config]);

  return {
    isOpen,
    openModal,
    closeModal,
    handleImport,
    isImporting
  };
};
// Example usage of the custom hook
// export const DeviceImportExample: React.FC = () => {
//   const [devices, setDevices] = useState([]);

//   const importModal = useImportModal({
//     endpoint: '/api/devices/import',
//     onSuccess: (data) => {
//       // Refresh device list or add imported devices
//       setDevices(prev => [...prev, ...data.devices]);
//     },
//     onError: (error) => {
//       console.error('Import error:', error);
//     }
//   });

//   return (
//     <div>
//       <Button onClick={importModal.openModal}>
//         Import Devices
//       </Button>

//       <ImportModal
//         isOpen={importModal.isOpen}
//         onClose={importModal.closeModal}
//         onImport={importModal.handleImport}
//         title="Import Devices"
//         subtitle="Upload a CSV file to import multiple devices."
//       />
//     </div>
//   );
// };