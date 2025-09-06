import React, { useState } from 'react';
import { ArrowLeftIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface HelpCenterPageProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  content: string;
}

export default function HelpCenterPage({ onBack }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = ['All', 'Getting Started', 'Trip Planning', 'Collaboration', 'Budget & Expenses', 'Account & Settings'];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my first trip?',
      answer: 'Click the "New Trip" button in the header or on your dashboard. Choose a destination, add trip details like dates and budget, then start adding activities to your itinerary.',
      category: 'Getting Started'
    },
    {
      id: '2',
      question: 'Can I collaborate with others on trip planning?',
      answer: 'Yes! Open any trip and click "Collaborate" to invite others. You can set different permission levels - viewers can see the trip, while editors can make changes.',
      category: 'Collaboration'
    },
    {
      id: '3',
      question: 'How does the AI trip planner work?',
      answer: 'Our AI analyzes your preferences, budget, and destination to generate personalized recommendations. It considers factors like weather, local events, and travel patterns to suggest the best activities.',
      category: 'Trip Planning'
    },
    {
      id: '4',
      question: 'How do I track expenses and split bills?',
      answer: 'Use the Budget Tracker to log individual expenses, or the Bill Splitter for shared costs. The system automatically calculates who owes what and provides settlement suggestions.',
      category: 'Budget & Expenses'
    },
    {
      id: '5',
      question: 'Can I use TravelPlanner offline?',
      answer: 'While TravelPlanner requires an internet connection for AI features and real-time collaboration, you can view your saved trips offline once they\'re loaded.',
      category: 'Getting Started'
    },
    {
      id: '6',
      question: 'How do I change my account settings?',
      answer: 'Click on your profile picture in the top right corner and select "Profile" to update your personal information, preferences, and account settings.',
      category: 'Account & Settings'
    },
    {
      id: '7',
      question: 'What currencies are supported?',
      answer: 'TravelPlanner supports USD, EUR, GBP, JPY, CAD, AUD, and INR. You can set different currencies for different trips and view budget summaries in your preferred currency.',
      category: 'Budget & Expenses'
    },
    {
      id: '8',
      question: 'How do I organize activities by day?',
      answer: 'Activities are automatically organized by day. You can drag and drop activities between days or within a day to reorder them. Each activity can have specific times and durations.',
      category: 'Trip Planning'
    },
  ];

  const guides: GuideItem[] = [
    {
      id: '1',
      title: 'Getting Started with TravelPlanner',
      description: 'Learn the basics of creating trips, adding activities, and using AI recommendations.',
      category: 'Getting Started',
      readTime: '5 min',
      content: 'Complete guide to getting started with TravelPlanner...'
    },
    {
      id: '2',
      title: 'Mastering Collaborative Trip Planning',
      description: 'How to invite collaborators, manage permissions, and plan trips together.',
      category: 'Collaboration',
      readTime: '8 min',
      content: 'Detailed guide on collaborative features...'
    },
    {
      id: '3',
      title: 'Advanced Budget Management',
      description: 'Tips for tracking expenses, splitting bills, and optimizing your travel budget.',
      category: 'Budget & Expenses',
      readTime: '10 min',
      content: 'Comprehensive budget management guide...'
    },
    {
      id: '4',
      title: 'AI Features Deep Dive',
      description: 'Get the most out of our AI-powered recommendations and planning tools.',
      category: 'Trip Planning',
      readTime: '7 min',
      content: 'In-depth look at AI features...'
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedGuide) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setSelectedGuide(null)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Help Center</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guides and documentation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">
            <div className="mb-6">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {selectedGuide.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedGuide.title}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {selectedGuide.description}
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Estimated reading time: {selectedGuide.readTime}
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p>{selectedGuide.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Help Center</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find answers and get support</p>
            </div>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Can We Help?
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto mb-8">
              Find answers to your questions, browse our guides, or get in touch with our support team.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Get help from our support team</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browse Guides</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Step-by-step tutorials and guides</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with other travelers</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      <div className={`transform transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guides */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
              Guides & Tutorials
            </h2>
            
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {guide.description}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {guide.category}
                        </span>
                        <span>{guide.readTime}</span>
                      </div>
                    </div>
                    <BookOpenIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBack}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Contact Support
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}