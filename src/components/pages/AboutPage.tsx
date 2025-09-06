import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  SparklesIcon,
  HeartIcon,
  GlobeAltIcon,
  UsersIcon,
  LightBulbIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Former travel blogger turned tech entrepreneur. Passionate about making travel planning accessible to everyone.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'AI and machine learning expert with 10+ years in travel technology. Loves building products that solve real problems.'
    },
    {
      name: 'Emma Thompson',
      role: 'Head of Product',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'UX designer and travel enthusiast. Focused on creating intuitive experiences that delight users.'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Full-stack developer with expertise in React and AI integration. Committed to building scalable, reliable software.'
    },
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'User-Centric',
      description: 'Every feature we build starts with understanding what travelers really need.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Perspective',
      description: 'We celebrate diversity and aim to make travel accessible to people from all backgrounds.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to solve age-old travel planning challenges.'
    },
    {
      icon: UsersIcon,
      title: 'Community',
      description: 'Travel is better when shared. We build tools that bring people together.'
    },
  ];

  const milestones = [
    {
      year: '2023',
      title: 'The Beginning',
      description: 'Founded by travel enthusiasts who were frustrated with existing planning tools.'
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Launched our AI-powered recommendation engine, revolutionizing trip planning.'
    },
    {
      year: '2024',
      title: 'Collaborative Features',
      description: 'Introduced real-time collaboration and bill splitting features.'
    },
    {
      year: '2025',
      title: 'Global Expansion',
      description: 'Expanding to serve travelers worldwide with localized experiences.'
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">About Us</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Learn about our mission and team</p>
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
              Making Travel Planning
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Simple & Enjoyable
              </span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              We believe that planning a trip should be as exciting as the trip itself. 
              That's why we created TravelPlanner - to turn the complexity of travel planning 
              into a delightful, collaborative experience.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Empowering Every Traveler
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to democratize adventure planning by combining the power of artificial intelligence 
            with human creativity and collaboration. Whether you're planning a weekend getaway or a month-long 
            adventure, Globe Go helps you create unforgettable experiences with less stress and more joy.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
              <p className="mb-6">
                Globe Go was born from a simple frustration: planning trips was too complicated, 
                time-consuming, and stressful. Our founders, avid travelers themselves, spent countless 
                hours researching destinations, comparing prices, and coordinating with travel companions 
                using scattered tools and endless spreadsheets.
              </p>
              <p className="mb-6">
                We realized that while technology had transformed how we book flights and hotels, 
                the actual planning process remained largely unchanged. That's when we decided to 
                build something better - a platform that would harness the power of AI to make 
                travel planning intelligent, collaborative, and fun.
              </p>
              <p>
                Today, Globe Go serves thousands of travelers worldwide, helping them create 
                personalized itineraries, collaborate with friends and family, and discover amazing 
                destinations they might never have found otherwise. We're just getting started on 
                our mission to transform how the world plans travel.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white dark:border-gray-900"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-32 w-32 rounded-full object-cover mx-auto shadow-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-200"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <RocketLaunchIcon className="h-16 w-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Learn More?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, 
              our team is always excited to connect with fellow travelers.
            </p>
            <button
              onClick={onBack}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Today
              <ArrowLeftIcon className="ml-2 h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}