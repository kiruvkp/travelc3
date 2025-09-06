import React from 'react';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface StatusPageProps {
  onBack: () => void;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  description: string;
  date: string;
  updates: {
    time: string;
    message: string;
    status: string;
  }[];
}

export default function StatusPage({ onBack }: StatusPageProps) {
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);

  const services: ServiceStatus[] = [
    {
      name: 'Web Application',
      status: 'operational',
      description: 'Main TravelPlanner web application',
      lastChecked: '2 minutes ago'
    },
    {
      name: 'AI Recommendations',
      status: 'operational',
      description: 'AI-powered trip planning and recommendations',
      lastChecked: '1 minute ago'
    },
    {
      name: 'Database',
      status: 'operational',
      description: 'User data and trip storage',
      lastChecked: '30 seconds ago'
    },
    {
      name: 'Authentication',
      status: 'operational',
      description: 'User login and account management',
      lastChecked: '1 minute ago'
    },
    {
      name: 'File Storage',
      status: 'operational',
      description: 'Photo and document storage',
      lastChecked: '2 minutes ago'
    },
    {
      name: 'Email Service',
      status: 'operational',
      description: 'Email notifications and communications',
      lastChecked: '3 minutes ago'
    },
  ];

  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Resolved: Temporary AI Service Slowdown',
      status: 'resolved',
      description: 'Some users experienced slower response times when generating AI recommendations.',
      date: '2024-12-10',
      updates: [
        {
          time: '14:30 UTC',
          message: 'Issue has been resolved. AI recommendations are now responding normally.',
          status: 'resolved'
        },
        {
          time: '14:15 UTC',
          message: 'We have identified the cause and are implementing a fix.',
          status: 'identified'
        },
        {
          time: '14:00 UTC',
          message: 'We are investigating reports of slow AI recommendation response times.',
          status: 'investigating'
        },
      ]
    },
    {
      id: '2',
      title: 'Resolved: Brief Database Connection Issues',
      status: 'resolved',
      description: 'A small number of users experienced difficulty accessing their trips.',
      date: '2024-12-08',
      updates: [
        {
          time: '09:45 UTC',
          message: 'All systems are now operating normally.',
          status: 'resolved'
        },
        {
          time: '09:30 UTC',
          message: 'Database connections have been restored. Monitoring for stability.',
          status: 'monitoring'
        },
        {
          time: '09:15 UTC',
          message: 'We are working to restore database connectivity.',
          status: 'identified'
        },
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'outage':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'outage':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'monitoring':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'identified':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'investigating':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const overallStatus = services.every(service => service.status === 'operational') 
    ? 'All Systems Operational' 
    : services.some(service => service.status === 'outage')
      ? 'Service Disruption'
      : 'Degraded Performance';

  const overallStatusColor = overallStatus === 'All Systems Operational' 
    ? 'text-green-600 dark:text-green-400'
    : overallStatus === 'Service Disruption'
      ? 'text-red-600 dark:text-red-400'
      : 'text-yellow-600 dark:text-yellow-400';

  if (selectedIncident) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setSelectedIncident(null)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Status</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Service status and incidents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIncidentStatusColor(selectedIncident.status)}`}>
                {selectedIncident.status.charAt(0).toUpperCase() + selectedIncident.status.slice(1)}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedIncident.title}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedIncident.description}
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {new Date(selectedIncident.date).toLocaleDateString()}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Incident Timeline</h2>
            <div className="space-y-4">
              {selectedIncident.updates.map((update, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(update.status)}`}>
                      {update.status}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{update.time}</div>
                    <p className="text-gray-700 dark:text-gray-300">{update.message}</p>
                  </div>
                </div>
              ))}
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Status</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service status and uptime</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overall Status */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            {getStatusIcon(overallStatus === 'All Systems Operational' ? 'operational' : 'degraded')}
            <span className={`ml-2 font-semibold ${overallStatusColor}`}>
              {overallStatus}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            System Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Current operational status of all TravelPlanner services
          </p>
        </div>

        {/* Services Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-12">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Service Status</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {services.map((service, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(service.status)}
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-medium ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Checked {service.lastChecked}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">30-day uptime</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.8%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">90-day uptime</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">< 200ms</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average response time</div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Incidents</h2>
          </div>
          
          {incidents.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Incidents</h3>
              <p className="text-gray-600 dark:text-gray-400">All systems have been running smoothly!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getIncidentStatusColor(incident.status)}`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(incident.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {incident.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.description}
                      </p>
                    </div>
                    
                    <ArrowLeftIcon className="h-5 w-5 text-gray-400 transform rotate-180 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Informed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Subscribe to status updates to be notified of any service disruptions or maintenance windows.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you're experiencing issues not listed here, our support team is ready to help.
            </p>
            <button
              onClick={onBack}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Support →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">System Architecture</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn more about our infrastructure and how we ensure reliable service.
            </p>
            <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View Architecture →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}