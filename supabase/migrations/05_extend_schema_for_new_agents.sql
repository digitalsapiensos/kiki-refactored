/**
 * Extend schema for new agent system and workflow tracking
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/05_extend_schema_for_new_agents.sql
 */

-- Add workflow tracking fields to projects table
ALTER TABLE kiki_projects 
ADD COLUMN IF NOT EXISTS workflow_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS current_agent TEXT DEFAULT 'consultor-virtual',
ADD COLUMN IF NOT EXISTS agent_handoff_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conversation_cost DECIMAL(10,6) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0;

-- Create agent handoffs table for tracking context between agents
CREATE TABLE IF NOT EXISTS kiki_agent_handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  handoff_reason TEXT,
  handoff_context JSONB DEFAULT '{}'::jsonb,
  conversation_summary TEXT,
  phase_completion_score DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Update chat messages table to support new agent system
ALTER TABLE kiki_chat_messages 
ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'professional', -- professional vs mock
ADD COLUMN IF NOT EXISTS llm_provider TEXT DEFAULT 'deepseek',
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,6) DEFAULT 0.00;

-- Create chat sessions table for better session management
CREATE TABLE IF NOT EXISTS kiki_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES kiki_users(id) ON DELETE CASCADE,
  current_agent TEXT DEFAULT 'consultor-virtual',
  session_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  total_cost DECIMAL(10,6) DEFAULT 0.00,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create file generations table for tracking file creation
CREATE TABLE IF NOT EXISTS kiki_file_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  content TEXT,
  file_size INTEGER DEFAULT 0,
  storage_path TEXT, -- Path in Supabase storage if file > 100KB
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user preferences table for LLM selection
CREATE TABLE IF NOT EXISTS kiki_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES kiki_users(id) ON DELETE CASCADE,
  preferred_llm_provider TEXT DEFAULT 'deepseek',
  language_preference TEXT DEFAULT 'es',
  ui_theme TEXT DEFAULT 'neobrutalism',
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  agent_preferences JSONB DEFAULT '{}'::jsonb, -- Preferences for specific agents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_project_id ON kiki_agent_handoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_created_at ON kiki_agent_handoffs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON kiki_chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON kiki_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_active ON kiki_chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_file_generations_project_id ON kiki_file_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_file_generations_status ON kiki_file_generations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_tokens ON kiki_chat_messages(tokens_used);
CREATE INDEX IF NOT EXISTS idx_chat_messages_cost ON kiki_chat_messages(cost);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_kiki_chat_sessions_updated_at BEFORE UPDATE ON kiki_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiki_file_generations_updated_at BEFORE UPDATE ON kiki_file_generations  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiki_user_preferences_updated_at BEFORE UPDATE ON kiki_user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing projects to have default agent
UPDATE kiki_projects SET current_agent = 'consultor-virtual' WHERE current_agent IS NULL;

-- Add some default user preferences for existing users
INSERT INTO kiki_user_preferences (user_id, preferred_llm_provider, language_preference)
SELECT id, 'deepseek', 'es' FROM kiki_users 
WHERE id NOT IN (SELECT user_id FROM kiki_user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE kiki_agent_handoffs IS 'Tracks context and handoffs between different AI agents during conversations';
COMMENT ON TABLE kiki_chat_sessions IS 'Manages chat sessions with cost and token tracking';
COMMENT ON TABLE kiki_file_generations IS 'Tracks file generation status and metadata from agent conversations';
COMMENT ON TABLE kiki_user_preferences IS 'Stores user preferences for LLM providers and UI settings';
COMMENT ON COLUMN kiki_projects.workflow_data IS 'Stores workflow state and progress data';
COMMENT ON COLUMN kiki_projects.agent_handoff_history IS 'Array of agent transitions during project lifecycle';
COMMENT ON COLUMN kiki_chat_messages.llm_provider IS 'LLM provider used for this message (deepseek, openai, etc)';
COMMENT ON COLUMN kiki_chat_messages.tokens_used IS 'Number of tokens consumed for this message';
COMMENT ON COLUMN kiki_chat_messages.cost IS 'Cost in USD for this specific message';