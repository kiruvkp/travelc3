import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AsyncErrorBoundary from './components/common/AsyncErrorBoundary';
import NetworkErrorBoundary from './components/common/NetworkErrorBoundary';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import AuthForm from './components/auth/AuthForm';
import LandingPage from './components/landing/LandingPage';
import HomePage from './components/home/HomePage';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import TripCreationModal from './components/trips/TripCreationModal';
import TripDetailView from './components/trips/TripDetailView';
import { Trip } from './lib/supabase';

export default function App() {
  const handleGlobalError = (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Global error caught:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  };

  function AppContent() {
    const { user, loading } = useAuth();
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [showLanding, setShowLanding] = useState(!user);
    const [showCreateTrip, setShowCreateTrip] = useState(false);
    const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'trip'>('home');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [preSelectedDestination, setPreSelectedDestination] = useState<any>(null);

    // Reset to landing page when user signs out
    React.useEffect(() => {
      if (!user) {
        setShowLanding(true);
        setCurrentView('home');
        setSelectedTrip(null);
      }
    }, [user]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading TravelPlanner...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      if (showLanding) {
        return (
          <PageErrorBoundary pageName="Landing Page">
            <LandingPage
              onGetStarted={() => {
                setShowLanding(false);
                setAuthMode('signup');
              }}
              onSignIn={() => {
                setShowLanding(false);
                setAuthMode('signin');
              }}
            />
          </PageErrorBoundary>
        );
      }
      
      return (
        <PageErrorBoundary pageName="Authentication">
          <AuthForm mode={authMode} onModeChange={setAuthMode} />
        </PageErrorBoundary>
      );
    }

    const handleViewTrip = (trip: Trip) => {
      setSelectedTrip(trip);
      setCurrentView('trip');
    };

    const handleBackToHome = () => {
      setSelectedTrip(null);
      setCurrentView('home');
    };

    const handleViewAllTrips = () => {
      setCurrentView('dashboard');
    };

    const handleCreateTripWithDestination = (destination: any) => {
      setPreSelectedDestination(destination);
      setShowCreateTrip(true);
    };
    const renderCurrentView = () => {
      switch (currentView) {
        case 'dashboard':
          return (
            <PageErrorBoundary pageName="Dashboard">
              <Dashboard onBackToHome={handleBackToHome} onViewTrip={handleViewTrip} />
            </PageErrorBoundary>
          );
        case 'trip':
          return selectedTrip ? (
            <PageErrorBoundary pageName="Trip Details">
              <TripDetailView
                trip={selectedTrip}
                onBack={handleBackToHome}
                onTripUpdated={(updatedTrip) => setSelectedTrip(updatedTrip)}
              />
            </PageErrorBoundary>
          ) : null;
        default:
          return (
            <PageErrorBoundary pageName="Home">
              <HomePage
                onCreateTrip={() => setShowCreateTrip(true)}
                onCreateTripWithDestination={handleCreateTripWithDestination}
                onViewTrip={handleViewTrip}
                onViewAllTrips={handleViewAllTrips}
              />
            </PageErrorBoundary>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <PageErrorBoundary pageName="Header">
          <Header 
            onCreateTrip={() => setShowCreateTrip(true)}
            onHome={handleBackToHome}
            currentView={currentView}
          />
        </PageErrorBoundary>
        {renderCurrentView()}
        
        {showCreateTrip && (
          <PageErrorBoundary pageName="Trip Creation">
            <TripCreationModal
              preSelectedDestination={preSelectedDestination}
              onClose={() => setShowCreateTrip(false)}
              onTripCreated={(trip) => {
                setShowCreateTrip(false);
                setPreSelectedDestination(null);
                handleViewTrip(trip);
              }}
              onCancel={() => {
                setShowCreateTrip(false);
                setPreSelectedDestination(null);
              }}
            />
          </PageErrorBoundary>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <NetworkErrorBoundary>
        <AsyncErrorBoundary onError={handleGlobalError}>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </AsyncErrorBoundary>
      </NetworkErrorBoundary>
    </ErrorBoundary>
  );
}