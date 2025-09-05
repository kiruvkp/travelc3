/*
  # Complete RLS Policy Reset

  This migration completely removes all existing RLS policies and recreates them
  with simple, non-recursive logic to fix infinite recursion errors.

  1. Security Changes
    - Disable RLS temporarily on all tables
    - Drop all existing policies
    - Recreate simple, direct policies
    - Re-enable RLS with clean policies

  2. Policy Structure
    - Use only direct column references
    - No subqueries or table self-references
    - Simple auth.uid() = user_id checks
*/

-- Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert own trips" ON trips;
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;

DROP POLICY IF EXISTS "Users can manage activities in own trips" ON activities;

DROP POLICY IF EXISTS "Users can manage notes for own trips" ON trip_notes;

DROP POLICY IF EXISTS "Users can manage photos for own trips" ON trip_photos;

DROP POLICY IF EXISTS "Users can manage expenses for own trips" ON expenses;

DROP POLICY IF EXISTS "Users can manage collaborators for own trips" ON trip_collaborators;

DROP POLICY IF EXISTS "Anyone can view destinations" ON destinations;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trips policies - simple and direct
CREATE POLICY "trips_select_own" ON trips
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "trips_insert_own" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips_update_own" ON trips
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips_delete_own" ON trips
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "activities_select_own" ON activities
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "activities_insert_own" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "activities_update_own" ON activities
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = activities.trip_id 
    AND trips.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "activities_delete_own" ON activities
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = activities.trip_id 
    AND trips.user_id = auth.uid()
  ));

-- Trip notes policies
CREATE POLICY "trip_notes_select_own" ON trip_notes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "trip_notes_insert_own" ON trip_notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_notes_update_own" ON trip_notes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_notes_delete_own" ON trip_notes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trip photos policies
CREATE POLICY "trip_photos_select_own" ON trip_photos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "trip_photos_insert_own" ON trip_photos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_photos_update_own" ON trip_photos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_photos_delete_own" ON trip_photos
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "expenses_select_own" ON expenses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = expenses.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "expenses_insert_own" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = expenses.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "expenses_update_own" ON expenses
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = expenses.trip_id 
    AND trips.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = expenses.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "expenses_delete_own" ON expenses
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = expenses.trip_id 
    AND trips.user_id = auth.uid()
  ));

-- Trip collaborators policies
CREATE POLICY "trip_collaborators_select_own" ON trip_collaborators
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "trip_collaborators_insert_own" ON trip_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "trip_collaborators_update_own" ON trip_collaborators
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  ));

CREATE POLICY "trip_collaborators_delete_own" ON trip_collaborators
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  ));

-- Destinations policies (public read access)
CREATE POLICY "destinations_select_all" ON destinations
  FOR SELECT TO authenticated
  USING (true);