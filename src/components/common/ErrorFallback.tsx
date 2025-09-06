import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
}

export default function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  showDetails = false 
}: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@travelplanner.com?subject=Error Report&body=' + 
      encodeURIComponent(`Error: ${error?.message || 'Unknown error'}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Error Icon */}
          <div className="mx-auto h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Error Details (Development/Debug Mode) */}
          {showDetails && error && (
            <details className="mb-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3 font-medium">
                Technical Details
              </summary>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                <div className="mb-2 font-semibold text-red-600 dark:text-red-400">
                  {error.name}: {error.message}
                </div>
                {error.stack && (
                  <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                    {error.stack}
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {resetError && (
              <button
                onClick={resetError}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Go Home
              </button>
              
              <button
                onClick={handleContactSupport}
                className="inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Get Help
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              If this problem continues, please include this ID when contacting support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}