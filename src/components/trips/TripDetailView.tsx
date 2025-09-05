import React, { useState, useEffect } from 'react';
import { Trip, Activity, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, Currency } from '../../lib/currency';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  Bars3Icon,
  SparklesIcon,
  UsersIcon,
  ChartBarIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import ActivityCard from './ActivityCard';
import AddActivityModal from './AddActivityModal';
import EditActivityModal from './EditActivityModal';
import CollaborationModal from './CollaborationModal';
import ComprehensiveAIPlanner from '../ai/ComprehensiveAIPlanner';
import EditTripModal from './EditTripModal';
import AIActivityPlanner from '../ai/AIActivityPlanner';
import BudgetTracker from './BudgetTracker';
import BillSplitter from './BillSplitter';

interface TripDetailViewProps {
  trip: Trip;
  onBack: () => void;
  onTripUpdated?: (trip: Trip) => void;
}

export default function TripDetailView({ trip, onBack, onTripUpdated }: TripDetailViewProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [showAIActivityPlanner, setShowAIActivityPlanner] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showBudgetTracker, setShowBudgetTracker] = useState(false);
  const [showBillSplitter, setShowBillSplitter] = useState(false);
  const [showEditActivity, setShowEditActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);

  useEffect(() => {
    fetchActivities();
  }, [currentTrip.id]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', currentTrip.id)
        .order('day_number')
        .order('order_index');

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Parse day numbers from droppableId
    const sourceDay = parseInt(source.droppableId.replace('day-', ''));
    const destDay = parseInt(destination.droppableId.replace('day-', ''));
    
    const newActivities = [...activities];
    
    // Find the dragged activity
    const draggedActivity = newActivities.find(
      (activity, index) => 
        activity.day_number === sourceDay && 
        newActivities.filter(a => a.day_number === sourceDay).indexOf(activity) === source.index
    );
    
    if (!draggedActivity) return;

    // Remove from source
    const sourceActivities = newActivities.filter(a => a.day_number === sourceDay);
    sourceActivities.splice(source.index, 1);
    
    // Update order_index for remaining source activities
    sourceActivities.forEach((activity, index) => {
      activity.order_index = index;
    });

    // Add to destination
    const destActivities = newActivities.filter(a => a.day_number === destDay);
    draggedActivity.day_number = destDay;
    destActivities.splice(destination.index, 0, draggedActivity);
    
    // Update order_index for destination activities
    destActivities.forEach((activity, index) => {
      activity.order_index = index;
    });

    // Combine all activities
    const otherDayActivities = newActivities.filter(a => a.day_number !== sourceDay && a.day_number !== destDay);
    const updatedActivities = [...otherDayActivities, ...sourceActivities, ...destActivities];
    
    setActivities(updatedActivities);

    // Update database
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          day_number: draggedActivity.day_number,
          order_index: draggedActivity.order_index
        })
        .eq('id', draggedActivity.id);

      if (error) throw error;

      // Update order for other affected activities
      const activitiesToUpdate = [
        ...sourceActivities.map(a => ({ id: a.id, order_index: a.order_index })),
        ...destActivities.filter(a => a.id !== draggedActivity.id).map(a => ({ id: a.id, order_index: a.order_index }))
      ];

      for (const update of activitiesToUpdate) {
        await supabase
          .from('activities')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating activity order:', error);
      // Revert on error
      fetchActivities();
    }
  }

  async function deleteActivity(activityId: string) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  }

  async function clearAllActivities() {
    if (!confirm('Are you sure you want to clear all activities? This cannot be undone.')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('trip_id', currentTrip.id);

      if (error) throw error;
      setActivities([]);
    } catch (error) {
      console.error('Error clearing activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivityAdded(activity: Activity) {
    setActivities(prev => {
      const newActivities = [...prev, activity];
      return newActivities.sort((a, b) => {
        if (a.day_number !== b.day_number) {
          return a.day_number - b.day_number;
        }
        return a.order_index - b.order_index;
      });
    });
    setShowAddActivity(false);
    
    // Refresh activities to get the latest data including any expense records
    await fetchActivities();
  }

  function handleEditActivity(activity: Activity) {
    setEditingActivity(activity);
    setShowEditActivity(true);
  }

  function handleActivityUpdated(updatedActivity: Activity) {
    setActivities(prev => {
      const newActivities = prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      );
      return newActivities.sort((a, b) => {
        if (a.day_number !== b.day_number) {
          return a.day_number - b.day_number;
        }
        return a.order_index - b.order_index;
      });
    });
    setShowEditActivity(false);
    setEditingActivity(null);
  }

  function handleTripUpdated(updatedTrip: Trip) {
    setCurrentTrip(updatedTrip);
    onTripUpdated?.(updatedTrip);
    setShowEditTrip(false);
  }

  const getDaysArray = () => {
    if (!currentTrip.start_date || !currentTrip.end_date) return [1];
    const start = new Date(currentTrip.start_date);
    const end = new Date(currentTrip.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const getActivitiesForDay = (day: number) => {
    return activities
      .filter(activity => activity.day_number === day)
      .sort((a, b) => a.order_index - b.order_index);
  };

  const getDurationInDays = () => {
    if (!currentTrip.start_date || !currentTrip.end_date) return 1;
    const start = new Date(currentTrip.start_date);
    const end = new Date(currentTrip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = getDaysArray();
  const totalExpenses = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
  const budgetUsed = currentTrip.budget > 0 ? (totalExpenses / currentTrip.budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{currentTrip.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentTrip.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIPlanner(!showAIPlanner)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showAIPlanner
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                }`}
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                {showAIPlanner ? 'Hide AI Planner' : 'AI Planner'}
              </button>
              
              <button
                onClick={() => setShowCollaboration(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Collaborate
              </button>
              
              <button
                onClick={() => setShowAIActivityPlanner(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Smart Activities
              </button>
              
              <button
                onClick={() => setShowBudgetTracker(!showBudgetTracker)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showBudgetTracker
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {showBudgetTracker ? 'Hide Budget' : 'Budget Tracker'}
              </button>
              
              <button
                onClick={() => setShowBillSplitter(!showBillSplitter)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                  showBillSplitter
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                <CalculatorIcon className="h-4 w-4 mr-2" />
                {showBillSplitter ? 'Hide Split Bills' : 'Split Bills'}
              </button>
              
              <button 
                onClick={() => setShowEditTrip(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit Trip"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              
              {activities.length > 0 && (
                <button
                  onClick={clearAllActivities}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Clear All Activities"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={() => setShowAddActivity(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Trip Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Destination</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{currentTrip.destination}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {days.length} day{days.length !== 1 ? 's' : ''}
                  {currentTrip.start_date && currentTrip.end_date && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {new Date(currentTrip.start_date).toLocaleDateString()} - {new Date(currentTrip.end_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {formatCurrency(currentTrip.budget, currentTrip.currency as Currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">{activities.length}</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Activities</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{activities.length} planned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        {currentTrip.budget > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Usage</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(currentTrip.budget - totalExpenses, currentTrip.currency as Currency)} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* AI Planner */}
        {showAIPlanner && (
          <div className="mb-6">
            <ComprehensiveAIPlanner
              tripId={currentTrip.id}
              tripTitle={currentTrip.title}
              destination={currentTrip.destination || ''}
              days={getDurationInDays()}
              interests={[]}
              budget={currentTrip.budget}
              onActivitiesAdded={fetchActivities}
            />
          </div>
        )}

        {/* Budget Tracker */}
        {showBudgetTracker && (
          <div className="mb-6">
            <BudgetTracker
              trip={currentTrip}
              activities={activities}
              onBudgetUpdate={fetchActivities}
            />
          </div>
        )}

        {/* Bill Splitter */}
        {showBillSplitter && (
          <div className="mb-6">
            <BillSplitter
              trip={currentTrip}
              onBillUpdate={fetchActivities}
            />
          </div>
        )}

        {/* Drag and Drop Itinerary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Bars3Icon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Trip Itinerary
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Drag activities between days to reorganize
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(days.length)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4" />
                    <div className="space-y-3">
                      <div className="h-24 bg-gray-200 rounded" />
                      <div className="h-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {days.map((day) => {
                    const dayActivities = getActivitiesForDay(day);
                    const dayTotal = dayActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                    
                    return (
                      <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {day}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Day {day}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {dayActivities.length} activities
                                  {dayTotal > 0 && (
                                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                                      • {formatCurrency(dayTotal, currentTrip.currency as any)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <button
                                onClick={() => {
                                  setSelectedDay(day);
                                  setShowAddActivity(true);
                                }}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                                title="Add Activity"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDay(day);
                                  setShowAIActivityPlanner(true);
                                }}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded transition-colors ml-1"
                                title="AI Activities"
                              >
                                <SparklesIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <Droppable droppableId={`day-${day}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-4 min-h-[200px] transition-colors ${
                                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              {dayActivities.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <PlusIcon className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                  <p className="text-sm">No activities planned</p>
                                  <p className="text-xs">Drag activities here or click + to add</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {dayActivities.map((activity, index) => (
                                    <Draggable
                                      key={activity.id}
                                      draggableId={activity.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`transition-transform ${
                                            snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                          }`}
                                        >
                                          <div className="relative">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="absolute left-2 top-2 z-10 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                                            >
                                              <Bars3Icon className="h-4 w-4" />
                                            </div>
                                            <div className="pl-8">
                                              <ActivityCard
                                                activity={activity}
                                                onUpdate={fetchActivities}
                                                onEdit={handleEditActivity}
                                                onDelete={() => deleteActivity(activity.id)}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <AddActivityModal
          tripId={currentTrip.id}
          selectedDay={selectedDay}
          onClose={() => setShowAddActivity(false)}
          onActivityAdded={handleActivityAdded}
        />
      )}

      {/* Edit Activity Modal */}
      {showEditActivity && editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => {
            setShowEditActivity(false);
            setEditingActivity(null);
          }}
          onActivityUpdated={handleActivityUpdated}
        />
      )}

      {/* AI Activity Planner Modal */}
      {showAIActivityPlanner && (
        <AIActivityPlanner
          tripId={currentTrip.id}
          destination={currentTrip.destination || ''}
          selectedDay={selectedDay}
          onActivitiesAdded={() => {
            fetchActivities();
            // Reset selected day to ensure proper state
            setSelectedDay(1);
          }}
          onClose={() => setShowAIActivityPlanner(false)}
        />
      )}

      {/* Edit Trip Modal */}
      {showEditTrip && (
        <EditTripModal
          trip={currentTrip}
          onClose={() => setShowEditTrip(false)}
          onTripUpdated={handleTripUpdated}
        />
      )}

      {/* Collaboration Modal */}
      {showCollaboration && (
        <CollaborationModal
          trip={currentTrip}
          onClose={() => setShowCollaboration(false)}
          onTripUpdated={handleTripUpdated}
        />
      )}
    </div>
  );
}