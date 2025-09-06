import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallbackComponent?: React.ReactNode;
}

export default function ComponentErrorBoundary({ 
  children, 
  componentName,
  fallbackComponent 
}: ComponentErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Error in ${componentName || 'component'}:`, error, errorInfo);
  };

  const defaultFallback = (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
        Component Error
      </h3>
      <p className="text-red-700 dark:text-red-300 text-sm mb-4">
        {componentName ? `The ${componentName} component` : 'This component'} encountered an error and couldn't load properly.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
      >
        <ArrowPathIcon className="h-4 w-4 mr-2" />
        Refresh Page
      </button>
    </div>
  );

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={fallbackComponent || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
}