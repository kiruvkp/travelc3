import React, { useState } from 'react';
import { openAIService } from '../../lib/openai';
import { supabase, Activity } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SparklesIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface AIActivityPlannerProps {
  tripId: string;
  destination: string;
  selectedDay: number;
  onActivitiesAdded?: () => void;
  onClose?: () => void;
}

interface CustomerPreferences {
  interests: string[];
  budgetRange: string;
  travelStyle: string;
  groupType: string;
  timePreference: string;
  dietaryRestrictions: string;
  accessibility: string;
  customRequests: string;
}

const interestOptions = [
  { id: 'culture', label: 'Culture & History', emoji: '🏛️' },
  { id: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { id: 'nature', label: 'Nature & Outdoors', emoji: '🌲' },
  { id: 'adventure', label: 'Adventure Sports', emoji: '🏔️' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'nightlife', label: 'Nightlife & Entertainment', emoji: '🎭' },
  { id: 'art', label: 'Art & Museums', emoji: '🎨' },
  { id: 'architecture', label: 'Architecture', emoji: '🏗️' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'wellness', label: 'Wellness & Spa', emoji: '🧘' },
  { id: 'local', label: 'Local Experiences', emoji: '🏘️' },
  { id: 'festivals', label: 'Festivals & Events', emoji: '🎪' },
];

const budgetOptions = [
  { value: 'budget', label: 'Budget-Friendly ($0-50/day)', emoji: '💰' },
  { value: 'moderate', label: 'Moderate ($50-150/day)', emoji: '💳' },
  { value: 'luxury', label: 'Luxury ($150+/day)', emoji: '💎' },
];

const travelStyleOptions = [
  { value: 'relaxed', label: 'Relaxed & Slow', emoji: '🛋️' },
  { value: 'balanced', label: 'Balanced Mix', emoji: '⚖️' },
  { value: 'packed', label: 'Action-Packed', emoji: '⚡' },
];

const groupTypeOptions = [
  { value: 'solo', label: 'Solo Travel', emoji: '🚶' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'family', label: 'Family with Kids', emoji: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends Group', emoji: '👥' },
  { value: 'business', label: 'Business Travel', emoji: '💼' },
];

const timePreferenceOptions = [
  { value: 'morning', label: 'Morning Person', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon Activities', emoji: '☀️' },
  { value: 'evening', label: 'Evening & Night', emoji: '🌙' },
  { value: 'flexible', label: 'Flexible Timing', emoji: '🕐' },
];

export default function AIActivityPlanner({ 
  tripId, 
  destination, 
  selectedDay, 
  onActivitiesAdded, 
  onClose 
}: AIActivityPlannerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedActivities, setGeneratedActivities] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<CustomerPreferences>({
    interests: [],
    budgetRange: 'moderate',
    travelStyle: 'balanced',
    groupType: 'solo',
    timePreference: 'flexible',
    dietaryRestrictions: '',
    accessibility: '',
    customRequests: '',
  });

  async function generateActivities() {
    if (!openAIService.isConfigured()) {
      alert('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    
    try {
      const prompt = `Generate 4-6 personalized activities for Day ${selectedDay} in ${destination} based on these customer preferences:

CUSTOMER PREFERENCES:
- Interests: ${preferences.interests.join(', ')}
- Budget: ${preferences.budgetRange}
- Travel Style: ${preferences.travelStyle}
- Group Type: ${preferences.groupType}
- Time Preference: ${preferences.timePreference}
- Dietary Restrictions: ${preferences.dietaryRestrictions || 'None'}
- Accessibility Needs: ${preferences.accessibility || 'None'}
- Special Requests: ${preferences.customRequests || 'None'}

Please provide activities with realistic timing throughout the day. Format each activity like this:

1. 9:00 AM - Activity Name (Specific Location) - 2 hours - $25 - Brief description of the activity
2. 12:00 PM - Lunch at Restaurant Name (Address) - 1 hour - $15 - Type of cuisine and specialties  
3. 2:30 PM - Next Activity (Location) - 2.5 hours - $30 - What you'll see/do and tips

Make sure to:
- Start activities around 9:00 AM
- Space activities 2-3 hours apart
- Include meal times (breakfast, lunch, dinner)
- End by 8:00 PM
- Use realistic durations (1-3 hours per activity)
- Provide specific times for each activity
- Consider travel time between locations

Alternative JSON format:
[
  {
    "title": "Activity Name",
    "description": "Detailed description of the activity",
    "category": "attraction|dining|shopping|entertainment|transport|accommodation",
    "location": "Specific address or area",
    "startTime": "9:00 AM",
    "duration": "2 hours",
    "cost": 25,
    "tips": "Helpful tips or recommendations",
    "whyRecommended": "Why this fits their preferences"
  }
]

Make sure activities are:
1. Tailored to their specific interests and preferences
2. Within their budget range
3. Appropriate for their group type
4. Scheduled according to their time preferences
5. Include specific locations and practical details
6. Consider dietary restrictions and accessibility needs`;

      const result = await openAIService.generateTravelRecommendations(destination, preferences.interests, 100);
      
      // Try to parse JSON from the result, or create structured data
      let activities;
      try {
        // Look for JSON in the response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          activities = JSON.parse(jsonMatch[0]);
        } else {
          // Parse text response into structured format
          activities = parseTextToActivities(result);
        }
      } catch {
        activities = parseTextToActivities(result);
      }
      
      setGeneratedActivities(activities);
      setStep(2);
    } catch (error) {
      console.error('Error generating activities:', error);
      alert('Failed to generate activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function parseTextToActivities(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim());
    const activities = [];
    let currentActivity: any = {};
    let currentTime = 9; // Start at 9 AM
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^\d+\.|^-|^•/) && trimmed.length > 10) {
        if (currentActivity.title) {
          activities.push(currentActivity);
        }
        
        const title = trimmed.replace(/^\d+\.|^-|^•/, '').trim();
        
        // Generate progressive times throughout the day
        const timeStr = currentTime <= 12 
          ? `${currentTime}:00 AM` 
          : `${currentTime - 12}:00 PM`;
        
        // Increment time by 2-3 hours for next activity
        currentTime += Math.random() > 0.5 ? 2 : 3;
        if (currentTime > 20) currentTime = 20; // Don't go past 8 PM
        
        currentActivity = {
          title: title.split('(')[0].trim(),
          description: trimmed,
          category: determineCategory(title),
          location: extractLocation(trimmed),
          startTime: extractTime(trimmed) || timeStr,
          duration: extractDuration(trimmed) || '2 hours',
          cost: extractCost(trimmed) || 0,
          tips: '',
          whyRecommended: `Matches your interest in ${preferences.interests.join(', ')}`
        };
      } else if (currentActivity.title && trimmed.length > 20) {
        currentActivity.description += ' ' + trimmed;
      }
    }
    
    if (currentActivity.title) {
      activities.push(currentActivity);
    }
    
    return activities.slice(0, 6); // Limit to 6 activities
  }

  function determineCategory(text: string): Activity['category'] {
    const lower = text.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('dining') || lower.includes('cafe')) return 'dining';
    if (lower.includes('shop') || lower.includes('market') || lower.includes('mall')) return 'shopping';
    if (lower.includes('show') || lower.includes('concert') || lower.includes('theater') || lower.includes('club')) return 'entertainment';
    if (lower.includes('hotel') || lower.includes('accommodation')) return 'accommodation';
    if (lower.includes('transport') || lower.includes('taxi') || lower.includes('bus')) return 'transport';
    return 'attraction';
  }

  function extractLocation(text: string): string {
    const locationMatch = text.match(/(?:at|in|near)\s+([^,\n]+)/i);
    return locationMatch ? locationMatch[1].trim() : '';
  }

  function extractTime(text: string): string | null {
    const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(?:AM|PM))/i);
    return timeMatch ? timeMatch[1] : null;
  }

  function extractDuration(text: string): string | null {
    const durationMatch = text.match(/(\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?))/i);
    return durationMatch ? durationMatch[1] : null;
  }

  function extractCost(text: string): number {
    const costMatch = text.match(/\$(\d+(?:\.\d+)?)/);
    return costMatch ? parseFloat(costMatch[1]) : 0;
  }

  async function saveSelectedActivities(selectedActivities: any[]) {
    if (!user || selectedActivities.length === 0) return;
    
    setLoading(true);
    try {
      // Get current order index for the selected day
      const { data: existingActivities, error: fetchError } = await supabase
        .from('activities')
        .select('order_index')
        .eq('trip_id', tripId)
        .eq('day_number', selectedDay)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let nextOrderIndex = existingActivities.length > 0 ? existingActivities[0].order_index + 1 : 0;

      const activitiesToAdd = selectedActivities.map((activity, index) => {
        // Parse time to create proper datetime
        const parseTime = (timeStr: string): string | null => {
          if (!timeStr) return null;
          
          // Enhanced time parsing for various formats
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) ||
                           timeStr.match(/(\d{1,2})\s*(AM|PM)/i) ||
                           timeStr.match(/(\d{1,2}):(\d{2})/);
          
          if (!timeMatch) return null;
          
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2] || '0');
          const ampm = timeMatch[3]?.toUpperCase();
          
          // Convert to 24-hour format
          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          // If no AM/PM specified and hour is less than 8, assume PM (afternoon/evening)
          if (!ampm && hours < 8) hours += 12;
          
          // Create date for the activity (using a base date)
          const activityDate = new Date();
          activityDate.setHours(hours, minutes, 0, 0);
          return activityDate.toISOString();
        };

        const startTime = parseTime(activity.startTime);
        
        // Calculate end time based on duration
        const calculateEndTime = (start: string, durationStr: string): string | null => {
          if (!start || !durationStr) return null;
          
          const durationMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)/i);
          if (!durationMatch) return null;
          
          const durationValue = parseFloat(durationMatch[1]);
          const durationUnit = durationMatch[2].toLowerCase();
          
          let durationInMinutes = durationValue;
          if (durationUnit.includes('hour')) {
            durationInMinutes = durationValue * 60;
          }
          
          const startDate = new Date(start);
          const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);
          return endDate.toISOString();
        };
        
        const endTime = startTime ? calculateEndTime(startTime, activity.duration) : null;

        return {
          trip_id: tripId,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          location: activity.location,
          start_time: startTime,
          end_time: endTime,
          cost: activity.cost || 0,
          day_number: selectedDay,
          order_index: nextOrderIndex + index,
          notes: activity.tips ? `AI Recommendation: ${activity.tips}` : 'Generated by AI based on your preferences'
        };
      });

      const { error } = await supabase
        .from('activities')
        .insert(activitiesToAdd);

      if (error) throw error;

      onActivitiesAdded?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving activities:', error);
      alert('Failed to save activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!openAIService.isConfigured()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">AI Activity Planner</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                AI activity planning requires an OpenAI API key. Add VITE_OPENAI_API_KEY to your environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Activity Planner</h2>
              <p className="text-sm text-gray-600">Day {selectedDay} in {destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Step 1: Preferences */}
        {step === 1 && (
          <div className="p-6">
            <div className="space-y-8">
              {/* Interests */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                  What are you interested in?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => {
                        const newInterests = preferences.interests.includes(interest.id)
                          ? preferences.interests.filter(i => i !== interest.id)
                          : [...preferences.interests, interest.id];
                        setPreferences(prev => ({ ...prev, interests: newInterests }));
                      }}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        preferences.interests.includes(interest.id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{interest.emoji}</div>
                      <div className="text-sm font-medium">{interest.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                  What's your budget range?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {budgetOptions.map((budget) => (
                    <button
                      key={budget.value}
                      onClick={() => setPreferences(prev => ({ ...prev, budgetRange: budget.value }))}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        preferences.budgetRange === budget.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{budget.emoji}</div>
                      <div className="font-medium">{budget.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  What's your travel style?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {travelStyleOptions.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style.value }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        preferences.travelStyle === style.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.emoji}</div>
                      <div className="font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  Who are you traveling with?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupTypeOptions.map((group) => (
                    <button
                      key={group.value}
                      onClick={() => setPreferences(prev => ({ ...prev, groupType: group.value }))}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        preferences.groupType === group.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{group.emoji}</div>
                      <div className="text-sm font-medium">{group.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Preference */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  When do you prefer to be active?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timePreferenceOptions.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => setPreferences(prev => ({ ...prev, timePreference: time.value }))}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        preferences.timePreference === time.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{time.emoji}</div>
                      <div className="text-sm font-medium">{time.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={preferences.dietaryRestrictions}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Vegetarian, Gluten-free, Halal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessibility Needs
                  </label>
                  <input
                    type="text"
                    value={preferences.accessibility}
                    onChange={(e) => setPreferences(prev => ({ ...prev, accessibility: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Wheelchair accessible, No stairs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Preferences
                </label>
                <textarea
                  value={preferences.customRequests}
                  onChange={(e) => setPreferences(prev => ({ ...prev, customRequests: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any specific requests, must-see places, or things to avoid..."
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={generateActivities}
                disabled={loading || preferences.interests.length === 0}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Activities...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Personalized Activities
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generated Activities */}
        {step === 2 && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Personalized Activities for Day {selectedDay}
              </h3>
              <p className="text-gray-600">
                Based on your preferences: {preferences.interests.join(', ')} • {preferences.budgetRange} budget • {preferences.travelStyle} pace
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {generatedActivities.map((activity, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.category}
                        </span>
                        {activity.startTime && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {activity.startTime} • {activity.duration}
                          </span>
                        )}
                        {activity.cost > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ${activity.cost}
                          </span>
                        )}
                      </div>

                      {activity.location && (
                        <p className="text-sm text-gray-600 mb-2">📍 {activity.location}</p>
                      )}

                      {activity.whyRecommended && (
                        <p className="text-sm text-purple-600 italic">💡 {activity.whyRecommended}</p>
                      )}

                      {activity.tips && (
                        <p className="text-sm text-gray-500 mt-2">💭 {activity.tips}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Preferences
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={generateActivities}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Generate New Activities
                </button>
                
                <button
                  onClick={() => saveSelectedActivities(generatedActivities)}
                  disabled={loading || generatedActivities.length === 0}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding to Trip...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Add All to Trip
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}