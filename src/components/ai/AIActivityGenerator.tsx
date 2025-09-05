import React, { useState } from 'react';
import { openAIService } from '../../lib/openai';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AIActivityGeneratorProps {
  destination: string;
  days: number;
  interests?: string[];
  budget?: number;
  onActivitiesGenerated?: (activities: string) => void;
}

export default function AIActivityGenerator({ 
  destination, 
  days,
  interests = [], 
  budget,
  onActivitiesGenerated 
}: AIActivityGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function generateActivities() {
    if (!openAIService.isConfigured()) {
      setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await openAIService.generateActivities(
        destination, 
        days,
        interests, 
        budget
      );
      setActivities(result);
      onActivitiesGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate activities');
    } finally {
      setLoading(false);
    }
  }

  if (!openAIService.isConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            AI activity generation requires an OpenAI API key. Add VITE_OPENAI_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Activity Planner</h3>
        </div>
        
        <button
          onClick={generateActivities}
          disabled={loading || !destination}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate {days}-Day Plan
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {activities && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-2">{days}-Day Activity Plan for {destination}</h4>
          <div className="text-sm text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto">
            {activities}
          </div>
        </div>
      )}

      {!activities && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Generate {days}-Day Plan" to get AI-powered activity suggestions for your trip to {destination}</p>
        </div>
      )}
    </div>
  );
}