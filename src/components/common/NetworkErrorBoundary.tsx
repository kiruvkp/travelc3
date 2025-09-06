import React, { useState, useEffect } from 'react';
import { WifiIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface NetworkErrorBoundaryProps {
  children: React.ReactNode;
}

export default function NetworkErrorBoundary({ children }: NetworkErrorBoundaryProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline && showOfflineMessage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            {/* Offline Icon */}
            <div className="mx-auto h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
              <WifiIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>

            {/* Offline Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              You're Offline
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              It looks like you've lost your internet connection. Some features may not work properly 
              until you're back online.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Check Connection
              </button>
              
              <button
                onClick={() => setShowOfflineMessage(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Continue Offline
              </button>
            </div>

            {/* Offline Features Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can still view your saved trips and itineraries while offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}