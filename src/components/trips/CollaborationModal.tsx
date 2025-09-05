import React, { useState, useEffect } from 'react';
import { supabase, Trip } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  XMarkIcon,
  UserPlusIcon,
  UsersIcon,
  ShareIcon,
  TrashIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface CollaborationModalProps {
  trip: Trip;
  onClose: () => void;
  onTripUpdated?: (trip: Trip) => void;
}

interface Collaborator {
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function CollaborationModal({ trip, onClose, onTripUpdated }: CollaborationModalProps) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCollaborators();
    generateShareUrl();
  }, [trip.id]);

  async function fetchCollaborators() {
    try {
      const { data, error } = await supabase
        .from('trip_collaborators')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('trip_id', trip.id);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateShareUrl() {
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/trip/${trip.id}/shared`);
  }

  async function inviteCollaborator() {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      // First, check if user exists
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim())
        .maybeSingle();

      if (userError || !userProfile) {
        setError(`User with email "${inviteEmail.trim()}" not found. They need to create an account first before they can be invited to collaborate.`);
        setInviteEmail('');
        return;
      }

      // Check if already a collaborator
      const { data: existing } = await supabase
        .from('trip_collaborators')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('user_id', userProfile.id)
        .single();

      if (existing) {
        setError(`${inviteEmail.trim()} is already a collaborator on this trip.`);
        setInviteEmail('');
        return;
      }

      // Add collaborator
      const { error } = await supabase
        .from('trip_collaborators')
        .insert({
          trip_id: trip.id,
          user_id: userProfile.id,
          role: inviteRole,
        });

      if (error) throw error;

      setSuccess(`Successfully invited ${inviteEmail.trim()} as ${inviteRole}!`);
      setInviteEmail('');
      await fetchCollaborators();
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      setError('Failed to invite collaborator. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  async function removeCollaborator(collaboratorUserId: string) {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      const { error } = await supabase
        .from('trip_collaborators')
        .delete()
        .eq('trip_id', trip.id)
        .eq('user_id', collaboratorUserId);

      if (error) throw error;
      setSuccess('Collaborator removed successfully.');
      await fetchCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError('Failed to remove collaborator. Please try again.');
    }
  }

  async function updateCollaboratorRole(collaboratorUserId: string, newRole: 'editor' | 'viewer') {
    try {
      const { error } = await supabase
        .from('trip_collaborators')
        .update({ role: newRole })
        .eq('trip_id', trip.id)
        .eq('user_id', collaboratorUserId);

      if (error) throw error;
      setSuccess('Collaborator role updated successfully.');
      await fetchCollaborators();
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      setError('Failed to update collaborator role. Please try again.');
    }
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }

  async function toggleTripVisibility() {
    try {
      const newVisibility = !trip.is_public;
      const { data, error } = await supabase
        .from('trips')
        .update({ is_public: newVisibility })
        .eq('id', trip.id)
        .select()
        .single();

      if (error) throw error;
      setSuccess(`Trip is now ${newVisibility ? 'public' : 'private'}.`);
      onTripUpdated?.(data);
    } catch (error) {
      console.error('Error updating trip visibility:', error);
      setError('Failed to update trip visibility. Please try again.');
    }
  }

  const isOwner = trip.user_id === user?.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Collaborate on Trip</h2>
              <p className="text-sm text-gray-600">{trip.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Trip Visibility */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ShareIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Trip Visibility</h3>
              </div>
              {isOwner && (
                <button
                  onClick={toggleTripVisibility}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    trip.is_public
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {trip.is_public ? 'Public' : 'Private'}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {trip.is_public
                ? 'This trip is public and can be viewed by anyone with the link.'
                : 'This trip is private and only visible to collaborators.'}
            </p>
            
            {/* Share URL */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={copyShareUrl}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1 inline" />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1 inline" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Collaborators */}
          {isOwner && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Invite Collaborators
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                
                <button
                  onClick={inviteCollaborator}
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {inviting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
              
              {/* Error and Success Messages */}
              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              {success && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-600">{success}</p>
                  <button
                    onClick={() => setSuccess('')}
                    className="mt-2 text-xs text-green-500 hover:text-green-700 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              <div className="mt-2 text-sm text-gray-500">
                <p><strong>Editor:</strong> Can add, edit, and delete activities</p>
                <p><strong>Viewer:</strong> Can only view the trip itinerary</p>
                <p className="mt-2 text-xs text-gray-400">
                  <strong>Note:</strong> Users must have an account before they can be invited to collaborate.
                </p>
              </div>
            </div>
          )}

          {/* Current Collaborators */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Current Collaborators ({collaborators.length + 1})
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-1" />
                      <div className="h-3 bg-gray-300 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Trip Owner */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UsersIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.id === trip.user_id ? 'You' : 'Trip Owner'}
                      </p>
                      <p className="text-sm text-gray-600">Owner</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Owner
                  </span>
                </div>

                {/* Collaborators */}
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.user_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {collaborator.profiles.avatar_url ? (
                        <img
                          src={collaborator.profiles.avatar_url}
                          alt={collaborator.profiles.full_name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <UsersIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {collaborator.profiles.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {collaborator.profiles.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isOwner ? (
                        <>
                          <select
                            value={collaborator.role}
                            onChange={(e) => updateCollaboratorRole(
                              collaborator.user_id,
                              e.target.value as 'editor' | 'viewer'
                            )}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                          </select>
                          
                          <button
                            onClick={() => removeCollaborator(collaborator.user_id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Remove collaborator"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          collaborator.role === 'editor'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {collaborators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No collaborators yet</p>
                    <p className="text-sm">Invite others to collaborate on this trip</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}