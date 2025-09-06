import React, { useState, useEffect } from 'react';
import ErrorFallback from './ErrorFallback';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export default function AsyncErrorBoundary({ children, onError }: AsyncErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      setError(error);
      onError?.(error);
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message);
      
      setError(error);
      onError?.(error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [onError]);

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={() => setError(null)}
        title="Async Error Detected"
        message="An error occurred while processing your request. This might be due to a network issue or a temporary problem with our services."
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  return <>{children}</>;
}