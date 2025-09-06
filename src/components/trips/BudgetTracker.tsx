import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Trip, Activity, Expense } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, Currency, getCurrencySymbol } from '../../lib/currency';
import {
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface BudgetTrackerProps {
  trip: Trip;
  activities: Activity[];
  onBudgetUpdate?: () => void;
}

interface ExpenseFormData {
  amount: number;
  category: Expense['category'];
  description: string;
  date: string;
  activity_id?: string;
}

const expenseCategories = [
  { value: 'food', label: 'Food & Dining', emoji: '🍽️', color: 'bg-orange-100 text-orange-800' },
  { value: 'transport', label: 'Transportation', emoji: '🚗', color: 'bg-blue-100 text-blue-800' },
  { value: 'accommodation', label: 'Accommodation', emoji: '🏨', color: 'bg-purple-100 text-purple-800' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎭', color: 'bg-pink-100 text-pink-800' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'Other', emoji: '💰', color: 'bg-gray-100 text-gray-800' },
];

export default function BudgetTracker({ trip, activities, onBudgetUpdate }: BudgetTrackerProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    category: 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, [trip.id]);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', trip.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate budget totals
  const budgetCalculations = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const activityCosts = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    const totalSpent = totalExpenses + activityCosts;
    const remainingBudget = trip.budget - totalSpent;
    const budgetUsed = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

    return {
      totalExpenses,
      activityCosts,
      totalSpent,
      remainingBudget,
      budgetUsed
    };
  }, [expenses, activities, trip.budget]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    return expenseCategories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category === category.value);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return { 
        ...category, 
        total, 
        count: categoryExpenses.length 
      };
    });
  }, [expenses]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            amount: formData.amount,
            category: formData.category,
            description: formData.description,
            date: formData.date,
            activity_id: formData.activity_id || null,
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({
            trip_id: trip.id,
            amount: formData.amount,
            category: formData.category,
            description: formData.description,
            date: formData.date,
            currency: trip.currency,
            activity_id: formData.activity_id || null,
          });

        if (error) throw error;
      }

      await fetchExpenses();
      resetForm();
      onBudgetUpdate?.();
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      await fetchExpenses();
      onBudgetUpdate?.();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  }

  function resetForm() {
    setFormData({
      amount: 0,
      category: 'other',
      description: '',
      date: new Date().toISOString().split('T')[0],
      activity_id: undefined,
    });
    setShowAddExpense(false);
    setEditingExpense(null);
    setError('');
  }

  function startEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: expense.date,
      activity_id: expense.activity_id || undefined,
    });
    setShowAddExpense(true);
  }

  const getBudgetStatus = () => {
    if (budgetCalculations.budgetUsed > 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-50', icon: ExclamationTriangleIcon };
    if (budgetCalculations.budgetUsed > 80) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: ExclamationTriangleIcon };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircleIcon };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Tracker</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your trip expenses</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Budget Overview */}
        <div className={`rounded-lg p-4 mb-6 ${budgetStatus.bgColor}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <budgetStatus.icon className={`h-6 w-6 ${budgetStatus.color} mr-2`} />
              <h4 className={`font-semibold ${budgetStatus.color}`}>
                Budget Status: {budgetStatus.status === 'over' ? 'Over Budget' : budgetStatus.status === 'warning' ? 'Near Limit' : 'On Track'}
              </h4>
            </div>
            <span className={`text-sm font-medium ${budgetStatus.color}`}>
              {budgetCalculations.budgetUsed.toFixed(1)}% used
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(trip.budget, trip.currency as Currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Activity Costs</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(budgetCalculations.activityCosts, trip.currency as Currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Other Expenses</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(budgetCalculations.totalExpenses, trip.currency as Currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p className={`text-lg font-semibold ${budgetCalculations.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetCalculations.remainingBudget, trip.currency as Currency)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                budgetCalculations.budgetUsed > 100 ? 'bg-red-500' : budgetCalculations.budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetCalculations.budgetUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Expense Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryTotals.map((category) => (
              <div key={category.value} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category.emoji}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{category.label}</span>
                  </div>
                  {category.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.count}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(category.total, trip.currency as Currency)}
                </p>
                {category.total > 0 && budgetCalculations.totalExpenses > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {((category.total / budgetCalculations.totalExpenses) * 100).toFixed(1)}% of expenses
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Expenses</h4>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No expenses recorded yet</p>
              <p className="text-sm">Click "Add Expense" to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {expenses.map((expense) => {
                const category = expenseCategories.find(cat => cat.value === expense.category);
                const relatedActivity = activities.find(act => act.id === expense.activity_id);
                
                return (
                  <div key={expense.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">{category?.emoji || '💰'}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {expense.description || category?.label || 'Expense'}
                          </span>
                          {relatedActivity && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              {relatedActivity.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                          <span className="mx-2">•</span>
                          <span className={category?.color || 'text-gray-600'}>{category?.label || 'Other'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrencyWithLocale(expense.amount, expense.currency as Currency)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => startEdit(expense)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit Expense"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Delete Expense"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Expense['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {expenseCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.emoji} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="What was this expense for?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Activity (Optional)
                  </label>
                  <select
                    value={formData.activity_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, activity_id: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">No related activity</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        Day {activity.day_number}: {activity.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <span className="mr-2">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}