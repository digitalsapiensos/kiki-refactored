/**
 * Fix user creation - Allow inserting kiki_users records
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/04_fix_user_creation.sql
 */

-- Add policy to allow inserting new users (for signup process)
CREATE POLICY "Allow user creation on signup" ON kiki_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix the trigger function to handle metadata correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.kiki_users (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();