import React from 'react';
import { Trip } from '../../lib/supabase';
import { formatCurrency, Currency, convertCurrency } from '../../lib/currency';
import {
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  displayCurrency?: Currency;
  onClick: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
};

export default function TripCard({ trip, displayCurrency, onClick, onDelete }: TripCardProps) {
  const duration = trip.start_date && trip.end_date 
    ? differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    if (onDelete && confirm(`Are you sure you want to delete "${trip.title}"? This action cannot be undone.`)) {
      onDelete(trip);
    }
  };
  return (
    <div
      onClick={() => onClick(trip)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden group"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {trip.cover_image ? (
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <MapPinIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
              <p className="text-lg font-medium opacity-90">{trip.destination || 'New Adventure'}</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
            {statusLabels[trip.status]}
          </span>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Delete Trip"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {trip.title}
            </h3>
            {trip.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-2">
          {trip.destination && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
              {trip.destination}
            </div>
          )}

          {trip.start_date && (
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
              {format(new Date(trip.start_date), 'MMM d, yyyy')}
              {trip.end_date && (
                <>
                  {' - '}
                  {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  {duration && (
                    <span className="ml-2 text-gray-500">({duration} days)</span>
                  )}
                </>
              )}
            </div>
          )}

          {trip.budget > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
              {displayCurrency && displayCurrency !== trip.currency
                ? formatCurrency(
                    convertCurrency(trip.budget, trip.currency as Currency, displayCurrency), 
                    displayCurrency
                  )
                : formatCurrency(trip.budget, trip.currency as Currency)
              } budget
            </div>
          )}

          {trip.is_public && (
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
              Public trip
            </div>
          )}
        </div>

        {/* Activity Count */}
        {trip.activities && trip.activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {trip.activities.length} activities planned
            </p>
          </div>
        )}
      </div>
    </div>
  );
}