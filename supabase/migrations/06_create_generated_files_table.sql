-- Migration: Create generated files table for File Generation System
-- Created for File System Architect implementation

-- Create generated files table
CREATE TABLE IF NOT EXISTS public.kiki_generated_files (
    id TEXT PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.kiki_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT, -- NULL for storage files
    size INTEGER NOT NULL DEFAULT 0,
    agent_id TEXT NOT NULL,
    phase INTEGER NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    storage_type TEXT NOT NULL DEFAULT 'database' CHECK (storage_type IN ('database', 'storage')),
    storage_url TEXT, -- For storage files
    compressed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_project_id ON public.kiki_generated_files(project_id);
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_agent_id ON public.kiki_generated_files(agent_id);
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_phase ON public.kiki_generated_files(phase);
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_type ON public.kiki_generated_files(type);
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_created_at ON public.kiki_generated_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kiki_generated_files_expires_at ON public.kiki_generated_files(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.kiki_generated_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own project files" ON public.kiki_generated_files
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.kiki_projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert files for their own projects" ON public.kiki_generated_files
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.kiki_projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update files for their own projects" ON public.kiki_generated_files
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.kiki_projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files for their own projects" ON public.kiki_generated_files
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.kiki_projects 
            WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kiki_generated_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_kiki_generated_files_updated_at
    BEFORE UPDATE ON public.kiki_generated_files
    FOR EACH ROW
    EXECUTE FUNCTION update_kiki_generated_files_updated_at();

-- Create function for cleanup of expired files
CREATE OR REPLACE FUNCTION cleanup_expired_generated_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.kiki_generated_files 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE public.kiki_generated_files IS 'Stores generated files from LLM responses with hybrid storage support';
COMMENT ON COLUMN public.kiki_generated_files.id IS 'Unique file identifier';
COMMENT ON COLUMN public.kiki_generated_files.project_id IS 'Reference to the project this file belongs to';
COMMENT ON COLUMN public.kiki_generated_files.name IS 'Original filename';
COMMENT ON COLUMN public.kiki_generated_files.path IS 'Relative path within project structure';
COMMENT ON COLUMN public.kiki_generated_files.type IS 'File type classification for organization';
COMMENT ON COLUMN public.kiki_generated_files.content IS 'File content (NULL for storage files)';
COMMENT ON COLUMN public.kiki_generated_files.size IS 'File size in bytes';
COMMENT ON COLUMN public.kiki_generated_files.agent_id IS 'ID of the agent that generated this file';
COMMENT ON COLUMN public.kiki_generated_files.phase IS 'Project phase when file was generated';
COMMENT ON COLUMN public.kiki_generated_files.metadata IS 'Additional file metadata as JSON';
COMMENT ON COLUMN public.kiki_generated_files.storage_type IS 'Where the file content is stored: database or storage';
COMMENT ON COLUMN public.kiki_generated_files.storage_url IS 'Public URL for storage files';
COMMENT ON COLUMN public.kiki_generated_files.compressed IS 'Whether the content is compressed';
COMMENT ON COLUMN public.kiki_generated_files.expires_at IS 'When the file should be cleaned up';

-- Grant necessary permissions (if using service role)
-- GRANT ALL ON public.kiki_generated_files TO service_role;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;