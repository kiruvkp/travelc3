/*
  # Create shared_expenses table for bill splitting

  1. New Tables
    - `shared_expenses`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `title` (text, expense title)
      - `amount` (numeric, expense amount)
      - `currency` (text, currency code)
      - `paid_by` (uuid, foreign key to profiles)
      - `split_type` (text, equal/custom/percentage)
      - `participants` (text[], array of user IDs)
      - `splits` (jsonb, mapping of user_id to amount)
      - `date` (date, expense date)
      - `description` (text, optional description)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `shared_expenses` table
    - Add policies for trip members to manage shared expenses
    - Users can only access expenses for trips they own or collaborate on

  3. Indexes
    - Index on trip_id for efficient queries
    - Index on paid_by for user-specific queries
*/

-- Create shared_expenses table
CREATE TABLE IF NOT EXISTS shared_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  title text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  paid_by uuid NOT NULL,
  split_type text NOT NULL DEFAULT 'equal',
  participants text[] NOT NULL DEFAULT '{}',
  splits jsonb NOT NULL DEFAULT '{}',
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'shared_expenses_trip_id_fkey'
  ) THEN
    ALTER TABLE shared_expenses 
    ADD CONSTRAINT shared_expenses_trip_id_fkey 
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'shared_expenses_paid_by_fkey'
  ) THEN
    ALTER TABLE shared_expenses 
    ADD CONSTRAINT shared_expenses_paid_by_fkey 
    FOREIGN KEY (paid_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'shared_expenses_split_type_check'
  ) THEN
    ALTER TABLE shared_expenses 
    ADD CONSTRAINT shared_expenses_split_type_check 
    CHECK (split_type IN ('equal', 'custom', 'percentage'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'shared_expenses_amount_positive'
  ) THEN
    ALTER TABLE shared_expenses 
    ADD CONSTRAINT shared_expenses_amount_positive 
    CHECK (amount > 0);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_expenses_trip_id ON shared_expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_paid_by ON shared_expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_date ON shared_expenses(date);

-- Enable Row Level Security
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "shared_expenses_select_own" ON shared_expenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = shared_expenses.trip_id 
      AND trips.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = shared_expenses.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "shared_expenses_insert_own" ON shared_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = shared_expenses.trip_id 
      AND trips.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = shared_expenses.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "shared_expenses_update_own" ON shared_expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = shared_expenses.trip_id 
      AND trips.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = shared_expenses.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = shared_expenses.trip_id 
      AND trips.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = shared_expenses.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "shared_expenses_delete_own" ON shared_expenses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = shared_expenses.trip_id 
      AND trips.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_collaborators.trip_id = shared_expenses.trip_id 
      AND trip_collaborators.user_id = auth.uid()
    )
  );