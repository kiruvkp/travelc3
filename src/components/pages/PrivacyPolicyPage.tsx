import React from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">How we protect your data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: December 15, 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="mb-6">
              At TravelPlanner, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our travel planning application.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name and email address when you create an account</li>
              <li>Profile information you choose to provide</li>
              <li>Trip details, itineraries, and travel preferences</li>
              <li>Communication preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Usage Information</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>How you interact with our application</li>
              <li>Features you use and time spent in the app</li>
              <li>Device information and browser type</li>
              <li>IP address and general location data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Provide and improve our travel planning services</li>
              <li>Generate personalized AI recommendations</li>
              <li>Enable collaboration features with other users</li>
              <li>Send important updates about your account or trips</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information Sharing</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Trip collaborators:</strong> Information you choose to share in collaborative trips</li>
              <li><strong>Service providers:</strong> Trusted partners who help us operate our service</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security</h2>
            <p className="mb-6">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure data transmission using HTTPS</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Data backup and recovery procedures</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <p className="mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies and Tracking</h2>
            <p className="mb-6">
              We use cookies and similar technologies to enhance your experience, remember your preferences, 
              and analyze how our service is used. You can control cookie settings through your browser.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Retention</h2>
            <p className="mb-6">
              We retain your information for as long as your account is active or as needed to provide services. 
              When you delete your account, we will delete your personal information within 30 days, except where 
              we are required to retain it for legal purposes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">International Transfers</h2>
            <p className="mb-6">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information during such transfers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
            <p className="mb-6">
              Our service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> privacy@travelplanner.com<br />
                <strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}