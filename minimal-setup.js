/**
 * Script mínimo para configurar las tablas esenciales en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://usrnpqmtxrkkhplfhngl.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcm5wcW10eHJra2hwbGZobmdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMDQ5OSwiZXhwIjoyMDU0MTg2NDk5fQ.vUSF8F_KuKOy6opu-4GETZ0AkzTHbZGrJefYrm7XeCY';

async function createMinimalTables() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  console.log('🔄 Creando tablas mínimas para Kiki...');
  
  try {
    // Crear tabla kiki_users
    console.log('📝 Creando tabla kiki_users...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS kiki_users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          full_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE kiki_users ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON kiki_users
          FOR SELECT USING (auth.uid() = id);
      `
    });
    
    if (usersError) {
      console.log('❌ Error creando kiki_users:', usersError.message);
    } else {
      console.log('✅ Tabla kiki_users creada');
    }
    
    // Crear tabla kiki_projects
    console.log('📝 Creando tabla kiki_projects...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS kiki_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES kiki_users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          current_phase INTEGER DEFAULT 1,
          phase_data JSONB DEFAULT '{}'::jsonb,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE kiki_projects ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view own projects" ON kiki_projects
          FOR SELECT USING (user_id = auth.uid());
          
        CREATE POLICY IF NOT EXISTS "Users can create projects" ON kiki_projects
          FOR INSERT WITH CHECK (user_id = auth.uid());
          
        CREATE POLICY IF NOT EXISTS "Users can update own projects" ON kiki_projects
          FOR UPDATE USING (user_id = auth.uid());
      `
    });
    
    if (projectsError) {
      console.log('❌ Error creando kiki_projects:', projectsError.message);
    } else {
      console.log('✅ Tabla kiki_projects creada');
    }
    
    // Crear tabla kiki_chat_messages
    console.log('📝 Creando tabla kiki_chat_messages...');
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS kiki_chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES kiki_projects(id) ON DELETE CASCADE,
          phase INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          provider TEXT,
          model TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE kiki_chat_messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view messages from own projects" ON kiki_chat_messages
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM kiki_projects 
              WHERE id = project_id AND user_id = auth.uid()
            )
          );
          
        CREATE POLICY IF NOT EXISTS "Users can create messages in own projects" ON kiki_chat_messages
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM kiki_projects 
              WHERE id = project_id AND user_id = auth.uid()
            )
          );
      `
    });
    
    if (messagesError) {
      console.log('❌ Error creando kiki_chat_messages:', messagesError.message);
    } else {
      console.log('✅ Tabla kiki_chat_messages creada');
    }
    
    // Crear función para auto-crear usuario
    console.log('📝 Creando función handle_new_user...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.kiki_users (id, email, full_name)
          VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
          ON CONFLICT (id) DO NOTHING;
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    });
    
    if (functionError) {
      console.log('❌ Error creando función:', functionError.message);
    } else {
      console.log('✅ Función handle_new_user creada');
    }
    
    console.log('\n🎉 ¡Configuración mínima completada!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createMinimalTables();