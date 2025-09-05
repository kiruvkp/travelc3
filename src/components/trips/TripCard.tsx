import {
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';

          {trip.is_public && (
            <div className="flex items-center text-sm text-gray-600">
              <EyeIcon className="h-4 w-4 mr-2 text-gray-400" />
              Public
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
            {trip.is_public ? 'Shareable' : 'Private'}
          </div>

          {/* Show collaboration indicator */}
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Collaborative
            </span>
          </div>
        </div>

        {/* Collaboration Status */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span>Collaborative Trip</span>
            </div>
            {trip.is_public && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <EyeIcon className="h-3 w-3 mr-1" />
                Public
              </span>
            )}
          </div>
        </div>