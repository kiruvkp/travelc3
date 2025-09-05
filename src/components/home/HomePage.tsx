import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Trip, Destination } from '../../lib/supabase';
import {
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  CameraIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface HomePageProps {
  onCreateTrip: () => void;
  onCreateTripWithDestination: (destination: Destination) => void;
  onViewTrip: (trip: Trip) => void;
  onViewAllTrips: () => void;
}

export default function HomePage({ onCreateTrip, onCreateTripWithDestination, onViewTrip, onViewAllTrips }: HomePageProps) {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDestinations, setShowDestinations] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [selectedTravelDates, setSelectedTravelDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [seasonalRecommendations, setSeasonalRecommendations] = useState<{
    season: string;
    recommendations: string[];
    bestDestinations: Destination[];
  } | null>(null);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [showTravelMemories, setShowTravelMemories] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  // Auto-slide AI insights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % aiInsights.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  async function fetchDestinations() {
    try {
      setDestinationsLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
      
      // Generate seasonal recommendations if dates are selected
      if (selectedTravelDates.startDate) {
        generateSeasonalRecommendations(data || []);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setDestinationsLoading(false);
    }
  }

  function getSeason(dateString: string): string {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall';
    return 'Winter';
  }

  function generateSeasonalRecommendations(allDestinations: Destination[]) {
    if (!selectedTravelDates.startDate) return;
    
    const season = getSeason(selectedTravelDates.startDate);
    const month = new Date(selectedTravelDates.startDate).getMonth() + 1;
    
    // Filter destinations based on best time to visit
    const bestDestinations = allDestinations.filter(dest => {
      if (!dest.best_time_to_visit) return false;
      const bestTime = dest.best_time_to_visit.toLowerCase();
      const seasonLower = season.toLowerCase();
      
      // Check if the season or specific months are mentioned
      return bestTime.includes(seasonLower) || 
             bestTime.includes(getMonthName(month).toLowerCase()) ||
             (season === 'Summer' && (bestTime.includes('june') || bestTime.includes('july') || bestTime.includes('august'))) ||
             (season === 'Winter' && (bestTime.includes('december') || bestTime.includes('january') || bestTime.includes('february'))) ||
             (season === 'Spring' && (bestTime.includes('march') || bestTime.includes('april') || bestTime.includes('may'))) ||
             (season === 'Fall' && (bestTime.includes('september') || bestTime.includes('october') || bestTime.includes('november')));
    });
    
    // Generate season-specific recommendations
    const recommendations = getSeasonalTips(season, month);
    
    setSeasonalRecommendations({
      season,
      recommendations,
      bestDestinations: bestDestinations.slice(0, 6) // Limit to top 6
    });
  }

  function getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  function getSeasonalTips(season: string, month: number): string[] {
    const seasonalTips: Record<string, string[]> = {
      Spring: [
        'Perfect weather for outdoor activities and sightseeing',
        'Fewer crowds than summer, better prices',
        'Beautiful blooming flowers and mild temperatures',
        'Great for hiking and nature photography',
        'Ideal for city exploration without extreme heat'
      ],
      Summer: [
        'Peak travel season with longest days',
        'Perfect for beach destinations and water activities',
        'Outdoor festivals and events are abundant',
        'Great for northern destinations and mountain regions',
        'Book accommodations early due to high demand'
      ],
      Fall: [
        'Beautiful autumn foliage in many destinations',
        'Comfortable temperatures for walking and exploring',
        'Harvest season with great local food experiences',
        'Lower prices than summer peak season',
        'Perfect for wine regions and cultural activities'
      ],
      Winter: [
        'Great for winter sports and snowy destinations',
        'Perfect time for tropical and warm climate destinations',
        'Holiday markets and winter festivals',
        'Lower prices in many destinations (except ski resorts)',
        'Cozy indoor activities and cultural experiences'
      ]
    };
    
    return seasonalTips[season] || [];
  }

  function handleExploreDestinations() {
    setShowDestinations(true);
    if (destinations.length === 0) {
      fetchDestinations();
    }
  }

  function handleCreateTripWithDestination(destination: Destination) {
    setShowDestinations(false);
    onCreateTripWithDestination(destination);
  }

  async function fetchTrips() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const tripsData = data || [];
      setTrips(tripsData);
      
      // Calculate stats
      const now = new Date();
      const upcoming = tripsData.filter(trip => 
        trip.start_date && isAfter(new Date(trip.start_date), now)
      );
      const completed = tripsData.filter(trip => trip.status === 'completed');
      const totalBudget = tripsData.reduce((sum, trip) => sum + (trip.budget || 0), 0);
      
      setStats({
        totalTrips: tripsData.length,
        upcomingTrips: upcoming.length,
        completedTrips: completed.length,
        totalBudget,
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(trip: Trip) {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id)
        .eq('user_id', user?.id); // Extra security check

      if (error) throw error;
      
      // Refresh trips and stats
      await fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  }
  const recentTrips = trips.slice(0, 3);
  const upcomingTrips = trips
    .filter(trip => trip.start_date && isAfter(new Date(trip.start_date), new Date()))
    .slice(0, 2);

  const aiInsights = [
    {
      icon: '🌟',
      title: 'Trending Destinations',
      description: 'Based on your travel history, consider visiting Japan or Iceland for your next adventure.',
    },
    {
      icon: '💰',
      title: 'Budget Optimization',
      description: 'You could save 15% on your next trip by traveling in shoulder season.',
    },
    {
      icon: '📅',
      title: 'Best Time to Book',
      description: 'Book your summer vacation now for the best deals - prices typically rise 20% closer to travel dates.',
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'AI has found 12 hidden gems in your favorite destinations that match your interests.',
    },
    {
      icon: '✈️',
      title: 'Flight Deals Alert',
      description: 'Flights to your wishlist destinations are 25% cheaper than usual this month.',
    },
    {
      icon: '🏨',
      title: 'Accommodation Tips',
      description: 'Book accommodations 2-3 months in advance for the best rates and availability.',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Start planning your next adventure',
      icon: PlusIcon,
      color: 'from-blue-500 to-purple-600',
      action: onCreateTrip,
    },
    {
      title: 'Explore Destinations',
      description: 'Discover amazing places to visit',
      icon: GlobeAltIcon,
      color: 'from-green-500 to-teal-600',
      action: handleExploreDestinations,
    },
    {
      title: 'View All Trips',
      description: 'Browse your travel history',
      icon: MapPinIcon,
      color: 'from-orange-500 to-red-600',
      action: onViewAllTrips,
    },
    {
      title: 'Travel Memories',
      description: 'View your photo collections',
      icon: CameraIcon,
      color: 'from-pink-500 to-rose-600',
      action: () => setShowTravelMemories(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Traveler'}! ✈️
            </h1>
            <p className="text-xl text-blue-100">
              Ready for your next adventure? Let's plan something amazing.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <SparklesIcon className="h-5 w-5 text-purple-500" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className={`h-10 w-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-green-600" />
                Shared with Me
              </h2>
              <span className="text-sm text-gray-500">Collaborative trips</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-2">No shared trips yet</p>
              <p className="text-sm">When others share trips with you, they'll appear here</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Trips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Trips</h2>
                <button
                  onClick={onViewAllTrips}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : upcomingTrips.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No upcoming trips planned</p>
                  <button
                    onClick={onCreateTrip}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Plan your next adventure
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => onViewTrip(trip)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{trip.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {trip.destination}
                          </p>
                          {trip.start_date && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {format(new Date(trip.start_date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {trip.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Trips</h2>
                <button
                  onClick={onViewAllTrips}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : recentTrips.length === 0 ? (
                <div className="text-center py-8">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No trips yet</p>
                  <button
                    onClick={onCreateTrip}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => onViewTrip(trip)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{trip.title}</h3>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {trip.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : trip.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trip.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-sm p-6 mb-8 text-white">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">AI Travel Insights</h2>
            <div className="ml-auto flex space-x-1">
              {aiInsights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInsightIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentInsightIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentInsightIndex * 100}%)` }}
            >
              {aiInsights.map((insight, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="font-medium mb-3 text-lg flex items-center">
                      <span className="text-2xl mr-3">{insight.icon}</span>
                      {insight.title}
                    </h3>
                    <p className="text-purple-100 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explore Destinations Modal */}
      {showDestinations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <GlobeAltIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Explore Destinations</h2>
                  <p className="text-sm text-gray-600">Discover amazing places for your next adventure</p>
                </div>
              </div>
              <button
                onClick={() => setShowDestinations(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Travel Dates Selection */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  When are you planning to travel?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={selectedTravelDates.startDate}
                      onChange={(e) => {
                        setSelectedTravelDates(prev => ({ ...prev, startDate: e.target.value }));
                        if (destinations.length > 0) {
                          generateSeasonalRecommendations(destinations);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={selectedTravelDates.endDate}
                      onChange={(e) => setSelectedTravelDates(prev => ({ ...prev, endDate: e.target.value }))}
                      min={selectedTravelDates.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {selectedTravelDates.startDate && (
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">
                      Traveling in {getSeason(selectedTravelDates.startDate)}
                    </span>
                    {selectedTravelDates.endDate && (
                      <span className="ml-2">
                        ({Math.ceil((new Date(selectedTravelDates.endDate).getTime() - new Date(selectedTravelDates.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Seasonal Recommendations */}
              {seasonalRecommendations && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <SparklesIcon className="h-6 w-6 text-green-600 mr-2" />
                      Perfect for {seasonalRecommendations.season} Travel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Why {seasonalRecommendations.season} is Great:</h4>
                        <ul className="space-y-2">
                          {seasonalRecommendations.recommendations.map((tip, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <CheckIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Best Destinations ({seasonalRecommendations.bestDestinations.length} found):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {seasonalRecommendations.bestDestinations.slice(0, 8).map((dest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                              {dest.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Featured Seasonal Destinations */}
                  {seasonalRecommendations.bestDestinations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recommended for {seasonalRecommendations.season}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {seasonalRecommendations.bestDestinations.slice(0, 6).map((destination) => (
                          <div
                            key={destination.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-green-200 overflow-hidden group"
                            onClick={() => {
                              setShowDestinations(false);
                              handleCreateTripWithDestination(destination);
                            }}
                          >
                            <div className="relative h-32 bg-gradient-to-r from-green-500 to-emerald-600">
                              {destination.image_url ? (
                                <img
                                  src={destination.image_url}
                                  alt={destination.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <MapPinIcon className="h-8 w-8 mx-auto mb-1 opacity-80" />
                                    <p className="text-sm font-medium opacity-90">{destination.name}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Perfect for {seasonalRecommendations.season}
                                </span>
                              </div>
                            </div>

                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                {destination.name}
                              </h4>
                              {destination.country && (
                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                  <MapPinIcon className="h-3 w-3 mr-1" />
                                  {destination.country}
                                </p>
                              )}
                              {destination.best_time_to_visit && (
                                <p className="text-xs text-green-600 font-medium">
                                  Best time: {destination.best_time_to_visit}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {destinationsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-300 rounded-lg mb-4" />
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-3 bg-gray-300 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : destinations.length === 0 ? (
                <div className="text-center py-12">
                  <GlobeAltIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Destinations Available</h3>
                  <p className="text-gray-600 mb-6">
                    We're working on adding amazing destinations for you to explore.
                  </p>
                  <button
                    onClick={onCreateTrip}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Custom Trip
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    All Destinations
                    {!selectedTravelDates.startDate && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Select travel dates above for seasonal recommendations)
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden group"
                      onClick={() => {
                        setShowDestinations(false);
                        // Create trip with pre-selected destination
                        handleCreateTripWithDestination(destination);
                      }}
                    >
                      {/* Destination Image */}
                      <div className="relative h-48 bg-gradient-to-r from-green-500 to-teal-600">
                        {destination.image_url ? (
                          <img
                            src={destination.image_url}
                            alt={destination.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-white text-center">
                              <MapPinIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                              <p className="text-lg font-medium opacity-90">{destination.name}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Best Time Badge */}
                        {destination.best_time_to_visit && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                              Best: {destination.best_time_to_visit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {destination.name}
                          </h3>
                          {destination.country && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {destination.country}
                            </p>
                          )}
                        </div>

                        {destination.description && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                            {destination.description}
                          </p>
                        )}

                        {/* Popular Activities */}
                        {destination.popular_activities && destination.popular_activities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Popular Activities</h4>
                            <div className="flex flex-wrap gap-1">
                              {destination.popular_activities.slice(0, 3).map((activity, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {activity}
                                </span>
                              ))}
                              {destination.popular_activities.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{destination.popular_activities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Click to plan trip</span>
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Travel Memories Modal */}
      {showTravelMemories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <CameraIcon className="h-6 w-6 text-pink-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Travel Memories</h2>
                  <p className="text-sm text-gray-600">Your photo collections from amazing trips</p>
                </div>
              </div>
              <button
                onClick={() => setShowTravelMemories(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <CameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Travel Memories Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start creating trips and capture your travel memories with photos.
                  </p>
                  <button
                    onClick={() => {
                      setShowTravelMemories(false);
                      onCreateTrip();
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all duration-200"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Your First Trip
                  </button>
                </div>
              ) : (
                <div>
                  {/* Trip Memories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden group cursor-pointer"
                        onClick={() => {
                          setShowTravelMemories(false);
                          onViewTrip(trip);
                        }}
                      >
                        {/* Trip Image */}
                        <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-600">
                          {trip.cover_image ? (
                            <img
                              src={trip.cover_image}
                              alt={trip.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-white text-center">
                                <CameraIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                                <p className="text-lg font-medium opacity-90">{trip.destination || 'Travel Memory'}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trip.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : trip.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {trip.status === 'completed' ? 'Completed' : trip.status === 'active' ? 'Active' : 'Planning'}
                            </span>
                          </div>

                          {/* Photo Count Overlay */}
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
                              <CameraIcon className="h-4 w-4 inline mr-1" />
                              {Math.floor(Math.random() * 20) + 5} photos
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                              {trip.title}
                            </h3>
                            {trip.destination && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {trip.destination}
                              </p>
                            )}
                          </div>

                          {trip.start_date && (
                            <p className="text-sm text-gray-500 flex items-center mb-3">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {format(new Date(trip.start_date), 'MMM d, yyyy')}
                              {trip.end_date && trip.start_date !== trip.end_date && (
                                <>
                                  {' - '}
                                  {format(new Date(trip.end_date), 'MMM d, yyyy')}
                                </>
                              )}
                            </p>
                          )}

                          {trip.description && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                              {trip.description}
                            </p>
                          )}

                          {/* Memory Stats */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <CameraIcon className="h-3 w-3 mr-1" />
                                {Math.floor(Math.random() * 20) + 5}
                              </span>
                              <span className="flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {Math.floor(Math.random() * 10) + 3} places
                              </span>
                            </div>
                            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coming Soon Features */}
                  <div className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-8 border border-pink-200">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">More Memory Features Coming Soon!</h3>
                      <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
                        We're working on exciting new features like photo uploads, memory timelines, 
                        AI-powered photo organization, and shareable memory albums.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                          📸 Photo Upload
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                          🤖 AI Organization
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                          📱 Memory Albums
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                          🌍 Memory Map
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}