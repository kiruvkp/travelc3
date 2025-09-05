/*
  # Travel Itinerary Management Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `preferences` (jsonb) - travel preferences, interests
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `destination` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (decimal)
      - `currency` (text)
      - `cover_image` (text)
      - `is_public` (boolean)
      - `status` (text) - planning, active, completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `destinations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `country` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `description` (text)
      - `image_url` (text)
      - `popular_activities` (text[])
      - `best_time_to_visit` (text)
      - `created_at` (timestamp)

    - `activities`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `title` (text)
      - `description` (text)
      - `category` (text) - dining, attractions, accommodation, transport
      - `location` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `cost` (decimal)
      - `booking_url` (text)
      - `notes` (text)
      - `day_number` (integer)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `trip_notes`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `trip_photos`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `user_id` (uuid, references profiles)
      - `url` (text)
      - `caption` (text)
      - `location` (text)
      - `taken_at` (timestamp)
      - `created_at` (timestamp)

    - `expenses`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `activity_id` (uuid, references activities, optional)
      - `amount` (decimal)
      - `currency` (text)
      - `category` (text)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamp)

    - `trip_collaborators`
      - `trip_id` (uuid, references trips)
      - `user_id` (uuid, references profiles)
      - `role` (text) - owner, editor, viewer
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for trip collaboration
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  destination text,
  start_date date,
  end_date date,
  budget decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  cover_image text,
  is_public boolean DEFAULT false,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  latitude decimal(10,6),
  longitude decimal(10,6),
  description text,
  image_url text,
  popular_activities text[],
  best_time_to_visit text,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'attraction' CHECK (category IN ('dining', 'attraction', 'accommodation', 'transport', 'shopping', 'entertainment')),
  location text,
  start_time timestamptz,
  end_time timestamptz,
  cost decimal(10,2) DEFAULT 0,
  booking_url text,
  notes text,
  day_number integer DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trip notes table
CREATE TABLE IF NOT EXISTS trip_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trip photos table
CREATE TABLE IF NOT EXISTS trip_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  caption text,
  location text,
  taken_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  category text DEFAULT 'other' CHECK (category IN ('food', 'transport', 'accommodation', 'entertainment', 'shopping', 'other')),
  description text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create trip collaborators table
CREATE TABLE IF NOT EXISTS trip_collaborators (
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (trip_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for trips
CREATE POLICY "Users can view own trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid()) OR
    is_public = true
  );

CREATE POLICY "Users can manage own trips"
  ON trips
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for destinations (public read)
CREATE POLICY "Anyone can view destinations"
  ON destinations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for activities
CREATE POLICY "Users can view trip activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid()) OR
            is_public = true
    )
  );

CREATE POLICY "Users can manage activities in their trips"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Create RLS policies for trip notes
CREATE POLICY "Users can view trip notes"
  ON trip_notes
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid()) OR
            is_public = true
    )
  );

CREATE POLICY "Users can manage own trip notes"
  ON trip_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for trip photos
CREATE POLICY "Users can view trip photos"
  ON trip_photos
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid()) OR
            is_public = true
    )
  );

CREATE POLICY "Users can manage own trip photos"
  ON trip_photos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for expenses
CREATE POLICY "Users can view trip expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage trip expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Create RLS policies for trip collaborators
CREATE POLICY "Users can view trip collaborators"
  ON trip_collaborators
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Trip owners can manage collaborators"
  ON trip_collaborators
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  )
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Insert sample destinations
INSERT INTO destinations (name, country, latitude, longitude, description, image_url, popular_activities, best_time_to_visit) VALUES
('Paris', 'France', 48.8566, 2.3522, 'The City of Light, famous for its art, fashion, gastronomy and culture.', 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg', ARRAY['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre'], 'April to June, September to October'),
('Tokyo', 'Japan', 35.6762, 139.6503, 'A bustling metropolis blending traditional culture with cutting-edge technology.', 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg', ARRAY['Tokyo Tower', 'Senso-ji Temple', 'Shibuya Crossing', 'Tsukiji Fish Market'], 'March to May, September to November'),
('New York City', 'USA', 40.7128, -74.0060, 'The city that never sleeps, famous for its skyline, culture, and energy.', 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg', ARRAY['Central Park', 'Statue of Liberty', 'Times Square', 'Brooklyn Bridge'], 'April to June, September to November'),
('Rome', 'Italy', 41.9028, 12.4964, 'The Eternal City, home to ancient wonders and incredible cuisine.', 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg', ARRAY['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'], 'April to June, September to October'),
('Barcelona', 'Spain', 41.3851, 2.1734, 'A vibrant city known for its art, architecture, and Mediterranean charm.', 'https://images.pexels.com/photos/1386444/pexels-photo-1386444.jpeg', ARRAY['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Gothic Quarter'], 'May to September');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_number ON activities(day_number, order_index);
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip_id ON trip_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON trip_collaborators(user_id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_trip_notes_updated_at
  BEFORE UPDATE ON trip_notes
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();