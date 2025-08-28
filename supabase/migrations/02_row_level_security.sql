/**
 * Row Level Security (RLS) policies para Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/02_row_level_security.sql
 */

-- Enable RLS on all tables
ALTER TABLE kiki_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_llm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_analytics ENABLE ROW LEVEL SECURITY;

-- kiki_users policies
CREATE POLICY "Users can view own profile" ON kiki_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON kiki_users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON kiki_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON kiki_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- kiki_projects policies
CREATE POLICY "Users can view own projects" ON kiki_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create projects" ON kiki_projects
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (SELECT COUNT(*) FROM kiki_projects WHERE user_id = auth.uid() AND status = 'active') < 
    (SELECT project_limit FROM kiki_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own projects" ON kiki_projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON kiki_projects
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all projects" ON kiki_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- kiki_chat_messages policies
CREATE POLICY "Users can view messages from own projects" ON kiki_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own projects" ON kiki_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- kiki_documents policies
CREATE POLICY "Users can view documents from own projects" ON kiki_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in own projects" ON kiki_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in own projects" ON kiki_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in own projects" ON kiki_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- kiki_llm_configs policies (admin only)
CREATE POLICY "Only admins can view LLM configs" ON kiki_llm_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage LLM configs" ON kiki_llm_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- kiki_analytics policies
CREATE POLICY "Users can create own analytics events" ON kiki_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics" ON kiki_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically create user record on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.kiki_users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();