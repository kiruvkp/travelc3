/*
  # Create travel documents table

  1. New Tables
    - `travel_documents`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `type` (text, document type)
      - `title` (text, document title)
      - `description` (text, optional description)
      - `details` (jsonb, flexible document details)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `travel_documents` table
    - Add policies for trip members to manage documents

  3. Changes
    - Support for flights, hotels, bookings, documents, guides, and tips
    - Flexible JSONB structure for different document types
    - Full CRUD operations for trip organizer
*/

CREATE TABLE IF NOT EXISTS travel_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('flight', 'hotel', 'booking', 'document', 'guide', 'tip')),
  title text NOT NULL,
  description text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_documents_trip_id ON travel_documents(trip_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_type ON travel_documents(type);

-- RLS Policies
CREATE POLICY "travel_documents_select_own"
  ON travel_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = travel_documents.trip_id 
      AND trips.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = travel_documents.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "travel_documents_insert_own"
  ON travel_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = travel_documents.trip_id 
      AND trips.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = travel_documents.trip_id 
      AND trip_collaborators.user_id = auth.uid()
      AND trip_collaborators.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "travel_documents_update_own"
  ON travel_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = travel_documents.trip_id 
      AND trips.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = travel_documents.trip_id 
      AND trip_collaborators.user_id = auth.uid()
      AND trip_collaborators.role IN ('owner', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = travel_documents.trip_id 
      AND trips.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = travel_documents.trip_id 
      AND trip_collaborators.user_id = auth.uid()
      AND trip_collaborators.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "travel_documents_delete_own"
  ON travel_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = travel_documents.trip_id 
      AND trips.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = travel_documents.trip_id 
      AND trip_collaborators.user_id = auth.uid()
      AND trip_collaborators.role IN ('owner', 'editor')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_travel_documents_updated_at
  BEFORE UPDATE ON travel_documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();