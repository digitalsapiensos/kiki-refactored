# Backend/Data Specification - Admin Functions

**Project**: KIKI Meta Agent System  
**Focus**: Admin Portal Backend Architecture  
**Based on**: 28-agosto documentation analysis  
**Status**: Production-ready specification

---

## 📋 EXECUTIVE SUMMARY

This document specifies the complete backend and data architecture for KIKI's admin functions, extracting requirements from the existing meta outline and logic breakdown documentation. The specification covers database schema extensions, API endpoints, data validation rules, and integration points with the current system.

**Key Components**:
- ✅ **Database Schema**: Extensions to existing tables + 3 new admin tables
- ✅ **API Endpoints**: 15 CRUD endpoints for admin operations
- ✅ **Data Validation**: Comprehensive validation rules and security policies
- ✅ **Integration Points**: DeepSeek API, Supabase real-time, file generation system

---

## 🗄️ DATABASE SCHEMA REQUIREMENTS

### Existing Tables - Extensions Required

#### `kiki_users` (EXTEND EXISTING - 9 rows)
```sql
-- Add admin-specific columns
ALTER TABLE kiki_users 
ADD COLUMN IF NOT EXISTS preferred_llm TEXT DEFAULT 'deepseek',
ADD COLUMN IF NOT EXISTS api_keys_configured JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{
  "theme": "neobrutalism",
  "contrast": "high",
  "animations": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}';

-- Update existing superadmin user
UPDATE kiki_users 
SET admin_permissions = ARRAY['prompt_edit', 'user_manage', 'analytics_view']
WHERE email = 'higinieduard@gmail.com';
```

**Admin Permissions Matrix**:
- `prompt_edit`: Edit system prompt templates
- `user_manage`: Manage user roles and permissions  
- `analytics_view`: Access to analytics dashboard
- `system_config`: System configuration access
- `audit_view`: View audit logs and admin actions

#### `kiki_projects` (EXTEND EXISTING - 7 rows)
```sql
-- Add workflow and context tracking
ALTER TABLE kiki_projects
ADD COLUMN IF NOT EXISTS workflow_type TEXT DEFAULT 'inicio-proyecto',
ADD COLUMN IF NOT EXISTS agent_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS files_manifest JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,4) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS completion_time INTERVAL;

-- Add workflow type constraint
ALTER TABLE kiki_projects 
ADD CONSTRAINT check_workflow_type 
CHECK (workflow_type IN ('inicio-proyecto', 'añadir-feature', 'refactoring', 'maintenance'));
```

#### `kiki_chat_messages` (EXTEND EXISTING - 38 rows)
```sql
-- Add agent and file tracking
ALTER TABLE kiki_chat_messages
ADD COLUMN IF NOT EXISTS agent_version TEXT,
ADD COLUMN IF NOT EXISTS context_used JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS files_generated TEXT[] DEFAULT '{}';
```

### New Tables - Complete Schema

#### `kiki_system_prompt_templates` (CRITICAL NEW TABLE)
```sql
CREATE TABLE kiki_system_prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL, -- consultor, analyst, arquitecto, writer, deployer
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 5),
  template_name TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '{}'::jsonb, -- {project_name}, {tech_stack}, etc.
  metadata JSONB DEFAULT '{
    "edit_notes": "",
    "change_log": [],
    "performance_metrics": {}
  }'::jsonb,
  created_by UUID REFERENCES kiki_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(agent_id, step_number, is_active) WHERE is_active = true,
  CONSTRAINT valid_agent_id CHECK (agent_id IN ('consultor', 'analyst', 'arquitecto', 'writer', 'deployer'))
);

-- Indexes
CREATE INDEX idx_system_prompt_active ON kiki_system_prompt_templates(is_active, agent_id);
CREATE INDEX idx_system_prompt_step ON kiki_system_prompt_templates(step_number);
```

#### `kiki_admin_actions` (AUDIT TRAIL TABLE)
```sql
CREATE TABLE kiki_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES kiki_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- prompt_update, user_role_change, system_config
  resource_type TEXT NOT NULL, -- system_prompt, user, project, system
  resource_id TEXT NOT NULL,
  action_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'prompt_create', 'prompt_update', 'prompt_activate', 'prompt_delete',
    'user_role_change', 'user_permissions_update', 'user_suspend',
    'analytics_export', 'system_config_change', 'backup_create'
  )),
  CONSTRAINT valid_resource_type CHECK (resource_type IN (
    'system_prompt', 'user', 'project', 'system', 'analytics'
  ))
);

-- Indexes for audit queries
CREATE INDEX idx_admin_actions_user_time ON kiki_admin_actions(admin_user_id, created_at DESC);
CREATE INDEX idx_admin_actions_resource ON kiki_admin_actions(resource_type, resource_id);
CREATE INDEX idx_admin_actions_time ON kiki_admin_actions(created_at DESC);
```

#### `kiki_agent_handoffs` (CONTEXT SHARING TABLE)
```sql
CREATE TABLE kiki_agent_handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  from_step INTEGER NOT NULL CHECK (from_step BETWEEN 1 AND 4),
  to_step INTEGER NOT NULL CHECK (to_step BETWEEN 2 AND 5),
  key_decisions JSONB DEFAULT '{}'::jsonb, -- Max 2KB
  generated_files TEXT[] DEFAULT '{}',
  context_summary TEXT NOT NULL, -- Auto-generated, max 1000 chars
  user_preferences JSONB DEFAULT '{
    "tech_stack_preference": [],
    "complexity_level": "medium",
    "communication_style": "professional"
  }'::jsonb,
  handoff_status TEXT DEFAULT 'pending' CHECK (handoff_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_step_sequence CHECK (to_step = from_step + 1),
  CONSTRAINT context_size_limit CHECK (char_length(context_summary) <= 1000)
);

-- Indexes
CREATE INDEX idx_agent_handoffs_project ON kiki_agent_handoffs(project_id, from_step, to_step);
CREATE INDEX idx_agent_handoffs_status ON kiki_agent_handoffs(handoff_status, created_at);
```

#### `kiki_generated_files` (FILE TRACKING TABLE)
```sql
CREATE TABLE kiki_generated_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES kiki_chat_messages(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_content TEXT, -- For files < 100KB
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  step_generated INTEGER CHECK (step_generated BETWEEN 1 AND 5),
  storage_location TEXT DEFAULT 'database' CHECK (storage_location IN ('database', 'storage', 'hybrid')),
  is_included_in_zip BOOLEAN DEFAULT true,
  generation_metadata JSONB DEFAULT '{
    "llm_model": "",
    "generation_time_ms": 0,
    "tokens_used": 0,
    "quality_score": 0
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT file_type_valid CHECK (file_type IN ('md', 'json', 'js', 'ts', 'tsx', 'css', 'html', 'txt', 'zip')),
  CONSTRAINT storage_logic CHECK (
    (file_size <= 102400 AND storage_location = 'database' AND file_content IS NOT NULL) OR
    (file_size > 102400 AND storage_location IN ('storage', 'hybrid') AND file_content IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_generated_files_project ON kiki_generated_files(project_id, step_generated);
CREATE INDEX idx_generated_files_size ON kiki_generated_files(file_size, storage_location);
```

#### `kiki_file_storage` (ROUTING TABLE)
```sql
CREATE TABLE kiki_file_storage (
  file_id UUID PRIMARY KEY REFERENCES kiki_generated_files(id) ON DELETE CASCADE,
  storage_method TEXT NOT NULL CHECK (storage_method IN ('database', 'supabase_storage', 'external_cdn')),
  storage_path TEXT,
  compression_used BOOLEAN DEFAULT false,
  access_pattern TEXT DEFAULT 'private' CHECK (access_pattern IN ('private', 'public', 'temporary')),
  cleanup_after TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  cost_estimate DECIMAL(8,4) DEFAULT 0.0001,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT storage_path_required CHECK (
    (storage_method = 'database') OR 
    (storage_method != 'database' AND storage_path IS NOT NULL)
  )
);

-- Index for cleanup job
CREATE INDEX idx_file_storage_cleanup ON kiki_file_storage(cleanup_after) WHERE cleanup_after < NOW() + INTERVAL '1 day';
```

### Row Level Security Policies

#### Admin Portal Access
```sql
-- Only superadmin can access system prompts management
CREATE POLICY "superadmin_only_system_prompts" ON kiki_system_prompt_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM kiki_users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- Admin actions: only superadmin can insert, all superadmins can read
CREATE POLICY "superadmin_create_admin_actions" ON kiki_admin_actions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM kiki_users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "superadmin_read_admin_actions" ON kiki_admin_actions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM kiki_users 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);
```

#### Project Data Access
```sql
-- Project extensions: owner + superadmin
CREATE POLICY "project_data_access" ON kiki_projects
FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM kiki_users WHERE id = auth.uid() AND role = 'superadmin')
);

-- Generated files: via project ownership
CREATE POLICY "files_via_project_ownership" ON kiki_generated_files
FOR ALL USING (
  project_id IN (
    SELECT id FROM kiki_projects 
    WHERE user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM kiki_users WHERE id = auth.uid() AND role = 'superadmin')
  )
);
```

---

## 🔌 API ENDPOINTS SPECIFICATION

### Admin System Prompts Management

#### **GET** `/api/admin/system-prompts`
```typescript
// List all system prompt templates
interface SystemPromptsResponse {
  prompts: {
    id: string;
    agent_id: string;
    step_number: number;
    template_name: string;
    prompt_content: string;
    version: number;
    is_active: boolean;
    variables: Record<string, any>;
    metadata: {
      edit_notes: string;
      change_log: string[];
      performance_metrics: Record<string, number>;
    };
    created_at: string;
    activated_at?: string;
  }[];
  total: number;
  by_agent: Record<string, number>;
}

// Query parameters
interface SystemPromptsQuery {
  agent_id?: string;
  step_number?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
```

#### **POST** `/api/admin/system-prompts`
```typescript
// Create new system prompt template
interface CreateSystemPromptRequest {
  agent_id: 'consultor' | 'analyst' | 'arquitecto' | 'writer' | 'deployer';
  step_number: 1 | 2 | 3 | 4 | 5;
  template_name: string;
  prompt_content: string;
  variables?: Record<string, any>;
  metadata?: {
    edit_notes?: string;
    expected_outputs?: string[];
    performance_targets?: Record<string, number>;
  };
}

interface CreateSystemPromptResponse {
  success: boolean;
  prompt: SystemPromptTemplate;
  message: string;
}
```

#### **PUT** `/api/admin/system-prompts/[id]`
```typescript
// Update existing prompt template
interface UpdateSystemPromptRequest {
  template_name?: string;
  prompt_content?: string;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  change_notes: string; // Required for version history
}

interface UpdateSystemPromptResponse {
  success: boolean;
  prompt: SystemPromptTemplate;
  version_created: number;
  message: string;
}
```

#### **POST** `/api/admin/system-prompts/[id]/activate`
```typescript
// Activate a prompt template (deactivates others for same agent/step)
interface ActivatePromptResponse {
  success: boolean;
  activated_prompt: SystemPromptTemplate;
  deactivated_prompt?: SystemPromptTemplate;
  message: string;
}
```

#### **GET** `/api/admin/system-prompts/[id]/versions`
```typescript
// Get version history for a prompt
interface PromptVersionsResponse {
  versions: {
    id: string;
    version: number;
    content: string;
    change_notes: string;
    created_by: string;
    created_at: string;
  }[];
  current_version: number;
  total_versions: number;
}
```

### User Management Endpoints

#### **GET** `/api/admin/users`
```typescript
// List and manage users
interface AdminUsersResponse {
  users: {
    id: string;
    email: string;
    full_name?: string;
    role: 'user' | 'admin' | 'superadmin';
    plan: 'free' | 'pro' | 'enterprise';
    preferred_llm: string;
    admin_permissions: string[];
    project_count: number;
    total_cost: number;
    last_active: string;
    created_at: string;
  }[];
  total: number;
  role_distribution: Record<string, number>;
}

interface AdminUsersQuery {
  role?: string;
  plan?: string;
  search?: string; // email or name search
  sort_by?: 'created_at' | 'last_active' | 'project_count' | 'total_cost';
  page?: number;
  limit?: number;
}
```

#### **PUT** `/api/admin/users/[id]/role`
```typescript
// Change user role
interface ChangeUserRoleRequest {
  role: 'user' | 'admin' | 'superadmin';
  admin_permissions?: string[]; // Required if role is admin/superadmin
  reason: string;
}

interface ChangeUserRoleResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    admin_permissions: string[];
  };
  audit_log_id: string;
  message: string;
}
```

### Analytics & Audit Endpoints

#### **GET** `/api/admin/analytics/dashboard`
```typescript
// Admin dashboard analytics
interface AdminDashboardResponse {
  metrics: {
    total_users: number;
    active_users_30d: number;
    total_projects: number;
    completed_projects: number;
    avg_completion_time: string;
    total_llm_cost: number;
    popular_workflows: Array<{
      workflow_type: string;
      count: number;
      avg_completion_time: string;
    }>;
  };
  agent_performance: Array<{
    agent_id: string;
    step_number: number;
    usage_count: number;
    avg_response_time_ms: number;
    satisfaction_score: number;
    common_issues: string[];
  }>;
  system_health: {
    database_connections: number;
    storage_usage_gb: number;
    api_response_times: Record<string, number>;
    error_rate_24h: number;
  };
}
```

#### **GET** `/api/admin/audit-logs`
```typescript
// Admin audit trail
interface AuditLogsResponse {
  logs: {
    id: string;
    admin_user_id: string;
    admin_email: string;
    action_type: string;
    resource_type: string;
    resource_id: string;
    action_data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    error_message?: string;
    created_at: string;
  }[];
  total: number;
  filters_applied: Record<string, any>;
}

interface AuditLogsQuery {
  admin_user_id?: string;
  action_type?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  success?: boolean;
  page?: number;
  limit?: number;
}
```

### File Generation Tracking Endpoints

#### **GET** `/api/admin/generated-files`
```typescript
// Track generated files across all projects
interface GeneratedFilesResponse {
  files: {
    id: string;
    project_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    step_generated: number;
    storage_location: string;
    generation_metadata: {
      llm_model: string;
      generation_time_ms: number;
      tokens_used: number;
      quality_score: number;
    };
    created_at: string;
  }[];
  total: number;
  storage_stats: {
    database_files: number;
    storage_files: number;
    total_size_mb: number;
    avg_generation_time_ms: number;
  };
}
```

#### **POST** `/api/admin/files/cleanup`
```typescript
// Trigger cleanup of old files
interface FileCleanupRequest {
  older_than_days: number;
  storage_type?: 'database' | 'storage' | 'all';
  dry_run?: boolean;
}

interface FileCleanupResponse {
  success: boolean;
  files_cleaned: number;
  space_freed_mb: number;
  cost_savings: number;
  summary: {
    database_files_cleaned: number;
    storage_files_cleaned: number;
  };
}
```

---

## ✅ DATA VALIDATION RULES

### System Prompt Validation
```typescript
// System prompt content validation
const systemPromptValidation = z.object({
  agent_id: z.enum(['consultor', 'analyst', 'arquitecto', 'writer', 'deployer']),
  step_number: z.number().int().min(1).max(5),
  template_name: z.string().min(3).max(100),
  prompt_content: z.string()
    .min(100) // Minimum viable prompt
    .max(50000) // Token limit consideration
    .refine(content => {
      // Must contain agent personality markers
      return content.includes('You are') || content.includes('Your role');
    }, "Prompt must define agent personality"),
  variables: z.record(z.any()).optional(),
  metadata: z.object({
    edit_notes: z.string().max(500).optional(),
    expected_outputs: z.array(z.string()).optional(),
    performance_targets: z.record(z.number()).optional(),
  }).optional()
});
```

### User Role Change Validation
```typescript
// User role modification validation
const userRoleChangeValidation = z.object({
  role: z.enum(['user', 'admin', 'superadmin']),
  admin_permissions: z.array(z.enum([
    'prompt_edit', 'user_manage', 'analytics_view', 
    'system_config', 'audit_view'
  ])).optional(),
  reason: z.string().min(10).max(200)
}).refine(data => {
  // Admin/superadmin roles require permissions
  if (['admin', 'superadmin'].includes(data.role)) {
    return data.admin_permissions && data.admin_permissions.length > 0;
  }
  return true;
}, "Admin roles require at least one permission");
```

### File Generation Metadata Validation
```typescript
// File generation tracking validation
const fileGenerationValidation = z.object({
  file_name: z.string().min(1).max(255),
  file_size: z.number().int().min(0).max(100 * 1024 * 1024), // 100MB limit
  file_type: z.enum(['md', 'json', 'js', 'ts', 'tsx', 'css', 'html', 'txt', 'zip']),
  step_generated: z.number().int().min(1).max(5),
  generation_metadata: z.object({
    llm_model: z.string(),
    generation_time_ms: z.number().int().min(0),
    tokens_used: z.number().int().min(0),
    quality_score: z.number().min(0).max(100)
  })
});
```

### Cost Tracking Validation
```typescript
// Usage and cost validation
const costTrackingValidation = z.object({
  project_id: z.string().uuid(),
  llm_provider: z.enum(['deepseek', 'openai', 'anthropic']),
  tokens_input: z.number().int().min(0),
  tokens_output: z.number().int().min(0),
  cost_usd: z.number().min(0).max(100), // Per-request limit
  request_type: z.enum(['chat', 'generation', 'analysis']),
  response_time_ms: z.number().int().min(0)
});
```

---

## 🔗 INTEGRATION POINTS

### DeepSeek API Integration
```typescript
// DeepSeek API configuration and usage tracking
interface DeepSeekIntegration {
  api_key: string; // Encrypted storage
  model: 'deepseek-chat' | 'deepseek-coder';
  base_url: 'https://api.deepseek.com/v1';
  
  // Usage tracking
  track_usage: boolean;
  cost_per_1k_input: number; // $0.0014
  cost_per_1k_output: number; // $0.0028
  
  // Rate limiting
  requests_per_minute: number; // 60
  tokens_per_minute: number; // 200000
  
  // Response configuration
  max_tokens: number; // 8192
  temperature: number; // 0.7
  top_p: number; // 0.9
}

// Integration middleware for cost tracking
async function trackDeepSeekUsage(
  project_id: string,
  request_data: any,
  response_data: any,
  cost_usd: number
) {
  await supabase.from('kiki_llm_usage').insert({
    project_id,
    provider: 'deepseek',
    model: request_data.model,
    tokens_input: response_data.usage.prompt_tokens,
    tokens_output: response_data.usage.completion_tokens,
    cost_usd,
    request_type: 'chat',
    created_at: new Date().toISOString()
  });
  
  // Update project total cost
  await supabase.rpc('increment_project_cost', {
    p_project_id: project_id,
    p_cost_increment: cost_usd
  });
}
```

### Supabase Real-time Updates
```typescript
// Real-time subscriptions for admin portal
interface AdminRealtimeChannels {
  // System prompt updates
  system_prompts: {
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    table: 'kiki_system_prompt_templates';
    filters: { is_active: true };
  };
  
  // Admin actions audit
  admin_actions: {
    event: 'INSERT';
    table: 'kiki_admin_actions';
    filters: {}; // All admin actions
  };
  
  // User role changes
  user_changes: {
    event: 'UPDATE';
    table: 'kiki_users';
    filters: { role: 'in.(admin,superadmin)' };
  };
}

// Real-time notification system
const setupAdminRealtime = () => {
  supabase
    .channel('admin-portal')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'kiki_system_prompt_templates' 
      },
      (payload) => {
        // Notify admin UI of prompt changes
        notifyAdminUI('system_prompt_changed', payload);
      }
    )
    .subscribe();
};
```

### File Generation System Integration
```typescript
// File generation workflow integration
interface FileGenerationIntegration {
  // Storage routing logic
  determineStorageMethod(fileSize: number, fileType: string): 'database' | 'storage' {
    if (fileSize <= 100 * 1024) return 'database'; // 100KB threshold
    return 'storage';
  }
  
  // File generation with tracking
  async generateFile(
    project_id: string,
    step_number: number,
    llm_prompt: string,
    file_type: string
  ): Promise<GeneratedFileResult> {
    const start_time = Date.now();
    
    // Generate content via LLM
    const response = await deepseek.generate({
      prompt: llm_prompt,
      model: 'deepseek-coder'
    });
    
    const generation_time = Date.now() - start_time;
    const file_content = response.content;
    const file_size = Buffer.byteLength(file_content, 'utf8');
    
    // Store based on size
    const storage_method = this.determineStorageMethod(file_size, file_type);
    
    // Create file record
    const file_record = await supabase.from('kiki_generated_files').insert({
      project_id,
      file_name: `step_${step_number}_output.${file_type}`,
      file_content: storage_method === 'database' ? file_content : null,
      file_size,
      file_type,
      step_generated: step_number,
      storage_location: storage_method,
      generation_metadata: {
        llm_model: 'deepseek-coder',
        generation_time_ms: generation_time,
        tokens_used: response.usage.total_tokens,
        quality_score: this.calculateQualityScore(file_content, file_type)
      }
    }).select().single();
    
    // Handle storage routing
    if (storage_method === 'storage') {
      const storage_path = `projects/${project_id}/step_${step_number}/${file_record.id}`;
      
      await supabase.storage
        .from('generated-files')
        .upload(storage_path, file_content);
        
      await supabase.from('kiki_file_storage').insert({
        file_id: file_record.id,
        storage_method: 'supabase_storage',
        storage_path,
        cleanup_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }
    
    return file_record;
  }
}
```

### Agent Context Sharing Integration
```typescript
// Agent handoff system integration
interface AgentContextIntegration {
  // Create handoff between agents
  async createAgentHandoff(
    project_id: string,
    from_step: number,
    to_step: number,
    context_data: any
  ): Promise<AgentHandoff> {
    // Analyze conversation for key decisions
    const key_decisions = await this.extractKeyDecisions(context_data.conversation);
    
    // Generate context summary
    const context_summary = await this.generateContextSummary(
      context_data.conversation,
      context_data.generated_files
    );
    
    // Detect user preferences
    const user_preferences = await this.detectUserPreferences(context_data.conversation);
    
    const handoff = await supabase.from('kiki_agent_handoffs').insert({
      project_id,
      from_step,
      to_step,
      key_decisions,
      generated_files: context_data.generated_files.map(f => f.file_name),
      context_summary,
      user_preferences,
      handoff_status: 'completed'
    }).select().single();
    
    return handoff;
  }
  
  // Load context for incoming agent
  async loadAgentContext(project_id: string, step_number: number): Promise<AgentContext> {
    const handoff = await supabase
      .from('kiki_agent_handoffs')
      .select('*')
      .eq('project_id', project_id)
      .eq('to_step', step_number)
      .single();
      
    const previous_files = await supabase
      .from('kiki_generated_files')
      .select('file_name, file_type, generation_metadata')
      .eq('project_id', project_id)
      .lt('step_generated', step_number)
      .order('step_generated');
      
    return {
      handoff_context: handoff,
      previous_files,
      user_preferences: handoff.user_preferences,
      project_history: await this.getProjectHistory(project_id)
    };
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### Admin Access Control
```typescript
// Multi-layer admin security
interface AdminSecurityLayers {
  // 1. Authentication verification
  async verifyAuthentication(request: NextRequest): Promise<User | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  // 2. Role-based authorization
  async checkAdminRole(user_id: string, required_role: 'admin' | 'superadmin'): Promise<boolean> {
    const { data } = await supabase
      .from('kiki_users')
      .select('role, admin_permissions')
      .eq('id', user_id)
      .single();
      
    if (!data) return false;
    
    if (required_role === 'superadmin') {
      return data.role === 'superadmin';
    }
    
    return ['admin', 'superadmin'].includes(data.role);
  }
  
  // 3. Permission-based access
  async checkAdminPermission(user_id: string, permission: string): Promise<boolean> {
    const { data } = await supabase
      .from('kiki_users')
      .select('admin_permissions')
      .eq('id', user_id)
      .single();
      
    return data?.admin_permissions?.includes(permission) || false;
  }
  
  // 4. Audit logging
  async logAdminAction(
    admin_user_id: string,
    action_type: string,
    resource_type: string,
    resource_id: string,
    action_data: any,
    request: NextRequest
  ) {
    await supabase.from('kiki_admin_actions').insert({
      admin_user_id,
      action_type,
      resource_type,
      resource_id,
      action_data,
      ip_address: request.ip || request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent'),
      session_id: request.headers.get('x-session-id')
    });
  }
}
```

### Data Encryption & Privacy
```typescript
// Sensitive data handling
interface DataSecurityMeasures {
  // API key encryption
  async encryptAPIKey(api_key: string): Promise<string> {
    return await encrypt(api_key, process.env.ENCRYPTION_KEY);
  }
  
  async decryptAPIKey(encrypted_key: string): Promise<string> {
    return await decrypt(encrypted_key, process.env.ENCRYPTION_KEY);
  }
  
  // PII data handling
  async sanitizeUserData(user_data: any): Promise<any> {
    // Remove sensitive fields from logs
    const sanitized = { ...user_data };
    delete sanitized.api_keys;
    delete sanitized.session_tokens;
    return sanitized;
  }
  
  // Audit data retention
  async cleanupOldAuditLogs(): Promise<void> {
    // Keep audit logs for 1 year
    await supabase
      .from('kiki_admin_actions')
      .delete()
      .lt('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
  }
}
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Database Query Optimization
```sql
-- Optimized queries for admin operations

-- System prompts with usage stats
CREATE VIEW admin_system_prompts_with_stats AS
SELECT 
  sp.*,
  COUNT(cm.id) as usage_count,
  AVG(EXTRACT(EPOCH FROM cm.response_time)) as avg_response_time_seconds,
  MAX(cm.created_at) as last_used
FROM kiki_system_prompt_templates sp
LEFT JOIN kiki_chat_messages cm ON sp.agent_id = cm.agent_used 
  AND sp.step_number = cm.step_number
WHERE sp.is_active = true
GROUP BY sp.id;

-- User activity summary
CREATE VIEW admin_user_activity_summary AS
SELECT 
  u.id,
  u.email,
  u.role,
  u.plan,
  COUNT(DISTINCT p.id) as project_count,
  COUNT(DISTINCT cm.id) as message_count,
  SUM(p.total_cost) as total_cost,
  MAX(cm.created_at) as last_active
FROM kiki_users u
LEFT JOIN kiki_projects p ON u.id = p.user_id
LEFT JOIN kiki_chat_messages cm ON p.id = cm.project_id
GROUP BY u.id, u.email, u.role, u.plan;
```

### Caching Strategy
```typescript
// Admin portal caching
interface AdminCacheStrategy {
  // Cache frequently accessed data
  cache_keys: {
    system_prompts: 'admin:system_prompts:all';
    user_stats: 'admin:users:stats';
    dashboard_metrics: 'admin:dashboard:metrics';
    audit_logs: 'admin:audit_logs:recent';
  };
  
  // Cache TTL settings
  cache_ttl: {
    system_prompts: 300; // 5 minutes
    user_stats: 600; // 10 minutes  
    dashboard_metrics: 180; // 3 minutes
    audit_logs: 60; // 1 minute
  };
  
  // Smart cache invalidation
  async invalidateCache(cache_pattern: string): Promise<void> {
    // Invalidate related cache keys when data changes
    await redis.del(redis.keys(cache_pattern));
  }
}
```

---

## 🎯 SUCCESS METRICS

### Admin Portal KPIs
```typescript
// Measurable success criteria
interface AdminPortalKPIs {
  performance_metrics: {
    admin_dashboard_load_time: '<2 seconds';
    system_prompt_update_time: '<5 seconds';
    user_search_response_time: '<1 second';
    audit_log_query_time: '<3 seconds';
  };
  
  usability_metrics: {
    admin_task_completion_rate: '>95%';
    average_prompt_update_time: '<10 minutes';
    user_management_error_rate: '<1%';
    admin_satisfaction_score: '>4.5/5';
  };
  
  system_health_metrics: {
    admin_api_uptime: '>99.9%';
    database_query_success_rate: '>99.5%';
    audit_log_completeness: '100%';
    security_incident_rate: '0 per month';
  };
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Database Setup
- [ ] **Schema Extensions**: Add columns to existing tables
- [ ] **New Tables**: Create 5 new admin-specific tables  
- [ ] **Indexes**: Add performance indexes for admin queries
- [ ] **RLS Policies**: Implement security policies
- [ ] **Views**: Create optimized admin views
- [ ] **Functions**: Add database functions for complex operations

### API Implementation
- [ ] **System Prompts API**: 6 endpoints for prompt management
- [ ] **User Management API**: 3 endpoints for user administration
- [ ] **Analytics API**: 2 endpoints for dashboard data
- [ ] **Audit API**: 2 endpoints for audit trail access
- [ ] **File Management API**: 2 endpoints for file operations

### Security Implementation  
- [ ] **Authentication Middleware**: Verify admin access
- [ ] **Permission Checking**: Granular permission validation
- [ ] **Audit Logging**: Comprehensive action logging
- [ ] **Data Encryption**: API key and sensitive data encryption
- [ ] **Rate Limiting**: Prevent abuse of admin endpoints

### Integration Testing
- [ ] **DeepSeek Integration**: Test AI provider integration
- [ ] **Real-time Updates**: Test Supabase subscriptions
- [ ] **File Generation**: Test storage routing logic
- [ ] **Context Handoffs**: Test agent context sharing
- [ ] **Cost Tracking**: Test usage and billing tracking

---

**Implementation Status**: Ready for development  
**Estimated Timeline**: 2-3 weeks for full implementation  
**Dependencies**: Existing system architecture (complete)  
**Risk Level**: Low - well-defined specifications with existing foundation