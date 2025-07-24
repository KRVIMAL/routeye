
import React from 'react';
import { useSelector } from 'react-redux';
import { selectLoading } from '../../store/slices/customLoaderSlice';
import LogoLoader from '../../pages/LogoLoader';

export const LoaderOverlay: React.FC = () => {
  const isLoading = useSelector(selectLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center">
        <LogoLoader />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};