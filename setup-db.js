/**
 * Script para configurar la base de datos de Kiki en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://usrnpqmtxrkkhplfhngl.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcm5wcW10eHJra2hwbGZobmdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMDQ5OSwiZXhwIjoyMDU0MTg2NDk5fQ.vUSF8F_KuKOy6opu-4GETZ0AkzTHbZGrJefYrm7XeCY';

async function setupDatabase() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  console.log('🔄 Configurando base de datos de Kiki...');
  
  try {
    // Leer el archivo SQL
    const sql = fs.readFileSync('./setup-database.sql', 'utf8');
    
    // Dividir en statements individuales (simplificado)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`📝 Ejecutando ${statements.length} statements SQL...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1} failed:`, statement.substring(0, 50) + '...');
            console.log('Error:', error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    // Verificar que las tablas se crearon
    console.log('\n🔍 Verificando tablas creadas...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.log('❌ Error verificando tablas:', tablesError.message);
    } else {
      console.log('✅ Tablas encontradas:', tables?.map(t => t.table_name) || []);
    }
    
    console.log('\n🎉 ¡Configuración de base de datos completada!');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
  }
}

setupDatabase();