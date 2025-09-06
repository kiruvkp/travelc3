import React from 'react';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface NotFoundPageProps {
  onGoHome?: () => void;
  onGoBack?: () => void;
  title?: string;
  message?: string;
}

export default function NotFoundPage({ 
  onGoHome,
  onGoBack,
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved."
}: NotFoundPageProps) {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* 404 Illustration */}
          <div className="mx-auto h-32 w-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-8">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              404
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Search Suggestion */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-2">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Looking for something specific?</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button 
                onClick={handleGoHome}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Dashboard
              </button>
              <button 
                onClick={handleGoHome}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Create Trip
              </button>
              <button 
                onClick={handleGoHome}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → My Trips
              </button>
              <button 
                onClick={handleGoHome}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Help Center
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Go Home
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}