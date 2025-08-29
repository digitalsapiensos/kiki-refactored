/**
 * Add superadmin role and set up system prompts management
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/supabase/migrations/07_add_superadmin_role.sql
 */

-- Extend user_role enum to include superadmin
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Create system prompts table for managing agent prompts
CREATE TABLE IF NOT EXISTS kiki_system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_key TEXT NOT NULL UNIQUE, -- e.g., 'extractor-conversacional', 'formalizador-negocio'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'startup', -- startup, feature, specific, refactoring, maintenance
  subcategory TEXT, -- e.g., '01-inicio-proyecto', '02-añadir-feature'
  file_path TEXT, -- Original file path for reference
  created_by UUID REFERENCES kiki_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create system prompt versions table for history
CREATE TABLE IF NOT EXISTS kiki_system_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES kiki_system_prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_notes TEXT,
  created_by UUID REFERENCES kiki_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin actions log table
CREATE TABLE IF NOT EXISTS kiki_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES kiki_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'prompt_update', 'user_role_change', etc
  resource_type TEXT NOT NULL, -- 'system_prompt', 'user', etc
  resource_id TEXT NOT NULL, -- ID of the affected resource
  action_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_system_prompts_prompt_key ON kiki_system_prompts(prompt_key);
CREATE INDEX IF NOT EXISTS idx_system_prompts_active ON kiki_system_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_system_prompts_category ON kiki_system_prompts(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON kiki_system_prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version ON kiki_system_prompt_versions(prompt_id, version);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON kiki_admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON kiki_admin_actions(created_at);

-- Add updated_at triggers
CREATE TRIGGER update_kiki_system_prompts_updated_at BEFORE UPDATE ON kiki_system_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set specific user as superadmin (higinieduard@gmail.com)
-- First, create the user if not exists
INSERT INTO kiki_users (id, email, full_name, role)
VALUES ('c5f6dca5-5cbc-4bf8-8766-e4ae24a9ca0d', 'higinieduard@gmail.com', 'Higinio Eduardo', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- Insert initial system prompts from the System Prompts folder
INSERT INTO kiki_system_prompts (prompt_key, title, content, category, subcategory, file_path) VALUES
-- 01-inicio-proyecto
('extractor-conversacional', 'Extractor Conversacional', 'PLACEHOLDER_CONTENT', 'startup', '01-inicio-proyecto', 'situaciones-usuario/01-inicio-proyecto/1-extractor-conversacional.md'),
('formalizador-negocio', 'Formalizador de Negocio', 'PLACEHOLDER_CONTENT', 'startup', '01-inicio-proyecto', 'situaciones-usuario/01-inicio-proyecto/2-formalizador-negocio.md'),
('generador-masterplan', 'Generador de Master Plan', 'PLACEHOLDER_CONTENT', 'startup', '01-inicio-proyecto', 'situaciones-usuario/01-inicio-proyecto/3-generador-masterplan.md'),
('arquitecto-estructura', 'Arquitecto de Estructura', 'PLACEHOLDER_CONTENT', 'startup', '01-inicio-proyecto', 'situaciones-usuario/01-inicio-proyecto/4-arquitecto-estructura.md'),
('configurador-proyecto', 'Configurador de Proyecto', 'PLACEHOLDER_CONTENT', 'startup', '01-inicio-proyecto', 'situaciones-usuario/01-inicio-proyecto/5-configurador-proyecto.md')
ON CONFLICT (prompt_key) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE kiki_system_prompts IS 'Stores system prompts for AI agents with versioning';
COMMENT ON TABLE kiki_system_prompt_versions IS 'Version history for system prompts';
COMMENT ON TABLE kiki_admin_actions IS 'Audit log for admin actions';
COMMENT ON COLUMN kiki_users.role IS 'User role: user, admin, or superadmin';