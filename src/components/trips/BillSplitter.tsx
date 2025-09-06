import React, { useState, useEffect } from 'react';
import { supabase, Trip } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, Currency, getCurrencySymbol } from '../../lib/currency';
import {
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
  XMarkIcon,
  CheckIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface BillSplitterProps {
  trip: Trip;
  onBillUpdate?: () => void;
}

interface SharedExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  paid_by: string;
  split_type: 'equal' | 'custom' | 'percentage';
  participants: string[];
  splits: Record<string, number>;
  date: string;
  description?: string;
  created_at: string;
  paid_by_profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface TripMember {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
  from_name: string;
  to_name: string;
  from_avatar?: string;
  to_avatar?: string;
}

interface Balance {
  user_id: string;
  name: string;
  avatar?: string;
  balance: number;
  owes: number;
  owed: number;
}

interface ExpenseFormData {
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'custom' | 'percentage';
  participants: string[];
  splits: Record<string, number>;
  date: string;
  description: string;
  category: string;
}

const expenseCategories = [
  { value: 'general', label: 'General', emoji: '💰', color: 'bg-gray-100 text-gray-800' },
  { value: 'food', label: 'Food & Dining', emoji: '🍽️', color: 'bg-orange-100 text-orange-800' },
  { value: 'transport', label: 'Transportation', emoji: '🚗', color: 'bg-blue-100 text-blue-800' },
  { value: 'accommodation', label: 'Accommodation', emoji: '🏨', color: 'bg-purple-100 text-purple-800' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎭', color: 'bg-pink-100 text-pink-800' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', color: 'bg-green-100 text-green-800' },
  { value: 'utilities', label: 'Utilities', emoji: '⚡', color: 'bg-yellow-100 text-yellow-800' },
];

export default function BillSplitter({ trip, onBillUpdate }: BillSplitterProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SharedExpense | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'totals'>('expenses');
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: 0,
    paid_by: user?.id || '',
    split_type: 'equal',
    participants: [],
    splits: {},
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'general',
  });

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
  }, [trip.id]);

  useEffect(() => {
    if (expenses.length > 0 && members.length > 0) {
      calculateBalancesAndSettlements();
    }
  }, [expenses, members]);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_expenses')
        .select(`
          *,
          paid_by_profile:profiles!shared_expenses_paid_by_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('trip_id', trip.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching shared expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      // Get trip owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', trip.user_id)
        .single();

      if (ownerError) throw ownerError;

      // Get collaborators
      const { data: collaboratorsData, error: collaboratorsError } = await supabase
        .from('trip_collaborators')
        .select(`
          user_id,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('trip_id', trip.id);

      if (collaboratorsError) throw collaboratorsError;

      const allMembers: TripMember[] = [
        {
          user_id: ownerData.id,
          full_name: ownerData.full_name || 'Trip Owner',
          email: ownerData.email,
          avatar_url: ownerData.avatar_url,
        },
        ...(collaboratorsData || []).map(collab => ({
          user_id: collab.user_id,
          full_name: collab.profiles.full_name || 'User',
          email: collab.profiles.email,
          avatar_url: collab.profiles.avatar_url,
        }))
      ];

      setMembers(allMembers);
      
      // Initialize form with all members as participants
      setFormData(prev => ({
        ...prev,
        participants: allMembers.map(m => m.user_id),
      }));
    } catch (error) {
      console.error('Error fetching trip members:', error);
    }
  }

  function calculateBalancesAndSettlements() {
    const memberBalances: Record<string, { owes: number; owed: number; net: number }> = {};
    
    // Initialize balances
    members.forEach(member => {
      memberBalances[member.user_id] = { owes: 0, owed: 0, net: 0 };
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      // Person who paid gets credit
      memberBalances[expense.paid_by].owed += expense.amount;
      
      // Each participant owes their share
      expense.participants.forEach(participantId => {
        const share = expense.splits[participantId] || 0;
        memberBalances[participantId].owes += share;
      });
    });

    // Calculate net balances
    Object.keys(memberBalances).forEach(userId => {
      memberBalances[userId].net = memberBalances[userId].owed - memberBalances[userId].owes;
    });

    // Create balance objects
    const balanceList: Balance[] = members.map(member => ({
      user_id: member.user_id,
      name: member.full_name,
      avatar: member.avatar_url,
      balance: memberBalances[member.user_id].net,
      owes: memberBalances[member.user_id].owes,
      owed: memberBalances[member.user_id].owed,
    }));

    setBalances(balanceList);

    // Calculate settlements using simplified algorithm
    const settlements: Settlement[] = [];
    const creditors = balanceList.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const debtors = balanceList.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        settlements.push({
          from: debtor.user_id,
          to: creditor.user_id,
          amount: amount,
          from_name: debtor.name,
          to_name: creditor.name,
          from_avatar: debtor.avatar,
          to_avatar: creditor.avatar,
        });

        creditor.balance -= amount;
        debtor.balance += amount;
      }

      if (creditor.balance <= 0.01) i++;
      if (debtor.balance >= -0.01) j++;
    }

    setSettlements(settlements);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      // Calculate splits based on split type
      let splits: Record<string, number> = {};
      
      if (formData.split_type === 'equal') {
        const shareAmount = formData.amount / formData.participants.length;
        formData.participants.forEach(participantId => {
          splits[participantId] = Math.round(shareAmount * 100) / 100;
        });
      } else {
        splits = formData.splits;
      }

      const expenseData = {
        trip_id: trip.id,
        title: formData.title,
        amount: formData.amount,
        currency: trip.currency,
        paid_by: formData.paid_by,
        split_type: formData.split_type,
        participants: formData.participants,
        splits: splits,
        date: formData.date,
        description: formData.description,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('shared_expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shared_expenses')
          .insert(expenseData);

        if (error) throw error;
      }

      await fetchExpenses();
      resetForm();
      onBillUpdate?.();
    } catch (error) {
      console.error('Error saving shared expense:', error);
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('shared_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      await fetchExpenses();
      onBillUpdate?.();
    } catch (error) {
      console.error('Error deleting shared expense:', error);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      amount: 0,
      paid_by: user?.id || '',
      split_type: 'equal',
      participants: members.map(m => m.user_id),
      splits: {},
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'general',
    });
    setShowAddExpense(false);
    setEditingExpense(null);
  }

  function startEdit(expense: SharedExpense) {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      paid_by: expense.paid_by,
      split_type: expense.split_type,
      participants: expense.participants,
      splits: expense.splits,
      date: expense.date,
      description: expense.description || '',
      category: 'general',
    });
    setShowAddExpense(true);
  }

  function updateCustomSplit(participantId: string, amount: number) {
    setFormData(prev => ({
      ...prev,
      splits: {
        ...prev.splits,
        [participantId]: amount,
      },
    }));
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const userBalance = balances.find(b => b.user_id === user?.id)?.balance || 0;
  const userOwes = settlements.filter(s => s.from === user?.id).reduce((sum, s) => sum + s.amount, 0);
  const userOwed = settlements.filter(s => s.to === user?.id).reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Split Expenses</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track shared expenses and settle up</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'expenses', label: 'All Expenses', icon: BanknotesIcon },
            { id: 'balances', label: 'Balances', icon: UsersIcon },
            { id: 'totals', label: 'Totals', icon: CalculatorIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Expenses</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(totalExpenses, trip.currency as Currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Trip Members</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{members.length}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${
            userBalance > 0 
              ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800' 
              : userBalance < 0 
                ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                userBalance > 0 ? 'bg-green-500' : userBalance < 0 ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                <ArrowRightIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  userBalance > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : userBalance < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Your Balance
                </p>
                <p className={`text-xl font-bold ${
                  userBalance > 0 
                    ? 'text-green-900 dark:text-green-100' 
                    : userBalance < 0 
                      ? 'text-red-900 dark:text-red-100' 
                      : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {userBalance > 0 ? '+' : ''}{formatCurrency(userBalance, trip.currency as Currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Settlements</p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{settlements.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'expenses' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Expenses</h4>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <CalculatorIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first shared expense</p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const category = expenseCategories.find(cat => cat.value === expense.category) || expenseCategories[0];
                  
                  return (
                    <div key={expense.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="h-12 w-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-500">
                            <span className="text-xl">{category.emoji}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">{expense.title}</h5>
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(expense.amount, trip.currency as Currency)}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center mr-6">
                                {expense.paid_by_profile?.avatar_url ? (
                                  <img
                                    src={expense.paid_by_profile.avatar_url}
                                    alt={expense.paid_by_profile.full_name}
                                    className="h-6 w-6 rounded-full mr-2"
                                  />
                                ) : (
                                  <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
                                )}
                                <span>Paid by {expense.paid_by_profile?.full_name || 'Unknown'}</span>
                              </div>
                              <span className="mr-6">{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                              <span>{expense.participants.length} people</span>
                            </div>

                            {expense.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{expense.description}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                                  {category.label}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                  {expense.split_type === 'equal' ? 'Split Equally' : 'Custom Split'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startEdit(expense)}
                                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Edit Expense"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteExpense(expense.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete Expense"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Member Balances</h4>
            <div className="space-y-4">
              {balances.map((balance) => (
                <div key={balance.user_id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {balance.avatar ? (
                        <img
                          src={balance.avatar}
                          alt={balance.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {balance.name}
                          {balance.user_id === user?.id && <span className="text-sm text-gray-500 ml-2">(You)</span>}
                        </h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Paid: {formatCurrency(balance.owed, trip.currency as Currency)}</span>
                          <span>Share: {formatCurrency(balance.owes, trip.currency as Currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        balance.balance > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : balance.balance < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {balance.balance > 0 ? '+' : ''}{formatCurrency(balance.balance, trip.currency as Currency)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {balance.balance > 0 ? 'gets back' : balance.balance < 0 ? 'owes' : 'settled up'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'totals' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Settlement Summary</h4>
            {settlements.length === 0 ? (
              <div className="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <CheckIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">All settled up!</h3>
                <p className="text-green-700 dark:text-green-300">Everyone has paid their fair share</p>
              </div>
            ) : (
              <div className="space-y-4">
                {settlements.map((settlement, index) => (
                  <div key={index} className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          {settlement.from_avatar ? (
                            <img
                              src={settlement.from_avatar}
                              alt={settlement.from_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                                {settlement.from_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          
                          <ArrowRightIcon className="h-5 w-5 text-orange-500" />
                          
                          {settlement.to_avatar ? (
                            <img
                              src={settlement.to_avatar}
                              alt={settlement.to_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                {settlement.to_name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {settlement.from_name} owes {settlement.to_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Settlement payment
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(settlement.amount, trip.currency as Currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Dinner at restaurant"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {getCurrencySymbol(trip.currency as Currency)}
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paid by *
                    </label>
                    <select
                      value={formData.paid_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid_by: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {members.map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.full_name} {member.user_id === user?.id && '(You)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Split Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, split_type: 'equal' }))}
                      className={`p-4 rounded-xl border text-center transition-colors ${
                        formData.split_type === 'equal'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">Split Equally</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Everyone pays the same amount</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, split_type: 'custom' }))}
                      className={`p-4 rounded-xl border text-center transition-colors ${
                        formData.split_type === 'custom'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">Custom Split</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Set specific amounts for each person</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Split Between
                  </label>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.participants.includes(member.user_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  participants: [...prev.participants, member.user_id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  participants: prev.participants.filter(id => id !== member.user_id)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex items-center">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.full_name}
                                className="h-8 w-8 rounded-full mr-3"
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {member.full_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {member.full_name}
                              {member.user_id === user?.id && <span className="text-sm text-gray-500 ml-1">(You)</span>}
                            </span>
                          </div>
                        </div>
                        
                        {formData.split_type === 'custom' && formData.participants.includes(member.user_id) && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{getCurrencySymbol(trip.currency as Currency)}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.splits[member.user_id] || ''}
                              onChange={(e) => updateCustomSplit(member.user_id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional details about this expense..."
                  />
                </div>

                {/* Validation Warning */}
                {formData.split_type === 'custom' && formData.participants.length > 0 && (
                  (() => {
                    const totalSplits = formData.participants.reduce((sum, id) => sum + (formData.splits[id] || 0), 0);
                    const difference = Math.abs(totalSplits - formData.amount);
                    
                    if (difference > 0.01) {
                      return (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                          <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Custom splits total {formatCurrency(totalSplits, trip.currency as Currency)} but expense is {formatCurrency(formData.amount, trip.currency as Currency)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.title || !formData.amount || formData.participants.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}