import React, { useState } from 'react';
import { supabase, Activity } from '../../lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onActivityUpdated: (activity: Activity) => void;
}

const categories = [
  { value: 'attraction', label: 'Attraction', emoji: '🎯' },
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'accommodation', label: 'Accommodation', emoji: '🏨' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎭' },
];

export default function EditActivityModal({ 
  activity, 
  onClose, 
  onActivityUpdated 
}: EditActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description || '',
    category: activity.category,
    location: activity.location || '',
    start_time: activity.start_time ? new Date(activity.start_time).toISOString().slice(0, 16) : '',
    end_time: activity.end_time ? new Date(activity.end_time).toISOString().slice(0, 16) : '',
    cost: activity.cost || 0,
    booking_url: activity.booking_url || '',
    notes: activity.notes || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          cost: formData.cost || 0,
          booking_url: formData.booking_url,
          notes: formData.notes,
        })
        .eq('id', activity.id)
        .select()
        .single();

      if (error) throw error;
      
      // Handle expense record updates
      if (data && formData.cost && formData.cost > 0) {
        // Check if expense record already exists for this activity
        const { data: existingExpense, error: fetchError } = await supabase
          .from('expenses')
          .select('id')
          .eq('activity_id', activity.id)
          .maybeSingle();

        if (!fetchError && existingExpense) {
          // Update existing expense
          const { error: updateError } = await supabase
            .from('expenses')
            .update({
              amount: formData.cost,
              category: getCategoryFromActivityType(formData.category),
              description: `${formData.title} - Activity cost`,
              date: formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
            })
            .eq('id', existingExpense.id);

          if (updateError) {
            console.error('Error updating expense record:', updateError);
          }
        } else if (!fetchError) {
          // Create new expense record
          const { error: createError } = await supabase
            .from('expenses')
            .insert({
              trip_id: activity.trip_id,
              activity_id: activity.id,
              amount: formData.cost,
              currency: 'USD',
              category: getCategoryFromActivityType(formData.category),
              description: `${formData.title} - Activity cost`,
              date: formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
            });

          if (createError) {
            console.error('Error creating expense record:', createError);
          }
        }
      } else if (data) {
        // If cost is 0 or removed, delete any existing expense record
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('activity_id', activity.id);

        if (deleteError) {
          console.error('Error deleting expense record:', deleteError);
        }
      }
      
      onActivityUpdated(data);
    } catch (error) {
      console.error('Error updating activity:', error);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to map activity categories to expense categories
  function getCategoryFromActivityType(activityCategory: string): 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'other' {
    switch (activityCategory) {
      case 'dining':
        return 'food';
      case 'transport':
        return 'transport';
      case 'accommodation':
        return 'accommodation';
      case 'entertainment':
        return 'entertainment';
      case 'shopping':
        return 'shopping';
      default:
        return 'other';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Activity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Visit Eiffel Tower"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as Activity['category'] }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.emoji}</div>
                    <div className="text-sm font-medium">{category.label}</div>
                  </button>
                ))}
              </div>
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
                placeholder="Describe the activity..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Champ de Mars, Paris"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking URL
              </label>
              <input
                type="url"
                value={formData.booking_url}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_url: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or reminders..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Updating...' : 'Update Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}