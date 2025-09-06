import React from 'react';
import { Activity } from '../../lib/supabase';
import { formatCurrency, Currency } from '../../lib/currency';
import {
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LinkIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ActivityCardProps {
  activity: Activity;
  tripCurrency: Currency;
  onUpdate: () => void;
  onDelete?: () => void;
  onEdit?: (activity: Activity) => void;
}

const categoryIcons = {
  dining: '🍽️',
  attraction: '🎯',
  accommodation: '🏨',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎭',
};

const categoryColors = {
  dining: 'bg-orange-100 text-orange-800 border-orange-200',
  attraction: 'bg-purple-100 text-purple-800 border-purple-200',
  accommodation: 'bg-blue-100 text-blue-800 border-blue-200',
  transport: 'bg-green-100 text-green-800 border-green-200',
  shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  entertainment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function ActivityCard({ activity, tripCurrency, onUpdate, onDelete, onEdit }: ActivityCardProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return null;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[activity.category]}`}>
            <span className="mr-1">{categoryIcons[activity.category]}</span>
            {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
          </div>
          
          {activity.cost > 0 && (
            <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              {tripCurrency ? formatCurrency(activity.cost, tripCurrency) : `$${activity.cost}`}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {(activity.start_time || activity.end_time) && (
            <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTime(activity.start_time)}
              {activity.end_time && formatTime(activity.start_time) !== formatTime(activity.end_time) && 
                ` - ${formatTime(activity.end_time)}`
              }
            </div>
          )}
          
          {/* Action buttons - shown on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <button
              onClick={() => onEdit ? onEdit(activity) : onUpdate()}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="Edit Activity"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete Activity"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {activity.title}
        </h3>
        
        {activity.location && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {activity.location}
          </div>
        )}

        {activity.description && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>

      {(activity.notes || activity.booking_url) && (
        <div className="pt-3 border-t border-gray-100">
          {activity.notes && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{activity.notes}</p>
            </div>
          )}

          {activity.booking_url && (
            <div>
              <a
                href={activity.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Booking Link
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}