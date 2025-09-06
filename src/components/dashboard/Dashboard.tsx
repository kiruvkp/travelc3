import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../common/ErrorToast';
import ErrorToast from '../common/ErrorToast';
import { supabase, Trip } from '../../lib/supabase';
import { Currency, CURRENCY_SYMBOLS } from '../../lib/currency';
import TripCard from './TripCard';
import TripCreationModal from '../trips/TripCreationModal';
import TripDetailView from '../trips/TripDetailView';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardProps {
  onBackToHome: () => void;
  onViewTrip: (trip: Trip) => void;
}

export default function Dashboard({ onBackToHome, onViewTrip }: DashboardProps) {
  const { user } = useAuth();
  const { error, setError, clearError, handleAsyncError } = useErrorHandler();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'active' | 'completed'>('all');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  async function fetchTrips() {
    setLoading(true);
    const result = await handleAsyncError(
      supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
    
    if (result) {
      setTrips(result);
    } else {
      setTrips([]); // Set empty array on error
    }
    setLoading(false);
  }

  async function handleDeleteTrip(trip: Trip) {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id)
        .eq('user_id', user?.id); // Extra security check

      if (error) throw error;
      
      // Remove trip from local state
      setTrips(prev => prev.filter(t => t.id !== trip.id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  }
  function handleTripCreated(trip: Trip) {
    setTrips(prev => [trip, ...prev]);
    setShowCreateModal(false);
    onViewTrip(trip);
  }

  // Filter trips based on search and status
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ComponentErrorBoundary componentName="Dashboard">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-white">
            <div className="flex items-center mb-4">
              <button
                onClick={onBackToHome}
                className="mr-4 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">All Trips</h1>
                <p className="text-blue-100 dark:text-blue-200">Manage and explore your travel adventures</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Trip
              </button>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
                <div className="h-48 bg-gray-300 dark:bg-gray-600" />
                <div className="p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-2/3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="mr-2">{CURRENCY_SYMBOLS[displayCurrency]}</span>
                    {displayCurrency}
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </button>
                  
                  {showCurrencyDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                      {Object.keys(CURRENCY_SYMBOLS).map((currency) => (
                        <button
                          key={currency}
                          onClick={() => {
                            setDisplayCurrency(currency as Currency);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center ${
                            displayCurrency === currency 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="mr-2">{CURRENCY_SYMBOLS[currency as Currency]}</span>
                          {currency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <PlusIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No trips found' : 'Start Your Journey'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters to find your trips.'
                : 'Create your first trip and let AI help you plan the perfect itinerary.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Trip
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                displayCurrency={displayCurrency}
                onClick={onViewTrip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trip Creation Modal */}
      {showCreateModal && (
        <TripCreationModal
          onClose={() => setShowCreateModal(false)}
          onTripCreated={handleTripCreated}
        />
      )}
      
      {/* Error Toast */}
      <ErrorToast
        message={error?.message || ''}
        type="error"
        isVisible={!!error}
        onClose={clearError}
      />
    </div>
    </ComponentErrorBoundary>
  );
}