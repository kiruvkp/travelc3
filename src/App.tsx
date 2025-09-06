import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthForm from './components/auth/AuthForm';
import LandingPage from './components/landing/LandingPage';
import HomePage from './components/home/HomePage';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import TripCreationModal from './components/trips/TripCreationModal';
import TripDetailView from './components/trips/TripDetailView';
import { Trip } from './lib/supabase';

export default function App() {
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      if (showLanding) {
        return (
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
        );
      }
      
      return <AuthForm mode={authMode} onModeChange={setAuthMode} />;
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
          return <Dashboard onBackToHome={handleBackToHome} onViewTrip={handleViewTrip} />;
        case 'trip':
          return selectedTrip ? (
            <TripDetailView
              trip={selectedTrip}
              onBack={handleBackToHome}
              onTripUpdated={(updatedTrip) => setSelectedTrip(updatedTrip)}
            />
          ) : null;
        default:
          return (
            <HomePage
              onCreateTrip={() => setShowCreateTrip(true)}
              onCreateTripWithDestination={handleCreateTripWithDestination}
              onViewTrip={handleViewTrip}
              onViewAllTrips={handleViewAllTrips}
            />
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onCreateTrip={() => setShowCreateTrip(true)}
          onHome={handleBackToHome}
          currentView={currentView}
        />
        {renderCurrentView()}
        
        {showCreateTrip && (
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
        )}
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}