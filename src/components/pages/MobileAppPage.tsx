import React from 'react';
import { ArrowLeftIcon, DevicePhoneMobileIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

interface MobileAppPageProps {
  onBack: () => void;
}

export default function MobileAppPage({ onBack }: MobileAppPageProps) {
  const features = [
    {
      title: 'Offline Access',
      description: 'View your trips and itineraries even without internet connection',
      icon: '📱'
    },
    {
      title: 'Push Notifications',
      description: 'Get reminders for activities, flight updates, and collaboration alerts',
      icon: '🔔'
    },
    {
      title: 'Location Services',
      description: 'GPS navigation to activities and automatic check-ins',
      icon: '📍'
    },
    {
      title: 'Camera Integration',
      description: 'Capture and organize travel photos directly in your trips',
      icon: '📸'
    },
    {
      title: 'Quick Actions',
      description: 'Add expenses, update activities, and share updates on the go',
      icon: '⚡'
    },
    {
      title: 'Sync Across Devices',
      description: 'Seamless synchronization between mobile and web versions',
      icon: '🔄'
    },
  ];

  const screenshots = [
    {
      title: 'Trip Dashboard',
      image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=300&h=600&fit=crop',
      description: 'View all your trips at a glance'
    },
    {
      title: 'Daily Itinerary',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=300&h=600&fit=crop',
      description: 'Detailed day-by-day planning'
    },
    {
      title: 'AI Recommendations',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300&h=600&fit=crop',
      description: 'Smart suggestions powered by AI'
    },
  ];

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mobile App</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Travel planning on the go</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Globe Go
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Mobile App
                </span>
              </h1>
              <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
                Take your adventure plans with you wherever you go. Plan, organize, and navigate 
                your trips with our powerful mobile application.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200">
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Download for iOS
                </button>
                <button className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200">
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Download for Android
                </button>
              </div>
              
              <div className="mt-6 text-sm text-blue-100 dark:text-blue-200">
                Coming soon to App Store and Google Play
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400&h=800&fit=crop"
                  alt="Mobile App Preview"
                  className="rounded-3xl shadow-2xl mx-auto"
                  style={{ maxWidth: '300px' }}
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3 z-20">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Trip Synced</p>
                    <p className="text-xs text-gray-500">All devices updated</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-3 z-20">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Near Activity</p>
                    <p className="text-xs text-gray-500">0.2 miles away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mobile-First Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Designed specifically for mobile use with features that make travel planning and navigation effortless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              See It in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get a preview of the mobile experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <img
                    src={screenshot.image}
                    alt={screenshot.title}
                    className="rounded-2xl shadow-lg mx-auto"
                    style={{ maxWidth: '250px', height: '500px', objectFit: 'cover' }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {screenshot.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {screenshot.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 border border-blue-200 dark:border-blue-800">
            <DevicePhoneMobileIcon className="h-16 w-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              We're putting the finishing touches on our mobile apps. Sign up to be notified 
              when they're available for download.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Notify Me
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expected release: Q2 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}