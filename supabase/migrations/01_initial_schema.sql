/**
 * Migración inicial - Estructura de base de datos para Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/01_initial_schema.sql
 */

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');

-- Users table (extends Supabase auth.users)
CREATE TABLE kiki_users (
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
CREATE TABLE kiki_projects (
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
CREATE TABLE kiki_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  assistant_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Project documents table
CREATE TABLE kiki_documents (
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
CREATE TABLE kiki_llm_configs (
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
CREATE TABLE kiki_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES kiki_users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES kiki_projects(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON kiki_projects(user_id);
CREATE INDEX idx_chat_messages_project_id ON kiki_chat_messages(project_id);
CREATE INDEX idx_documents_project_id ON kiki_documents(project_id);
CREATE INDEX idx_analytics_user_id ON kiki_analytics(user_id);
CREATE INDEX idx_analytics_project_id ON kiki_analytics(project_id);
CREATE INDEX idx_analytics_created_at ON kiki_analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_kiki_users_updated_at BEFORE UPDATE ON kiki_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiki_projects_updated_at BEFORE UPDATE ON kiki_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiki_documents_updated_at BEFORE UPDATE ON kiki_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();