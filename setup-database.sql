-- Kiki Database Setup Script
-- Combining both migrations for direct execution

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_plan AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS kiki_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  plan user_plan DEFAULT 'free',
  project_limit INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Projects table
CREATE TABLE IF NOT EXISTS kiki_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES kiki_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_phase INTEGER DEFAULT 1,
  phase_data JSONB DEFAULT '{}'::jsonb,
  status project_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS kiki_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  assistant_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Project documents table
CREATE TABLE IF NOT EXISTS kiki_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- LLM configurations table
CREATE TABLE IF NOT EXISTS kiki_llm_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  api_key_encrypted TEXT,
  models JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  default_for_phases INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS kiki_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES kiki_users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES kiki_projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes (only if they don't exist)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON kiki_projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON kiki_chat_messages(project_id);
  CREATE INDEX IF NOT EXISTS idx_documents_project_id ON kiki_documents(project_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON kiki_analytics(user_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON kiki_analytics(project_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON kiki_analytics(created_at);
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_kiki_users_updated_at ON kiki_users;
CREATE TRIGGER update_kiki_users_updated_at BEFORE UPDATE ON kiki_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kiki_projects_updated_at ON kiki_projects;
CREATE TRIGGER update_kiki_projects_updated_at BEFORE UPDATE ON kiki_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kiki_documents_updated_at ON kiki_documents;
CREATE TRIGGER update_kiki_documents_updated_at BEFORE UPDATE ON kiki_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE kiki_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_llm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiki_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON kiki_users;
CREATE POLICY "Users can view own profile" ON kiki_users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON kiki_users;
CREATE POLICY "Users can update own profile" ON kiki_users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own projects" ON kiki_projects;
CREATE POLICY "Users can view own projects" ON kiki_projects
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create projects" ON kiki_projects;
CREATE POLICY "Users can create projects" ON kiki_projects
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (SELECT COUNT(*) FROM kiki_projects WHERE user_id = auth.uid() AND status = 'active') < 
    COALESCE((SELECT project_limit FROM kiki_users WHERE id = auth.uid()), 3)
  );

DROP POLICY IF EXISTS "Users can update own projects" ON kiki_projects;
CREATE POLICY "Users can update own projects" ON kiki_projects
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own projects" ON kiki_projects;
CREATE POLICY "Users can delete own projects" ON kiki_projects
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view messages from own projects" ON kiki_chat_messages;
CREATE POLICY "Users can view messages from own projects" ON kiki_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in own projects" ON kiki_chat_messages;
CREATE POLICY "Users can create messages in own projects" ON kiki_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Documents policies
DROP POLICY IF EXISTS "Users can view documents from own projects" ON kiki_documents;
CREATE POLICY "Users can view documents from own projects" ON kiki_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create documents in own projects" ON kiki_documents;
CREATE POLICY "Users can create documents in own projects" ON kiki_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update documents in own projects" ON kiki_documents;
CREATE POLICY "Users can update documents in own projects" ON kiki_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete documents in own projects" ON kiki_documents;
CREATE POLICY "Users can delete documents in own projects" ON kiki_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM kiki_projects 
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Create function to automatically create user record on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.kiki_users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();