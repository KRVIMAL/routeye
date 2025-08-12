

// Enhanced Loading Component
// components/SummarySection/SummaryLoadingSkeleton.tsx
import React from 'react';

const SummaryLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex space-x-4 animate-pulse">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-xl"
          style={{ width: '192px', height: '95px' }}
        >
          <div className="flex h-full">
            <div className="w-24 bg-gray-300 rounded-l-xl" />
            <div className="flex-1 p-3 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-3/4" />
              <div className="space-y-1">
                <div className="h-2 bg-gray-300 rounded w-1/2" />
                <div className="h-2 bg-gray-300 rounded w-2/3" />
                <div className="h-2 bg-gray-300 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryLoadingSkeleton;

// Update your SummarySection to use these components:
// 1. Wrap the SummarySection with SummaryErrorBoundary in DevicesPage
// 2. Replace the loading spinner with SummaryLoadingSkeleton