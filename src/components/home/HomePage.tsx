import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../common/ErrorToast';
import { supabase, Trip, Destination } from '../../lib/supabase';
import { formatCurrency, Currency, CURRENCY_SYMBOLS, convertCurrency, getCurrencySymbol } from '../../lib/currency';
import {
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  CameraIcon,
  SparklesIcon,
  EyeIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface HomePageProps {
  onCreateTrip: () => void;
  onCreateTripWithDestination: (destination: any) => void;
  onViewTrip: (trip: Trip) => void;
  onViewAllTrips: () => void;
}

interface TripStats {
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  budgetByCurrency: Record<string, number>;
}

export default function HomePage({ 
  onCreateTrip, 
  onCreateTripWithDestination, 
  onViewTrip, 
  onViewAllTrips 
}: HomePageProps) {
  const { user, profile } = useAuth();
  const { error, setError, clearError, handleAsyncError } = useErrorHandler();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showDestinations, setShowDestinations] = useState(false);
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    budgetByCurrency: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [convertedBudget, setConvertedBudget] = useState<number>(0);
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchDestinations();
    }
  }, [user]);

  // Recalculate budget when currency changes or trips change
  useEffect(() => {
    if (user) {
      calculateTotalBudgetInSelectedCurrency();
    }
  }, [selectedCurrency, user]);

  async function calculateTotalBudgetInSelectedCurrency() {
    if (!user) return;
    
    setBudgetLoading(true);
    try {
      // Fetch fresh trip data to ensure we have latest budgets
      const { data: allTrips, error } = await supabase
        .from('trips')
        .select('budget, currency')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }


      // Convert each trip's budget to selected currency and sum
      let totalInSelectedCurrency = 0;
      
      (allTrips || []).forEach(trip => {
        const originalAmount = trip.budget || 0;
        const originalCurrency = trip.currency as Currency;
        const convertedAmount = convertCurrency(originalAmount, originalCurrency, selectedCurrency);
        totalInSelectedCurrency += convertedAmount;
      });

      setConvertedBudget(totalInSelectedCurrency);
      
    } catch (error) {
      console.error('Error calculating total budget:', error);
      setConvertedBudget(0);
    } finally {
      setBudgetLoading(false);
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setSelectedCurrency(newCurrency);
  };

  async function fetchTrips() {
    const result = await handleAsyncError(
      supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(6)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
    
    if (result) {
      const tripsData = result;
      setTrips(tripsData);
      
      // Calculate stats
      const now = new Date();
      const budgetByCurrency: Record<string, number> = {};
      
      let upcomingCount = 0;
      let completedCount = 0;
      
      tripsData.forEach(trip => {
        // Calculate budget by currency
        const currency = trip.currency;
        budgetByCurrency[currency] = (budgetByCurrency[currency] || 0) + (trip.budget || 0);
        
        // Count trip statuses
        if (trip.status === 'completed') {
          completedCount++;
        } else if (trip.start_date && new Date(trip.start_date) > now) {
          upcomingCount++;
        }
      });
      
      setStats({
        totalTrips: tripsData.length,
        upcomingTrips: upcomingCount,
        completedTrips: completedCount,
        budgetByCurrency
      });
      
      // Trigger budget calculation after trips are loaded
      if (tripsData.length > 0) {
        calculateTotalBudgetInSelectedCurrency();
      }
    }
    setLoading(false);
  }

  async function fetchDestinations() {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name')
        .limit(8);

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  }

  const getOriginalCurrencyBreakdown = () => {
    const budgetByCurrency = stats.budgetByCurrency;
    const currencies = Object.keys(budgetByCurrency).filter(currency => budgetByCurrency[currency] > 0);
    
    if (currencies.length === 0) return 'No budget set';
    
    return currencies
      .map(currency => `${formatCurrency(budgetByCurrency[currency], currency as Currency)}`)
      .join(', ');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showCurrencyDropdown && !target.closest('.currency-dropdown')) {
        setShowCurrencyDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCurrencyDropdown]);

  const recentTrips = trips.slice(0, 3);
  const featuredDestinations = destinations.slice(0, 6);

  return (
    <ComponentErrorBoundary componentName="Home Page">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Good afternoon, kiran! ✈️
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Ready for your next adventure? Let's plan something amazing.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.totalTrips}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.upcomingTrips}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.completedTrips}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                  {getCurrencySymbol(selectedCurrency)}
                </span>
              </div>
              <div className="ml-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">Total Budget</p>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCurrencyDropdown(!showCurrencyDropdown);
                      }}
                      className="currency-dropdown flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <span className="mr-1">{CURRENCY_SYMBOLS[selectedCurrency]}</span>
                      {selectedCurrency}
                      <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </button>
                    
                    {showCurrencyDropdown && (
                      <div className="currency-dropdown absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[100px]">
                        {Object.keys(CURRENCY_SYMBOLS).map((currency) => (
                          <button
                            key={currency}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCurrencyChange(currency as Currency);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center ${
                              selectedCurrency === currency 
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' 
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading || budgetLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                      ...
                    </div>
                  ) : (
                    formatCurrency(convertedBudget, selectedCurrency)
                  )}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p 
                    className="text-xs text-gray-500 dark:text-gray-400 cursor-help"
                    title={getOriginalCurrencyBreakdown()}
                  >
                    {Object.keys(stats.budgetByCurrency).length > 1 
                      ? `From ${Object.keys(stats.budgetByCurrency).length} currencies`
                      : Object.keys(stats.budgetByCurrency).length === 1 
                        ? 'Single currency'
                        : 'No budget set'
                    }
                  </p>
                  {Object.keys(stats.budgetByCurrency).length > 1 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Converted
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <SparklesIcon className="h-6 w-6 text-purple-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={onCreateTrip}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <PlusIcon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Plan New Trip</h3>
              <p className="text-blue-100 text-sm">Start planning your next adventure</p>
            </button>

            <button
              onClick={() => setShowDestinations(true)}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <GlobeAltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Explore Destinations</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Discover amazing places to visit</p>
            </button>

            <button
              onClick={onViewAllTrips}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                <EyeIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">View All Trips</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Browse your travel history</p>
            </button>

            <button
              onClick={() => {/* Handle travel memories */}}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-800 transition-colors">
                <CameraIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Travel Memories</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View your photo collections</p>
            </button>
          </div>
        </div>

        {/* Recent Trips */}
        {recentTrips.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Trips</h2>
              <button
                onClick={onViewAllTrips}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center"
              >
                View all
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onViewTrip(trip)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    {trip.cover_image ? (
                      <img
                        src={trip.cover_image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white text-center">
                          <MapPinIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                          <p className="text-lg font-medium opacity-90">{trip.destination || 'New Adventure'}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {trip.title}
                    </h3>
                    {trip.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{trip.destination}</span>
                      {trip.budget > 0 && (
                        <span className="font-medium">
                          {formatCurrency(
                            trip.currency === selectedCurrency 
                              ? trip.budget 
                              : convertCurrency(trip.budget, trip.currency as Currency, selectedCurrency),
                            selectedCurrency
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Destinations */}
        {featuredDestinations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Destinations</h2>
              <SparklesIcon className="h-6 w-6 text-purple-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  onClick={() => onCreateTripWithDestination(destination)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative h-48">
                    <img
                      src={destination.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold text-lg">{destination.name}</h3>
                      {destination.country && (
                        <p className="text-sm opacity-90">{destination.country}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {destination.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {destination.description}
                      </p>
                    )}
                    {destination.popular_activities && destination.popular_activities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {destination.popular_activities.slice(0, 3).map((activity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared with Me Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🤝</span>
              Shared with Me
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Collaborative trips</span>
          </div>
          
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No shared trips yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When others share trips with you, they'll appear here
            </p>
          </div>
        </div>
      </div>

      {/* Explore Destinations Modal */}
      {showDestinations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <GlobeAltIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Destinations</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Discover amazing places to visit</p>
                </div>
              </div>
              <button
                onClick={() => setShowDestinations(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Destinations Grid */}
            <div className="p-6">
              {destinations.length === 0 ? (
                <div className="text-center py-12">
                  <GlobeAltIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No destinations available</h3>
                  <p className="text-gray-600 dark:text-gray-400">Check back later for curated destination recommendations</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      onClick={() => {
                        setShowDestinations(false);
                        onCreateTripWithDestination(destination);
                      }}
                      className="group bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="relative h-48">
                        <img
                          src={destination.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-semibold text-lg">{destination.name}</h3>
                          {destination.country && (
                            <p className="text-sm opacity-90">{destination.country}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {destination.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {destination.description}
                          </p>
                        )}
                        
                        {destination.best_time_to_visit && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                            Best time: {destination.best_time_to_visit}
                          </p>
                        )}
                        
                        {destination.popular_activities && destination.popular_activities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {destination.popular_activities.slice(0, 3).map((activity, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              >
                                {activity}
                              </span>
                            ))}
                            {destination.popular_activities.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{destination.popular_activities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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