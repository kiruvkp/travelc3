import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Declare supabase at top level
let supabase: any;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === 'your_supabase_url' || 
    supabaseKey === 'your_supabase_anon_key') {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.error('Please replace the placeholder values with your actual Supabase project credentials.');
  
  // Create a mock client to prevent app crashes during development
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => Promise.reject(new Error('Supabase not configured')),
      update: () => ({ eq: () => Promise.reject(new Error('Supabase not configured')) }),
      delete: () => ({ eq: () => Promise.reject(new Error('Supabase not configured')) }),
      upsert: () => Promise.reject(new Error('Supabase not configured')),
    }),
  };
  
  supabase = mockClient as any;
  
  // Show a warning banner in the app
  if (typeof window !== 'undefined') {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        background: #fbbf24; 
        color: #92400e; 
        padding: 12px; 
        text-align: center; 
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        ⚠️ Supabase not configured. Please update your .env file with actual Supabase credentials.
      </div>
    `;
    document.body.appendChild(banner);
  }
} else {
  // Validate URL format only if not using placeholders
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
  }

  // Validate API key format (should be a long string)
  if (supabaseKey.length < 100) {
    console.error('Invalid Supabase API key format. Key appears too short.');
    throw new Error('Invalid Supabase API key format. Please check your VITE_SUPABASE_ANON_KEY in .env file.');
  }

  supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'travel-planner-app',
      },
    },
  });
}

// Export at top level
export { supabase };
export * from './supabase-types';

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget: number;
  currency: string;
  cover_image?: string;
  is_public: boolean;
  status: 'planning' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  activities?: Activity[];
  expenses?: Expense[];
}

export interface Destination {
  id: string;
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  image_url?: string;
  popular_activities?: string[];
  best_time_to_visit?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  category: 'dining' | 'attraction' | 'accommodation' | 'transport' | 'shopping' | 'entertainment';
  location?: string;
  start_time?: string;
  end_time?: string;
  cost: number;
  booking_url?: string;
  notes?: string;
  day_number: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TripNote {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  activity_id?: string;
  amount: number;
  currency: string;
  category: 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'other';
  description?: string;
  date: string;
  created_at: string;
}

export interface SharedExpense {
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
}