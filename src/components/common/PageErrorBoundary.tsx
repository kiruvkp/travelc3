import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

export default function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Error in ${pageName || 'page'}:`, error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      // e.g., Sentry.captureException(error, { extra: errorInfo });
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <ErrorFallback
          title={`Error in ${pageName || 'Page'}`}
          message={`We encountered an error while loading ${pageName ? `the ${pageName.toLowerCase()} page` : 'this page'}. Please try refreshing or go back to the home page.`}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}