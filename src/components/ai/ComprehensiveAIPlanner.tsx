import React, { useState } from 'react';
import { openAIService } from '../../lib/openai';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import ErrorToast from '../common/ErrorToast';
import { supabase, TripNote, Activity } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SparklesIcon, 
  ExclamationTriangleIcon, 
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ComprehensiveAIPlannerProps {
  tripId: string;
  tripTitle: string;
  destination: string;
  days: number;
  interests?: string[];
  budget?: number;
  onActivitiesAdded?: () => void;
}

interface DayPlan {
  day: number;
  date?: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    duration: string;
    cost?: string;
    description: string;
  }[];
}

export default function ComprehensiveAIPlanner({ 
  tripId,
  tripTitle,
  destination, 
  days,
  interests = [], 
  budget
}: ComprehensiveAIPlannerProps) {
  const { user } = useAuth();
  const { error: globalError, setError: setGlobalError, clearError, handleAsyncError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [activitiesSaved, setActivitiesSaved] = useState(false);

  async function saveActivitiesToDatabase(itineraryData: DayPlan[]) {
    if (!user || itineraryData.length === 0) return;
    
    try {
      const activitiesToAdd = [];
      
      for (const dayPlan of itineraryData) {
        for (let i = 0; i < dayPlan.activities.length; i++) {
          const activity = dayPlan.activities[i];
          
          // Determine category based on activity content
          const getCategory = (activityText: string): Activity['category'] => {
            const text = activityText.toLowerCase();
            if (text.includes('restaurant') || text.includes('lunch') || text.includes('dinner') || text.includes('breakfast') || text.includes('cafe') || text.includes('food')) return 'dining';
            if (text.includes('hotel') || text.includes('accommodation') || text.includes('stay') || text.includes('check-in')) return 'accommodation';
            if (text.includes('transport') || text.includes('taxi') || text.includes('bus') || text.includes('train') || text.includes('flight')) return 'transport';
            if (text.includes('shop') || text.includes('market') || text.includes('mall') || text.includes('store')) return 'shopping';
            if (text.includes('show') || text.includes('concert') || text.includes('theater') || text.includes('entertainment')) return 'entertainment';
            return 'attraction';
          };
          
          // Parse cost from activity text
          const parseCost = (text: string): number => {
            const costMatch = text.match(/\$(\d+(?:\.\d+)?)/);
            return costMatch ? parseFloat(costMatch[1]) : 0;
          };
          
          // Parse time and create datetime
          const parseDateTime = (timeStr: string): string | null => {
            if (!timeStr) return null;
            
            // Match various time formats: 9:00 AM, 09:00, 14:30, etc.
            const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i) || 
                             timeStr.match(/(\d{1,2})\s*(AM|PM)/i);
            
            if (!timeMatch) return null;
            
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2] || '0');
            const ampm = timeMatch[3]?.toUpperCase();
            
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            // Create a proper datetime for today (will be used for time display)
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() + dayPlan.day - 1);
            baseDate.setHours(hours, minutes, 0, 0);
            
            return baseDate.toISOString();
          };
          
          // Calculate end time based on duration
          const calculateEndTime = (startTime: string, duration: string): string | null => {
            if (!startTime || !duration) return null;
            
            const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/i);
            if (!durationMatch) return null;
            
            const durationValue = parseFloat(durationMatch[1]);
            const durationUnit = durationMatch[2].toLowerCase();
            
            let durationInMinutes = durationValue;
            if (durationUnit.includes('hour')) {
              durationInMinutes = durationValue * 60;
            }
            
            const start = new Date(startTime);
            
            const end = new Date(start.getTime() + durationInMinutes * 60000);
            return end.toISOString();
          };
          
          const startTime = parseDateTime(activity.time);
          const endTime = startTime ? calculateEndTime(startTime, activity.duration) : null;
          
          activitiesToAdd.push({
            trip_id: tripId,
            title: activity.activity,
            description: activity.description,
            category: getCategory(activity.activity + ' ' + activity.description),
            location: activity.location,
            start_time: startTime,
            end_time: endTime,
            cost: parseCost(activity.description),
            day_number: dayPlan.day,
            order_index: i,
            notes: `Generated by AI - ${activity.duration}${activity.cost ? ` - ${activity.cost}` : ''}`
          });
        }
      }
      
      if (activitiesToAdd.length > 0) {
        const { error } = await supabase
          .from('activities')
          .insert(activitiesToAdd);
        
        if (error) throw error;
        
        // Create corresponding expense records for activities with costs
        const expensesToAdd = activitiesToAdd
          .filter(activity => activity.cost && activity.cost > 0)
          .map(activity => ({
            trip_id: tripId,
            activity_id: null, // Will be updated after we get the activity IDs
            amount: activity.cost,
            currency: 'USD', // Default currency, should be from trip
            category: getCategoryFromActivityType(activity.category),
            description: `${activity.title} - Activity cost`,
            date: activity.start_time ? activity.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
          }));

        if (expensesToAdd.length > 0) {
          // Get the created activities to link expenses
          const { data: createdActivities, error: fetchError } = await supabase
            .from('activities')
            .select('id, title, cost')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: false })
            .limit(activitiesToAdd.length);

          if (!fetchError && createdActivities) {
            const expensesWithActivityIds = expensesToAdd.map((expense, index) => ({
              ...expense,
              activity_id: createdActivities[index]?.id || null,
            }));

            const { error: expenseError } = await supabase
              .from('expenses')
              .insert(expensesWithActivityIds);

            if (expenseError) {
              console.error('Error creating expense records:', expenseError);
            }
          }
        }
        
        // Mark activities as saved
        setActivitiesSaved(true);
        
        // Refresh activities in parent component
        onActivitiesAdded?.();
      }
    } catch (error) {
      console.error('Error adding activities to trip:', error);
      setError('Failed to add activities to trip. Please try again.');
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

  async function generateComprehensivePlan() {
    if (!openAIService.isConfigured()) {
      setGlobalError(new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.'));
      return;
    }

    setLoading(true);
    clearError();
    
    const result = await handleAsyncError(
      openAIService.generateComprehensivePlan(
        destination, 
        days,
        interests, 
        budget
      )
    );
    
    if (result) {
      
      // Parse the result to extract structured data
      const parsed = parseItinerary(result);
      setItinerary(parsed.itinerary);
      setRecommendations(parsed.recommendations);
      
      // Automatically save activities to database
      if (parsed.itinerary.length > 0) {
        // Reset saved state when generating new plan
        setActivitiesSaved(false);
      }
      
      // Load existing user notes
      await loadUserNotes();
    }
    setLoading(false);
  }

  function parseItinerary(aiResponse: string): { itinerary: DayPlan[], recommendations: string } {
    const lines = aiResponse.split('\n');
    const itinerary: DayPlan[] = [];
    let recommendations = '';
    let currentDay: DayPlan | null = null;
    let inRecommendations = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for recommendations section
      if (trimmedLine.toLowerCase().includes('recommendations') || 
          trimmedLine.toLowerCase().includes('tips') ||
          trimmedLine.toLowerCase().includes('overview')) {
        inRecommendations = true;
        continue;
      }

      if (inRecommendations) {
        recommendations += line + '\n';
        continue;
      }

      // Check for day headers
      const dayMatch = trimmedLine.match(/^Day (\d+)/i);
      if (dayMatch) {
        if (currentDay) {
          itinerary.push(currentDay);
        }
        currentDay = {
          day: parseInt(dayMatch[1]),
          activities: []
        };
        continue;
      }

      // Parse activities
      if (currentDay && trimmedLine.startsWith('-') || trimmedLine.match(/^\d+\./)) {
        const activityText = trimmedLine.replace(/^[-\d.]\s*/, '');
        
        // Enhanced time matching for various formats
        const timeMatch = activityText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i) ||
                         activityText.match(/(\d{1,2}\s*(?:AM|PM))/i) ||
                         activityText.match(/^(\d{1,2}:\d{2})/);
        
        const locationMatch = activityText.match(/\(([^)]+)\)/);
        const durationMatch = activityText.match(/(\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?))/i);
        const costMatch = activityText.match(/\$(\d+(?:\.\d+)?)/);

        const activity = {
          time: timeMatch ? timeMatch[1] : '',
          activity: activityText.split('(')[0].split('-')[0].replace(/^\d{1,2}:\d{2}\s*(?:AM|PM)?\s*-?\s*/i, '').trim(),
          location: locationMatch ? locationMatch[1] : '',
          duration: durationMatch ? durationMatch[1] : '',
          cost: costMatch ? `$${costMatch[1]}` : '',
          description: activityText
        };

        currentDay.activities.push(activity);
      }
    }

    if (currentDay) {
      itinerary.push(currentDay);
    }

    return { itinerary, recommendations: recommendations.trim() };
  }

  async function loadUserNotes() {
    try {
      const { data, error } = await supabase
        .from('trip_notes')
        .select('content')
        .eq('trip_id', tripId)
        .eq('user_id', user?.id)
        .eq('title', 'Personal Notes')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserNotes(data?.content || '');
    } catch (error) {
      console.error('Error loading user notes:', error);
    }
  }

  async function saveUserNotes() {
    if (!user) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('trip_notes')
        .upsert({
          trip_id: tripId,
          user_id: user.id,
          title: 'Personal Notes',
          content: userNotes
        }, {
          onConflict: 'trip_id,user_id,title'
        });

      if (error) throw error;
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving user notes:', error);
    } finally {
      setSavingNotes(false);
    }
  }

  if (!openAIService.isConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            AI trip planning requires an OpenAI API key. Add VITE_OPENAI_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary componentName="AI Planner">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">AI Trip Planner</h3>
            <p className="text-sm text-gray-600">Complete {days}-day itinerary with recommendations</p>
          </div>
        </div>
        
        <button
          onClick={generateComprehensivePlan}
          disabled={loading || !destination}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Plan...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Complete Plan
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {(itinerary.length > 0 || recommendations) && (
        <div className="space-y-8">
          {/* Recommendations Overview */}
          {recommendations && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                Travel Overview & Recommendations
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {recommendations}
              </div>
            </div>
          )}

          {/* Day-by-Day Itinerary */}
          {itinerary.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                {days}-Day Detailed Itinerary
              </h4>
              
              {/* Save to Itinerary Button */}
              <div className={`mb-6 p-4 rounded-lg border ${
                activitiesSaved 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium mb-1 ${
                      activitiesSaved ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      {activitiesSaved ? 'Activities saved to your trip!' : 'Ready to add to your trip?'}
                    </h5>
                    <p className={`text-sm ${
                      activitiesSaved ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {activitiesSaved 
                        ? `All ${itinerary.reduce((total, day) => total + day.activities.length, 0)} activities have been added to your trip itinerary`
                        : `Save all ${itinerary.reduce((total, day) => total + day.activities.length, 0)} activities to your trip itinerary`
                      }
                    </p>
                  </div>
                  {!activitiesSaved ? (
                    <button
                      onClick={() => saveActivitiesToDatabase(itinerary)}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Save to Trip Itinerary
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg">
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Saved Successfully
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {dayPlan.day}
                      </div>
                      Day {dayPlan.day}
                      {dayPlan.date && <span className="text-gray-500 ml-2">- {dayPlan.date}</span>}
                    </h5>
                    
                    <div className="space-y-4">
                      {dayPlan.activities.map((activity, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                {activity.time && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                                    {activity.time}
                                  </span>
                                )}
                                {activity.duration && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                                    {activity.duration}
                                  </span>
                                )}
                                {activity.cost && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {activity.cost}
                                  </span>
                                )}
                              </div>
                              
                              <h6 className="font-semibold text-gray-900 mb-1">{activity.activity}</h6>
                              
                              {activity.location && (
                                <p className="text-sm text-gray-600 mb-2">📍 {activity.location}</p>
                              )}
                              
                              <p className="text-sm text-gray-700">{activity.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Notes Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <PencilIcon className="h-5 w-5 text-gray-600 mr-2" />
                Personal Notes
              </h4>
              
              {!editingNotes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Notes
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveUserNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {savingNotes ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    ) : (
                      <CheckIcon className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      loadUserNotes();
                    }}
                    className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {editingNotes ? (
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={8}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add your personal notes, thoughts, or modifications to the itinerary..."
              />
            ) : (
              <div className="min-h-[100px] p-3 bg-white rounded-lg border border-gray-200">
                {userNotes ? (
                  <p className="text-gray-700 whitespace-pre-line">{userNotes}</p>
                ) : (
                  <p className="text-gray-500 italic">Click "Edit Notes" to add your personal notes and thoughts about this trip...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!itinerary.length && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Plan Your Perfect Trip?</h4>
          <p className="mb-4">
            Get a comprehensive {days}-day itinerary for {destination} with:
          </p>
          <ul className="text-sm text-left max-w-md mx-auto space-y-1 mb-6">
            <li>• Detailed daily schedules with timing</li>
            <li>• Specific locations and activities</li>
            <li>• Cost estimates and duration</li>
            <li>• Local recommendations and tips</li>
            <li>• Personal notes section for your thoughts</li>
          </ul>
          <p className="text-gray-400">Click "Generate Complete Plan" to get started!</p>
        </div>
      )}
      
      {/* Error Toast */}
      <ErrorToast
        message={globalError?.message || error}
        type="error"
        isVisible={!!(globalError || error)}
        onClose={() => {
          clearError();
          setError('');
        }}
      />
    </div>
    </ComponentErrorBoundary>
  );
}