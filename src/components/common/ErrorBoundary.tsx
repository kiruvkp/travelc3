import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would send to your error tracking service
      // e.g., Sentry, LogRocket, etc.
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              {/* Error Icon */}
              <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, our team has been notified 
                and we're working to fix this issue.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2">
                    Show error details
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                    <div className="mb-2 font-semibold">Error:</div>
                    <div className="mb-4 text-red-600 dark:text-red-400">{this.state.error.message}</div>
                    {this.state.errorInfo && (
                      <>
                        <div className="mb-2 font-semibold">Component Stack:</div>
                        <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Go Home
                </button>
              </div>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Still having issues?{' '}
                  <button 
                    onClick={() => window.location.href = 'mailto:support@travelplanner.com'}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}