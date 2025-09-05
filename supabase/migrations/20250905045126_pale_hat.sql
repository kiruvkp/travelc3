/*
  # Fix Trips RLS Policy Infinite Recursion

  1. Security Changes
    - Drop all existing RLS policies on trips table
    - Create simple, non-recursive policies
    - Ensure policies only reference direct table columns
    - Remove any subqueries that could cause recursion

  2. Policy Structure
    - Simple user ownership check for trips
    - Direct column references only
    - No nested queries or table joins in policies
*/

-- Drop all existing policies on trips table
DROP POLICY IF EXISTS "Users can manage own trips" ON trips;
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can view trip activities" ON trips;
DROP POLICY IF EXISTS "Users can manage trip expenses" ON trips;

-- Create simple, non-recursive policies for trips
CREATE POLICY "Users can insert own trips"
  ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own trips"
  ON trips
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Also fix any recursive policies on related tables
DROP POLICY IF EXISTS "Users can manage activities in their trips" ON activities;
DROP POLICY IF EXISTS "Users can view trip activities" ON activities;

-- Create simple policies for activities
CREATE POLICY "Users can manage activities in own trips"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  );

-- Fix trip_collaborators policies
DROP POLICY IF EXISTS "Trip owners can manage collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can view trip collaborators" ON trip_collaborators;

CREATE POLICY "Users can manage collaborators for own trips"
  ON trip_collaborators
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  );

-- Fix expenses policies
DROP POLICY IF EXISTS "Users can manage trip expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view trip expenses" ON expenses;

CREATE POLICY "Users can manage expenses for own trips"
  ON expenses
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  );

-- Fix trip_notes policies
DROP POLICY IF EXISTS "Users can manage own trip notes" ON trip_notes;
DROP POLICY IF EXISTS "Users can view trip notes" ON trip_notes;

CREATE POLICY "Users can manage notes for own trips"
  ON trip_notes
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  );

-- Fix trip_photos policies
DROP POLICY IF EXISTS "Users can manage own trip photos" ON trip_photos;
DROP POLICY IF EXISTS "Users can view trip photos" ON trip_photos;

CREATE POLICY "Users can manage photos for own trips"
  ON trip_photos
  FOR ALL
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE user_id = auth.uid()
    )
  );