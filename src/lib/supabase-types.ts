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