import React from 'react';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface TermsOfServicePageProps {
  onBack: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Terms of Service</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Legal terms and conditions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: December 15, 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using TravelPlanner ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="mb-6">
              TravelPlanner is an AI-powered travel planning application that helps users create itineraries, 
              collaborate with others, track expenses, and discover destinations. The Service includes web-based 
              tools, AI recommendations, and collaborative features.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Creation</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 13 years old to create an account</li>
              <li>One person may not maintain multiple accounts</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Responsibilities</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You are responsible for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Keep your contact information up to date</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload malicious code or attempt to hack the system</li>
              <li>Spam or harass other users</li>
              <li>Use the service for any commercial purpose without permission</li>
              <li>Share inappropriate or offensive content</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Your Content</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You retain ownership of content you create and upload</li>
              <li>You grant us a license to use your content to provide the Service</li>
              <li>You are responsible for ensuring you have rights to any content you upload</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Content</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>TravelPlanner and its content are protected by intellectual property laws</li>
              <li>You may not copy, modify, or distribute our content without permission</li>
              <li>AI-generated recommendations are provided for informational purposes only</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Privacy and Data Protection</h2>
            <p className="mb-6">
              Your privacy is important to us. Our collection and use of personal information is governed by 
              our Privacy Policy, which is incorporated into these Terms by reference.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. AI and Recommendations</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>AI recommendations are suggestions only and not guarantees</li>
              <li>You are responsible for verifying all travel information</li>
              <li>We are not liable for the accuracy of AI-generated content</li>
              <li>Always confirm bookings, prices, and availability independently</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Collaboration Features</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You control who can access your trips through collaboration settings</li>
              <li>Collaborators' actions are subject to the permissions you grant</li>
              <li>You are responsible for managing access to your trips</li>
              <li>Shared content is visible to all trip collaborators</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Disclaimers</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee the accuracy of travel information or recommendations</li>
              <li>You are responsible for verifying all travel details before booking</li>
              <li>We are not a travel agency and do not make bookings on your behalf</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Limitation of Liability</h2>
            <p className="mb-6">
              To the maximum extent permitted by law, TravelPlanner shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to loss of 
              profits, data, or other intangible losses resulting from your use of the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Termination</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You may terminate your account at any time through your account settings</li>
              <li>We may suspend or terminate accounts that violate these Terms</li>
              <li>Upon termination, your right to use the Service ceases immediately</li>
              <li>We will delete your data in accordance with our Privacy Policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to modify these Terms at any time. We will notify users of material 
              changes via email or through the Service. Continued use after changes constitutes acceptance 
              of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              California, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact Information</h2>
            <p className="mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> legal@travelplanner.com<br />
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