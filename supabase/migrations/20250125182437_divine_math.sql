/*
  # Initialize Points System Tables

  1. New Tables
    - `user_points`
      - `id` (uuid, primary key)
      - `did` (text, unique)
      - `points` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `points_history`
      - `id` (uuid, primary key)
      - `did` (text, references user_points)
      - `points_change` (integer)
      - `reason` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  did text UNIQUE NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create points_history table
CREATE TABLE IF NOT EXISTS points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  did text REFERENCES user_points(did) ON DELETE CASCADE,
  points_change integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all users"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to points history"
  ON points_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to add points
CREATE OR REPLACE FUNCTION add_points(p_did text, p_amount integer, p_reason text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_total integer;
BEGIN
  -- Insert or update user points
  INSERT INTO user_points (did, points)
  VALUES (p_did, p_amount)
  ON CONFLICT (did) DO UPDATE
  SET points = user_points.points + p_amount,
      updated_at = now()
  RETURNING points INTO new_total;

  -- Record in history
  INSERT INTO points_history (did, points_change, reason)
  VALUES (p_did, p_amount, p_reason);

  RETURN new_total;
END;
$$;