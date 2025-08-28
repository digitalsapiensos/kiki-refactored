# Resumen de Estructura del Proyecto Kiki (Fase 2)

## Estructura de Archivos Creados

### 📁 Configuración Base
```
kiki/
├── package.json                    # Configuración de dependencias y scripts
├── tsconfig.json                   # Configuración de TypeScript
├── next.config.js                  # Configuración de Next.js
├── tailwind.config.ts              # Configuración de Tailwind CSS
├── .gitignore                      # Archivos ignorados por Git
├── .env.example                    # Variables de entorno de ejemplo
└── README.md                       # Documentación del proyecto
```

### 📁 Aplicación Principal (`src/app/`)
```
src/app/
├── layout.tsx                      # Layout raíz de la aplicación
├── globals.css                     # Estilos globales
├── page.tsx                        # Página principal (landing)
├── (auth)/                         # Grupo de rutas de autenticación
│   ├── login/page.tsx             # Página de inicio de sesión
│   └── signup/page.tsx            # Página de registro
├── (dashboard)/                    # Grupo de rutas del dashboard
│   ├── layout.tsx                 # Layout con sidebar
│   └── dashboard/page.tsx         # Dashboard principal
├── wizard/[projectId]/            # Wizard multi-fase
│   ├── layout.tsx                 # Layout con progress stepper
│   ├── concept/page.tsx           # Fase 1: Conceptualización (Peter)
│   ├── research/page.tsx          # Fase 2: Research (Sara)
│   ├── planning/page.tsx          # Fase 3: Planificación (Tony)
│   ├── generate/page.tsx          # Fase 4: Generación (Chris)
│   └── export/page.tsx            # Fase 5: Exportación (Quentin)
├── admin/                         # Panel administrativo
│   ├── layout.tsx                 # Layout admin con navegación
│   ├── page.tsx                   # Dashboard administrativo
│   ├── users/page.tsx             # Gestión de usuarios
│   └── llm-config/page.tsx        # Configuración de LLMs
└── api/                           # API Routes
    ├── chat/route.ts              # Endpoint para chat con IA
    └── projects/route.ts          # Endpoints para proyectos
```

### 📁 Componentes (`src/components/`)
```
src/components/
└── ui/                            # Componentes de UI
    ├── chat-interface.tsx         # Interfaz de chat con IA
    ├── progress-stepper.tsx       # Stepper de progreso del wizard
    └── project-card.tsx           # Tarjeta de proyecto para dashboard
```

### 📁 Biblioteca (`src/lib/`)
```
src/lib/
├── supabase/                      # Cliente de Supabase
│   ├── client.ts                  # Cliente para browser
│   └── server.ts                  # Cliente para servidor
└── ai/                            # Proveedores de IA
    └── providers.ts               # Configuración de LLMs
```

### 📁 Tipos (`src/types/`)
```
src/types/
└── index.ts                       # Definiciones de tipos TypeScript
```

### 📁 Migraciones de Supabase
```
supabase/migrations/
├── 01_initial_schema.sql          # Esquema inicial de BD
└── 02_row_level_security.sql      # Políticas RLS
```

## Componentes y Funcionalidades por Implementar

### 🎯 Fase 1: Conceptualización
- **Asistente**: Peter
- **Archivos**: `concept/page.tsx`
- **TODOs**: Chat interface, guardado automático, lógica de conceptos

### 🔍 Fase 2: Research
- **Asistente**: Sara
- **Archivos**: `research/page.tsx`
- **TODOs**: Búsqueda de repos/MCPs/boilerplates, panel de resultados

### 📐 Fase 3: Planificación Técnica
- **Asistente**: Tony
- **Archivos**: `planning/page.tsx`
- **TODOs**: Enseñanza Vibe Coding, workflow visual, comandos

### 📝 Fase 4: Generación
- **Asistente**: Chris
- **Archivos**: `generate/page.tsx`
- **TODOs**: Generador de documentos, preview, templates

### 📦 Fase 5: Exportación
- **Asistente**: Quentin
- **Archivos**: `export/page.tsx`
- **TODOs**: Opciones de exportación, empaquetado, descarga

## Integración con shadcn/ui
Todos los componentes UI deben usar **Magic MCP** para generar componentes de shadcn/ui. No se deben crear componentes personalizados.

## Base de Datos
Las tablas de Supabase incluyen:
- `kiki_users` - Usuarios con planes y límites
- `kiki_projects` - Proyectos con fases
- `kiki_chat_messages` - Mensajes del chat
- `kiki_documents` - Documentos generados
- `kiki_llm_configs` - Configuración de LLMs
- `kiki_analytics` - Eventos de analytics

## Próximos Pasos (Fase 3)
1. Instalar dependencias con `npm install`
2. Configurar variables de entorno
3. Conectar con Supabase
4. Implementar autenticación
5. Desarrollar componentes con shadcn/ui via Magic MCP
6. Integrar proveedores de IA
7. Implementar lógica del wizard

## Notas Importantes
- TypeScript está configurado pero las dependencias no están instaladas (esperado en Fase 2)
- Todos los archivos incluyen comentarios TODO para guiar la implementación
- La estructura sigue las convenciones de Next.js 14 con App Router
- Se usa grupo de rutas `(auth)` y `(dashboard)` para organización