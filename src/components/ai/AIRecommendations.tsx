import React, { useState } from 'react';
import { openAIService } from '../../lib/openai';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AIRecommendationsProps {
  destination: string;
  interests?: string[];
  budget?: number;
  onRecommendations?: (recommendations: string) => void;
}

export default function AIRecommendations({ 
  destination, 
  interests = [], 
  budget,
  onRecommendations 
}: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function generateRecommendations() {
    if (!openAIService.isConfigured()) {
      setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await openAIService.generateTravelRecommendations(
        destination, 
        interests, 
        budget
      );
      setRecommendations(result);
      onRecommendations?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
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
            AI recommendations require an OpenAI API key. Add VITE_OPENAI_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Travel Recommendations</h3>
        </div>
        
        <button
          onClick={generateRecommendations}
          disabled={loading || !destination}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {recommendations && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-gray-900 mb-2">Recommendations for {destination}</h4>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {recommendations}
          </div>
        </div>
      )}

      {!recommendations && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Get AI Recommendations" to discover personalized travel suggestions for {destination}</p>
        </div>
      )}
    </div>
  );
}