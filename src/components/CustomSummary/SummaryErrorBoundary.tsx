// components/SummarySection/SummaryErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class SummaryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Summary section error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <div className="flex flex-col items-center space-y-3">
            <FaExclamationTriangle className="text-orange-500 text-2xl" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Summary Unavailable
              </h3>
              <p className="text-sm text-gray-600">
                There was an issue loading the summary data.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaRedo size={14} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SummaryErrorBoundary;