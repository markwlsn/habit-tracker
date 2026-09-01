-- ============================================================================
-- Habit Tracker Backend Database Schema
-- ============================================================================
-- 
-- This file contains the complete database schema for the Habit Tracker
-- application. Execute this SQL in your Supabase SQL editor to set up
-- the required tables, indexes, and constraints.
--
-- Prerequisites:
-- - Supabase project with PostgreSQL database
-- - uuid-ossp extension enabled (usually enabled by default)
--
-- Instructions:
-- 1. Open your Supabase project dashboard
-- 2. Go to the SQL Editor
-- 3. Paste and execute this entire SQL script
-- 4. Verify the tables are created in the Table Editor
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: habits
-- ============================================================================
-- Stores user habits with their tracking frequency and target counts
-- Each habit belongs to a specific user and has a name, description, and frequency

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  target_count INTEGER CHECK (target_count IS NULL OR target_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE habits IS 'Stores user-defined habits to be tracked';
COMMENT ON COLUMN habits.user_id IS 'References the authenticated user who owns this habit';
COMMENT ON COLUMN habits.frequency IS 'How often the habit should be performed: daily or weekly';
COMMENT ON COLUMN habits.target_count IS 'For weekly habits: number of times per week. NULL for daily habits';

-- ============================================================================
-- TABLE: habit_logs
-- ============================================================================
-- Stores completion logs for each habit
-- Tracks when a user completed a specific habit on a given date

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one completion per habit per date (prevents duplicates)
  UNIQUE(habit_id, completion_date)
);

-- Add comment for documentation
COMMENT ON TABLE habit_logs IS 'Stores completion records for habits';
COMMENT ON COLUMN habit_logs.habit_id IS 'References the habit that was completed';
COMMENT ON COLUMN habit_logs.user_id IS 'References the user who completed the habit (for RLS)';
COMMENT ON COLUMN habit_logs.completion_date IS 'The date when the habit was completed';

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Create indexes for optimized query performance

-- Index for finding habits by user (most common query)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Index for finding logs by habit (for streak calculation)
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);

-- Index for finding logs by user (for analytics)
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);

-- Index for filtering logs by date (for analytics and date range queries)
CREATE INDEX IF NOT EXISTS idx_habit_logs_completion_date ON habit_logs(completion_date);

-- Composite index for efficient habit+date lookups (duplicate checking)
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, completion_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS and create policies to ensure users can only access their own data

-- Enable RLS on habits table
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Users can view their own habits
CREATE POLICY IF NOT EXISTS "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own habits
CREATE POLICY IF NOT EXISTS "Users can create their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
CREATE POLICY IF NOT EXISTS "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own habits
CREATE POLICY IF NOT EXISTS "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on habit_logs table
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY IF NOT EXISTS "Users can view their own logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own logs
CREATE POLICY IF NOT EXISTS "Users can create their own logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY IF NOT EXISTS "Users can delete their own logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup was successful

-- Check if tables exist
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('habits', 'habit_logs')
ORDER BY table_name;

-- Check if indexes exist
SELECT 
  indexname, 
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('habits', 'habit_logs')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('habits', 'habit_logs');

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('habits', 'habit_logs')
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If you see results from all the verification queries above, 
-- your database setup is complete and ready for the Habit Tracker backend!
--
-- Next steps:
-- 1. Set up your .env file with the correct Supabase credentials
-- 2. Run the setup script: npm run setup
-- 3. Start the development server: npm run dev
-- ============================================================================