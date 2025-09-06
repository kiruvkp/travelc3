import React, { useState } from 'react';
import { ArrowLeftIcon, CodeBracketIcon, KeyIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface APIPageProps {
  onBack: () => void;
}

export default function APIPage({ onBack }: APIPageProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const endpoints = [
    {
      id: 'trips',
      method: 'GET',
      path: '/api/trips',
      title: 'Get User Trips',
      description: 'Retrieve all trips for the authenticated user',
      parameters: [
        { name: 'limit', type: 'integer', description: 'Maximum number of trips to return (default: 50)' },
        { name: 'status', type: 'string', description: 'Filter by trip status (planning, active, completed)' },
      ],
      response: `{
  "trips": [
    {
      "id": "uuid",
      "title": "Summer Adventure in Paris",
      "destination": "Paris, France",
      "start_date": "2024-07-15",
      "end_date": "2024-07-22",
      "budget": 2500.00,
      "currency": "USD",
      "status": "planning",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}`,
      example: `curl -X GET "https://api.travelplanner.com/api/trips" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      id: 'create-trip',
      method: 'POST',
      path: '/api/trips',
      title: 'Create Trip',
      description: 'Create a new trip for the authenticated user',
      parameters: [
        { name: 'title', type: 'string', description: 'Trip title (required)' },
        { name: 'destination', type: 'string', description: 'Trip destination (required)' },
        { name: 'start_date', type: 'string', description: 'Trip start date (ISO 8601 format)' },
        { name: 'end_date', type: 'string', description: 'Trip end date (ISO 8601 format)' },
        { name: 'budget', type: 'number', description: 'Trip budget' },
        { name: 'currency', type: 'string', description: 'Budget currency (default: USD)' },
      ],
      response: `{
  "trip": {
    "id": "uuid",
    "title": "Summer Adventure in Paris",
    "destination": "Paris, France",
    "start_date": "2024-07-15",
    "end_date": "2024-07-22",
    "budget": 2500.00,
    "currency": "USD",
    "status": "planning",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`,
      example: `curl -X POST "https://api.travelplanner.com/api/trips" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Summer Adventure in Paris",
    "destination": "Paris, France",
    "start_date": "2024-07-15",
    "end_date": "2024-07-22",
    "budget": 2500.00,
    "currency": "USD"
  }'`
    },
    {
      id: 'activities',
      method: 'GET',
      path: '/api/trips/{trip_id}/activities',
      title: 'Get Trip Activities',
      description: 'Retrieve all activities for a specific trip',
      parameters: [
        { name: 'trip_id', type: 'string', description: 'Trip ID (required)' },
        { name: 'day', type: 'integer', description: 'Filter by specific day number' },
      ],
      response: `{
  "activities": [
    {
      "id": "uuid",
      "title": "Visit Eiffel Tower",
      "description": "Iconic landmark and symbol of Paris",
      "category": "attraction",
      "location": "Champ de Mars, Paris",
      "start_time": "2024-07-15T09:00:00Z",
      "end_time": "2024-07-15T11:00:00Z",
      "cost": 25.00,
      "day_number": 1,
      "order_index": 0
    }
  ]
}`,
      example: `curl -X GET "https://api.travelplanner.com/api/trips/uuid/activities" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      id: 'ai-recommendations',
      method: 'POST',
      path: '/api/ai/recommendations',
      title: 'Get AI Recommendations',
      description: 'Generate AI-powered travel recommendations',
      parameters: [
        { name: 'destination', type: 'string', description: 'Destination name (required)' },
        { name: 'interests', type: 'array', description: 'Array of user interests' },
        { name: 'budget', type: 'number', description: 'Budget amount' },
        { name: 'days', type: 'integer', description: 'Number of days' },
      ],
      response: `{
  "recommendations": {
    "overview": "Paris is perfect for culture lovers...",
    "attractions": [
      {
        "name": "Louvre Museum",
        "description": "World's largest art museum",
        "estimated_cost": 17.00,
        "recommended_duration": "3-4 hours"
      }
    ],
    "restaurants": [...],
    "tips": [...]
  }
}`,
      example: `curl -X POST "https://api.travelplanner.com/api/ai/recommendations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "destination": "Paris, France",
    "interests": ["culture", "food", "art"],
    "budget": 2500,
    "days": 7
  }'`
    },
  ];

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">API Documentation</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Integrate TravelPlanner into your apps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              TravelPlanner API
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Build amazing travel applications with our powerful API. Access AI recommendations, 
              trip data, and collaboration features programmatically.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <KeyIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
            Getting Started
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authentication</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All API requests require authentication using an API key. Include your API key in the 
                Authorization header of each request.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Base URL</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All API endpoints are relative to the base URL:
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  https://api.travelplanner.com
                </code>
                <button
                  onClick={() => copyToClipboard('https://api.travelplanner.com', 'base-url')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Get Your API Key</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              API keys are available to Pro users. Contact our team to request access to the TravelPlanner API.
            </p>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <CodeBracketIcon className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
              API Endpoints
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="p-6">
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint.id ? null : endpoint.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold mr-4 ${
                        endpoint.method === 'GET' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <div className={`transform transition-transform ${
                      selectedEndpoint === endpoint.id ? 'rotate-180' : ''
                    }`}>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {endpoint.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {endpoint.description}
                    </p>
                  </div>
                </div>

                {selectedEndpoint === endpoint.id && (
                  <div className="mt-6 space-y-6">
                    {/* Parameters */}
                    {endpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {endpoint.parameters.map((param, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                                    {param.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {param.type}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {param.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Example Request */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Example Request</h4>
                      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative">
                        <pre className="text-sm text-green-400 overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(endpoint.example, `example-${endpoint.id}`)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          {copiedCode === `example-${endpoint.id}` ? (
                            <span className="text-green-400 text-xs">Copied!</span>
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Example Response */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Example Response</h4>
                      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative">
                        <pre className="text-sm text-blue-400 overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(endpoint.response, `response-${endpoint.id}`)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          {copiedCode === `response-${endpoint.id}` ? (
                            <span className="text-green-400 text-xs">Copied!</span>
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rate Limits & Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Limits</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-3" />
                  <span><strong>Standard:</strong> 1,000 requests per hour</span>
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mr-3" />
                  <span><strong>AI Endpoints:</strong> 100 requests per hour</span>
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                  <span><strong>Burst:</strong> Up to 50 requests per minute</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-3" />
                  <span>Cache responses when possible</span>
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mr-3" />
                  <span>Handle rate limit responses gracefully</span>
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                  <span>Use webhooks for real-time updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SDKs and Libraries */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SDKs & Libraries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">JS</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">JavaScript SDK</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Official SDK for web and Node.js applications</p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                View Documentation
              </button>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">PY</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Python SDK</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Official SDK for Python applications</p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                View Documentation
              </button>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 dark:text-green-400 font-bold">GO</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Go SDK</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Official SDK for Go applications</p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need API Support?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our developer support team is here to help you integrate with the TravelPlanner API.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBack}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Contact Developer Support
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                Join Developer Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}