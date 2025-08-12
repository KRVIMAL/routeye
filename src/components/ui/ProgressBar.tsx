// src/components/ui/ProgressBar.tsx - With tooltip percentage
import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  message?: string;
  backgroundColor?: string;
  progressColor?: string;
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 20,
  message,
  backgroundColor = '#DEE2EE',
  progressColor = '#1F3A8A',
  className = '',
  animated = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div>
        {/* Progress Bar with Tooltip */}
        <div className="relative">
          <div
            className={`w-full rounded-lg overflow-hidden ${animated ? 'transition-all duration-300' : ''}`}
            style={{
              backgroundColor,
              height: `${height}px`,
            }}
          >
            <div
              className={`h-full rounded-lg ${animated ? 'transition-all duration-500 ease-out' : ''}`}
              style={{
                width: `${percentage}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
          
          {/* Tooltip showing percentage */}
          <div 
            className="absolute -top-12 transform -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          >
            <div className="bg-[#1F3A8A] text-white text-sm font-medium px-3 py-1 rounded-lg relative">
              {Math.round(percentage)}%
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1F3A8A]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;