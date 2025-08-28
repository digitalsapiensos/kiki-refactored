/**
 * Fix RLS policies to avoid infinite recursion
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/03_fix_rls_policies.sql
 */

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON kiki_users;
DROP POLICY IF EXISTS "Admins can update all users" ON kiki_users;
DROP POLICY IF EXISTS "Admins can view all projects" ON kiki_projects;
DROP POLICY IF EXISTS "Only admins can view LLM configs" ON kiki_llm_configs;
DROP POLICY IF EXISTS "Only admins can manage LLM configs" ON kiki_llm_configs;
DROP POLICY IF EXISTS "Admins can view all analytics" ON kiki_analytics;

-- Fix the project creation policy to avoid recursion
DROP POLICY IF EXISTS "Users can create projects" ON kiki_projects;
CREATE POLICY "Users can create projects" ON kiki_projects
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (SELECT COUNT(*) FROM kiki_projects WHERE user_id = auth.uid() AND status = 'active') < 3
  );

-- Add simplified admin policies using JWT claims instead of table lookups
CREATE POLICY "Service role can access all users" ON kiki_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all projects" ON kiki_projects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all llm configs" ON kiki_llm_configs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all analytics" ON kiki_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow inserting into kiki_users without recursion (for the trigger)
CREATE POLICY "Allow user creation on signup" ON kiki_users
  FOR INSERT WITH CHECK (true);

-- Allow the trigger function to access kiki_users
ALTER FUNCTION handle_new_user() SECURITY DEFINER;