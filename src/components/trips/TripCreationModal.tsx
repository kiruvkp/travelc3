import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Trip, Destination } from '../../lib/supabase';
import { CURRENCY_SYMBOLS, getCurrencyName } from '../../lib/currency';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AIRecommendations from '../ai/AIRecommendations';

interface TripCreationModalProps {
  preSelectedDestination?: any;
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
  onCancel?: () => void;
}

export default function TripCreationModal({ preSelectedDestination, onClose, onTripCreated, onCancel }: TripCreationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: 0,
    currency: 'USD',
    is_public: false,
    cover_image: '',
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (preSelectedDestination) {
      setFormData(prev => ({
        ...prev,
        destination: preSelectedDestination.name + (preSelectedDestination.country ? `, ${preSelectedDestination.country}` : ''),
        cover_image: preSelectedDestination.image_url || '',
      }));
      setStep(2);
    }
  }, [preSelectedDestination]);
  async function fetchDestinations() {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          ...formData,
          budget: formData.budget || 0,
        })
        .select()
        .single();

      if (error) throw error;
      onTripCreated(data);
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  }

  function selectDestination(destination: Destination) {
    setFormData(prev => ({
      ...prev,
      destination: destination.name + (destination.country ? `, ${destination.country}` : ''),
      cover_image: destination.image_url || '',
    }));
    setStep(2);
  }

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Trip</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Choose Destination</span>
            <span className="text-sm text-gray-600">Trip Details</span>
          </div>
        </div>

        {/* Step 1: Destination Selection */}
        {step === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Where would you like to go?</h3>
            
            {/* Search */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  onClick={() => selectDestination(destination)}
                  className="cursor-pointer group"
                >
                  <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                    <img
                      src={destination.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <p className="font-semibold text-sm">{destination.name}</p>
                      {destination.country && (
                        <p className="text-xs opacity-90">{destination.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Destination */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-3">Or enter a custom destination:</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter destination name..."
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => formData.destination && setStep(2)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!formData.destination}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Trip Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Adventure in Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your trip..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Destination"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Trip Duration Helper */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">Trip Duration</h4>
                  {formData.start_date && formData.end_date && (
                    <span className="text-sm text-blue-700">
                      {(() => {
                        const start = new Date(formData.start_date);
                        const end = new Date(formData.end_date);
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return `${days} day${days !== 1 ? 's' : ''}`;
                      })()}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 3, 7, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        const startDate = formData.start_date || new Date().toISOString().split('T')[0];
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + days - 1);
                        setFormData(prev => ({
                          ...prev,
                          start_date: startDate,
                          end_date: endDate.toISOString().split('T')[0]
                        }));
                      }}
                      className="px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {days} day{days !== 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Or set custom duration:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Days"
                      className="w-20 px-2 py-1 text-sm border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const days = parseInt(e.target.value);
                        if (days > 0) {
                          const startDate = formData.start_date || new Date().toISOString().split('T')[0];
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + days - 1);
                          setFormData(prev => ({
                            ...prev,
                            start_date: startDate,
                            end_date: endDate.toISOString().split('T')[0]
                          }));
                        }
                      }}
                    />
                    <span className="text-sm text-blue-700">days</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                      <option key={code} value={code}>
                        {symbol} {code} - {getCurrencyName(code as any)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Make this trip public (others can view it)
                </label>
              </div>
            </div>

            {/* AI Recommendations */}
            {formData.destination && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <AIRecommendations
                  destination={formData.destination}
                  interests={[]}
                  budget={formData.budget}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => preSelectedDestination ? (onCancel || onClose)() : setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {preSelectedDestination ? 'Cancel' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}