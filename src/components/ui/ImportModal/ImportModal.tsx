// src/components/ui/ImportModal/ImportModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiX, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Button from '../Button';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  title?: string;
  subtitle?: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  formatRequirements?: string[];
  className?: string;
}

interface UploadState {
  file: File | null;
  isDragOver: boolean;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  title = "Import Devices",
  subtitle = "Upload a CSV file to import multiple data at once.",
  acceptedFileTypes = ['.csv'],
  maxFileSize = 10, // 10MB
  formatRequirements = [
    "First row should contain column headers",
    "Required columns: name, imei, type, vehicle",
    "Optional columns: status, battery, location, team, etc.",
    "Use comma (,) as separator"
  ],
  className = ""
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isDragOver: false,
    isUploading: false,
    error: null,
    progress: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFileTypes.some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))) {
      return `Please select a valid file type: ${acceptedFileTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size must be less than ${maxFileSize}MB. Current size: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  }, [acceptedFileTypes, maxFileSize]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    
    setUploadState(prev => ({
      ...prev,
      file: error ? null : file,
      error,
      progress: 0
    }));
  }, [validateFile]);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setUploadState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!dropzoneRef.current?.contains(event.relatedTarget as Node)) {
      setUploadState(prev => ({ ...prev, isDragOver: false }));
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setUploadState(prev => ({ ...prev, isDragOver: false }));

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle import
  const handleImport = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0 }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      await onImport(uploadState.file);

      clearInterval(progressInterval);
      setUploadState(prev => ({ ...prev, progress: 100 }));

      // Close modal after successful import
      setTimeout(() => {
        onClose();
        resetState();
      }, 500);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Import failed. Please try again.',
        progress: 0
      }));
    }
  };

  // Reset state
  const resetState = () => {
    setUploadState({
      file: null,
      isDragOver: false,
      isUploading: false,
      error: null,
      progress: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!uploadState.isUploading) {
      onClose();
      resetState();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className={`bg-white rounded-3xl shadow-2xl max-w-[755px] w-full max-h-[90vh] overflow-y-auto border ${className}`}
          style={{
            maxWidth: '455px',
            borderRadius: '24px',
            borderWidth: '1px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUploadCloud className="w-5 h-5" style={{ color: '#1F3A8A' }} />
              </div>
              <div>
                <h2 
                  className="text-xl font-semibold"
                  style={{ 
                    color: '#1F3A8A',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {title}
                </h2>
                <p 
                  className="text-sm mt-1"
                  style={{ 
                    color: '#4B5563',
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                >
                  {subtitle}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={uploadState.isUploading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Dropzone */}
          <div className="px-6">
            <div
              ref={dropzoneRef}
              className={`relative transition-all duration-200 ${
                uploadState.isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-400 hover:border-gray-500'
              }`}
              style={{
                width: '100%',
                maxWidth: '683px',
                height: '301px',
                borderRadius: '12px',
                borderWidth: '2.5px',
                borderStyle: 'dashed',
                borderColor: uploadState.isDragOver ? '#60A5FA' : '#808080',
                margin: '0 auto'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {uploadState.file ? (
                  // File selected state
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadState.file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(uploadState.file.size)}</p>
                    </div>
                    {uploadState.error && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        <FiAlertCircle className="w-4 h-4" />
                        <span className="text-sm">{uploadState.error}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Default state
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiUploadCloud className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p 
                        className="text-lg font-medium mb-2"
                        style={{ color: '#1F3A8A' }}
                      >
                        Drop your CSV file here, or click to select
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: '#4B5563' }}
                      >
                        Supports CSV files up to {maxFileSize}MB
                      </p>
                    </div>

                    <Button
                      variant="custom"
                      customColors={{
                        background: '#1F3A8A',
                        text: '#FFFFFF',
                        hover: { background: '#1D40B0' }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadState.isUploading}
                      className="px-6 py-2"
                    >
                      Select File
                    </Button>

                    {uploadState.error && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg max-w-sm">
                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{uploadState.error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {uploadState.isUploading && (
                  <div className="w-full max-w-sm mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Importing... {uploadState.progress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploadState.isUploading}
              />
            </div>
          </div>

          {/* Format Requirements */}
          <div className="px-6 py-6">
            <h3 
              className="font-semibold mb-4"
              style={{ 
                color: '#1F3A8A',
                fontFamily: 'Work Sans, sans-serif'
              }}
            >
              CSV Format Requirements:
            </h3>
            <ul className="space-y-2">
              {formatRequirements.map((requirement, index) => (
                <li 
                  key={index}
                  className="flex items-start space-x-3 text-sm"
                  style={{ color: '#4B5563' }}
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={uploadState.isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="custom"
              customColors={{
                background: '#6B7280',
                text: '#FFFFFF',
                hover: { background: '#4B5563' }
              }}
              onClick={handleImport}
              disabled={!uploadState.file || !!uploadState.error || uploadState.isUploading}
              loading={uploadState.isUploading}
              className="px-6"
            >
              {uploadState.isUploading ? 'Importing...' : 'Start Importing'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportModal;