import React from 'react';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface CareersPageProps {
  onBack: () => void;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

export default function CareersPage({ onBack }: CareersPageProps) {
  const [selectedJob, setSelectedJob] = React.useState<JobPosting | null>(null);

  const jobPostings: JobPosting[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      description: 'Join our engineering team to build the next generation of travel planning tools. You\'ll work on our React-based frontend, implementing new features and improving user experience.',
      requirements: [
        '5+ years of React and TypeScript experience',
        'Experience with modern frontend tools (Vite, Tailwind CSS)',
        'Strong understanding of responsive design',
        'Experience with real-time applications',
        'Passion for travel and user experience'
      ],
      benefits: [
        'Competitive salary and equity',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Professional development budget'
      ]
    },
    {
      id: '2',
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote / New York',
      type: 'Full-time',
      description: 'Help us build intelligent travel recommendations using machine learning and AI. You\'ll work on our recommendation engine and natural language processing features.',
      requirements: [
        'PhD or Masters in Computer Science, AI, or related field',
        'Experience with Python, TensorFlow, or PyTorch',
        'Knowledge of NLP and recommendation systems',
        'Experience with cloud platforms (AWS, GCP)',
        'Interest in travel and user behavior'
      ],
      benefits: [
        'Competitive salary and equity',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Conference and learning budget'
      ]
    },
    {
      id: '3',
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote / Los Angeles',
      type: 'Full-time',
      description: 'Shape the future of travel planning by designing intuitive, beautiful experiences. You\'ll work closely with our product and engineering teams to create user-centered designs.',
      requirements: [
        '4+ years of product design experience',
        'Proficiency in Figma and design systems',
        'Experience with user research and testing',
        'Strong portfolio of web and mobile designs',
        'Understanding of accessibility principles'
      ],
      benefits: [
        'Competitive salary and equity',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Design tools and equipment budget'
      ]
    },
    {
      id: '4',
      title: 'Travel Content Specialist',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create compelling travel content and destination guides. You\'ll research destinations, write travel guides, and help curate our destination database.',
      requirements: [
        'Extensive travel experience and knowledge',
        'Excellent writing and research skills',
        'Experience with content management systems',
        'Knowledge of SEO best practices',
        'Fluency in multiple languages (preferred)'
      ],
      benefits: [
        'Competitive salary',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Travel research opportunities'
      ]
    },
    {
      id: '5',
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote / Austin',
      type: 'Full-time',
      description: 'Help our users get the most out of TravelPlanner. You\'ll provide support, gather feedback, and work with our product team to improve the user experience.',
      requirements: [
        '3+ years in customer success or support',
        'Excellent communication skills',
        'Experience with SaaS products',
        'Problem-solving mindset',
        'Passion for helping others'
      ],
      benefits: [
        'Competitive salary and equity',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Professional development opportunities'
      ]
    },
    {
      id: '6',
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote / Chicago',
      type: 'Full-time',
      description: 'Drive growth and brand awareness for TravelPlanner. You\'ll develop marketing strategies, create campaigns, and build our community of travelers.',
      requirements: [
        '4+ years of digital marketing experience',
        'Experience with growth marketing',
        'Knowledge of social media and content marketing',
        'Data-driven approach to marketing',
        'Travel industry experience (preferred)'
      ],
      benefits: [
        'Competitive salary and equity',
        'Unlimited PTO and travel stipend',
        'Remote-first culture',
        'Health, dental, and vision insurance',
        'Marketing tools and conference budget'
      ]
    },
  ];

  const departments = ['All', 'Engineering', 'Design', 'Content', 'Customer Success', 'Marketing'];
  const [selectedDepartment, setSelectedDepartment] = React.useState('All');

  const filteredJobs = selectedDepartment === 'All' 
    ? jobPostings 
    : jobPostings.filter(job => job.department === selectedDepartment);

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setSelectedJob(null)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Careers</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Join our team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {selectedJob.department}
                </span>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {selectedJob.type}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedJob.title}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h3>
                <ul className="space-y-3">
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ready to Apply?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send us your resume and a cover letter explaining why you're excited about this role.
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Apply Now
              </button>
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Careers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join our team</p>
            </div>
          </div>
        </div>
      </div>

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Careers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join our team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Journey
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Help us revolutionize travel planning and make amazing experiences accessible to everyone.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company Culture */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remote-First</h3>
              <p className="text-gray-600 dark:text-gray-400">Work from anywhere in the world with flexible hours and unlimited PTO.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✈️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Travel Perks</h3>
              <p className="text-gray-600 dark:text-gray-400">Annual travel stipend and company retreats in amazing destinations.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Growth</h3>
              <p className="text-gray-600 dark:text-gray-400">Continuous learning opportunities and career development support.</p>
            </div>
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDepartment === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {job.department}
                    </span>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                  </div>
                </div>
                <BriefcaseIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {job.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {job.requirements.length} requirements
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No openings in {selectedDepartment}</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later or view all departments for available positions.</p>
          </div>
        )}

        {/* Application Process */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Our Hiring Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Application</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Submit your resume and cover letter</p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Screen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">30-minute call with our team</p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Interview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills assessment and team fit</p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Final Interview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Meet the team and discuss the role</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}