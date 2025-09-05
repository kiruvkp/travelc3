import React, { useState } from 'react';
import { openAIService } from '../../lib/openai';
import { SparklesIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface AINotesGeneratorProps {
  tripTitle: string;
  destination: string;
  activities?: string[];
  onNotesGenerated?: (notes: string) => void;
}

export default function AINotesGenerator({ 
  tripTitle,
  destination, 
  activities = [],
  onNotesGenerated 
}: AINotesGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function generateNotes() {
    if (!openAIService.isConfigured()) {
      setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await openAIService.generateNotes(
        tripTitle,
        destination, 
        activities
      );
      setNotes(result);
      onNotesGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
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
            AI notes generation requires an OpenAI API key. Add VITE_OPENAI_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Travel Notes</h3>
        </div>
        
        <button
          onClick={generateNotes}
          disabled={loading || !destination}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Travel Notes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {notes && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-gray-900 mb-2">Travel Notes for {tripTitle}</h4>
          <div className="text-sm text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto">
            {notes}
          </div>
        </div>
      )}

      {!notes && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Generate Travel Notes" to get AI-powered travel tips and important information for {destination}</p>
        </div>
      )}
    </div>
  );
}