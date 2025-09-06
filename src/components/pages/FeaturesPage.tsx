import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  SparklesIcon,
  MapPinIcon,
  UsersIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  BoltIcon,
  HeartIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface FeaturesPageProps {
  onBack: () => void;
}

export default function FeaturesPage({ onBack }: FeaturesPageProps) {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Planning',
      description: 'Get personalized itineraries and smart recommendations based on your preferences, travel style, and budget.',
      details: [
        'Intelligent destination suggestions',
        'Personalized activity recommendations',
        'Smart budget optimization',
        'Real-time travel insights'
      ]
    },
    {
      icon: MapPinIcon,
      title: 'Smart Destinations',
      description: 'Discover hidden gems and popular attractions with detailed insights and optimal routing.',
      details: [
        'Curated destination database',
        'Local insider tips',
        'Optimal route planning',
        'Weather-based recommendations'
      ]
    },
    {
      icon: UsersIcon,
      title: 'Collaborative Planning',
      description: 'Plan trips together with friends and family in real-time with shared itineraries and permissions.',
      details: [
        'Real-time collaboration',
        'Role-based permissions',
        'Shared expense tracking',
        'Group decision making'
      ]
    },
    {
      icon: CalendarDaysIcon,
      title: 'Day-by-Day Itineraries',
      description: 'Organize your trip with detailed daily schedules and intuitive drag-and-drop planning.',
      details: [
        'Drag & drop scheduling',
        'Time-based organization',
        'Activity duration tracking',
        'Conflict detection'
      ]
    },
    {
      icon: ChartBarIcon,
      title: 'Budget Tracking',
      description: 'Keep track of expenses and get budget optimization suggestions for your trips.',
      details: [
        'Multi-currency support',
        'Category-based tracking',
        'Budget alerts and warnings',
        'Expense analytics'
      ]
    },
    {
      icon: CameraIcon,
      title: 'Memory Collection',
      description: 'Capture and organize your travel memories with integrated photo galleries.',
      details: [
        'Photo organization',
        'Location tagging',
        'Memory timeline',
        'Shareable galleries'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Private',
      description: 'Your travel data is protected with enterprise-grade security and privacy controls.',
      details: [
        'End-to-end encryption',
        'Privacy controls',
        'Secure data storage',
        'GDPR compliant'
      ]
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Optimized',
      description: 'Access your travel plans anywhere with our responsive design and mobile-first approach.',
      details: [
        'Responsive design',
        'Offline access',
        'Mobile notifications',
        'Touch-friendly interface'
      ]
    },
    {
      icon: CloudIcon,
      title: 'Cloud Sync',
      description: 'Your trips are automatically synced across all your devices with real-time updates.',
      details: [
        'Real-time synchronization',
        'Cross-device access',
        'Automatic backups',
        'Version history'
      ]
    },
    {
      icon: BoltIcon,
      title: 'Lightning Fast',
      description: 'Built with modern technology for blazing fast performance and smooth user experience.',
      details: [
        'Instant loading',
        'Smooth animations',
        'Optimized performance',
        'Progressive web app'
      ]
    },
    {
      icon: HeartIcon,
      title: 'User-Friendly',
      description: 'Intuitive interface designed for travelers of all experience levels.',
      details: [
        'Clean, modern design',
        'Intuitive navigation',
        'Helpful tooltips',
        'Accessibility features'
      ]
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Coverage',
      description: 'Plan trips anywhere in the world with comprehensive destination data and local insights.',
      details: [
        'Worldwide destinations',
        'Local recommendations',
        'Cultural insights',
        'Language support'
      ]
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Features</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discover what makes TravelPlanner special</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Plan Amazing Adventures
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Amazing Trips
              </span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              From AI-powered recommendations to collaborative planning, Globe Go has all the tools 
              to make your adventure planning effortless and enjoyable.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            Start planning your next adventure with AI-powered travel planning.
          </p>
          
          <button
            onClick={onBack}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Planning Free
            <ArrowLeftIcon className="ml-2 h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}