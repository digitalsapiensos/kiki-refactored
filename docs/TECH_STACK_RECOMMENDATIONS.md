# 🚀 Tech Stack Recommendations - KIKI Platform

**Documentación oficial del tech stack que KIKI recomienda a los usuarios durante el wizard de 5 fases**

## 🎯 Filosofía del Stack "Vibe-Friendly"

KIKI recomienda tecnologías que son:
- **AI-Friendly**: Bien conocidas por modelos como Claude para mejor asistencia
- **Rapid Development**: Permiten iteraciones rápidas con mínima configuración
- **Production Ready**: Escalables y mantenibles para productos reales
- **Well Documented**: Con abundante documentación que la IA puede consultar

---

## 📋 Stack Tecnológico por Fases

### **Fase 1 - Peter (Conceptualización)**
**Herramientas de Planificación:**
- **PRD Tool**: ChatPRD o documentos Markdown estructurados
- **User Stories**: Formato estructurado con criterios de aceptación
- **Vision Board**: Descripción clara del problema y solución

### **Fase 2 - Sara (Research & Validation)**
**Recursos Recomendados:**
- **Repositorios GitHub**: Buscar proyectos similares como inspiración
- **MCPs Sugeridos**:
  - `database-integration-mcp` - Para integraciones de BD
  - `auth-flow-mcp` - Para autenticación
  - `ui-components-mcp` - Para componentes reutilizables
- **Boilerplates**:
  - `nextjs-saas-starter` - Template SaaS con Next.js
  - `supabase-nextjs-template` - Integración Supabase + Next.js
  - `shadcn-dashboard-template` - Dashboard con shadcn/ui

### **Fase 3 - Tony (Planificación Técnica)**

#### **Frontend Stack**
```yaml
Framework: Next.js 14
Language: TypeScript
UI Library: shadcn/ui
Styling: Tailwind CSS
State Management: "@tanstack/react-query"
Icons: Lucide React
Forms: React Hook Form + Zod
```

#### **Backend/Database Stack**
```yaml
Backend-as-a-Service: Supabase
Database: PostgreSQL (via Supabase)
Authentication: Supabase Auth
File Storage: Supabase Storage
Real-time: Supabase Realtime
Functions: Supabase Edge Functions
API: Next.js API Routes (cuando se necesite lógica custom)
```

#### **AI & Development Tools**
```yaml
AI Assistant: Claude Code CLI
AI Frameworks: SuperClaude
MCPs Core:
  - Context7: Documentación de librerías
  - Sequential: Análisis complejos  
  - Magic: Generación de componentes UI
  - Playwright: Testing E2E automatizado
```

#### **Database Design Tools**
```yaml
ER Diagrams: DiagramGPT, dbdiagram.io
Schema Management: Supabase Schema Editor
AI Schema Generator: ChartDB, Workik AI Schema Generator
Migrations: Supabase CLI
```

### **Fase 4 - Chris (Generación de Documentos)**

#### **Documentación Requerida**
```yaml
CLAUDE.md: Configuración del proyecto para Claude Code
DATABASE.md: Esquema de datos y relaciones
README.md: Setup e instrucciones de desarrollo
API_DOCS.md: Documentación de endpoints
ARCHITECTURE.md: Diagramas de arquitectura
.env.example: Variables de entorno template
```

#### **Herramientas de Documentación**
```yaml
Diagramas: Mermaid, DiagramGPT
API Docs: Swagger/OpenAPI auto-generado
Screenshots: Playwright para capturas automáticas
```

### **Fase 5 - Quentin (Setup & Export)**

#### **Infraestructura y Despliegue**
```yaml
Frontend Hosting: Vercel
Database Hosting: Supabase (cloud)
CDN: Vercel Edge Network
SSL: Automático (Vercel)
Monitoring: Sentry (errores), Vercel Analytics
CI/CD: GitHub Actions + Vercel integration
```

#### **Testing Stack**
```yaml
Unit Testing: Jest + React Testing Library
E2E Testing: Playwright
Type Checking: TypeScript strict mode
Linting: ESLint + Prettier
Pre-commit: Husky + lint-staged
```

---

## 🛠️ Metodología "Vibe Coding" que Tony Enseña

### **1. Fundamentos de Vibe Coding**
```markdown
- PRD como "Prompt Requirements Document"
- Historias de usuario atómicas con criterios de aceptación
- Desarrollo iterativo con sprints de IA
- TDD (Test-Driven Development) con asistencia IA
- Commits automáticos y versionado continuo
```

### **2. Arquitectura del Proyecto**
```markdown
- Diagrama de componentes (Frontend ↔ Supabase ↔ Database)
- Definición de roles y permisos (RLS en Supabase)
- Estructura de carpetas estandarizada
- Separación clara frontend/backend/database
```

### **3. Base de Datos**
```markdown
- Diseño ER con herramientas AI
- Definición de entidades y relaciones
- Row Level Security (RLS) políticas
- Migraciones versionadas
```

### **4. Lógica del Backend**
```markdown
- API Routes de Next.js para lógica custom
- Supabase Edge Functions para operaciones complejas
- Integración con servicios externos vía MCPs
- Manejo de errores y validación
```

### **5. Documentación Técnica**
```markdown
- CLAUDE.md con configuración del proyecto
- README.md con setup completo
- Diagramas de arquitectura actualizados
- API documentation auto-generada
```

---

## ⚡ Comandos Claude Code Esenciales

### **Setup Inicial**
```bash
# Inicializar proyecto
claude
/user:build --react --typescript --tailwind

# Instalar dependencias recomendadas
npm install supabase-js @tanstack/react-query 
npx shadcn-ui@latest init
npm install lucide-react react-hook-form zod
```

### **Desarrollo Iterativo**
```bash
# Desarrollar feature específica
/user:develop [nombre-feature]

# Ejecutar tests
/user:test --unit
/user:test --e2e

# Análisis de calidad
/user:analyze --security
/user:analyze --performance
```

### **Integración y Despliegue**
```bash
# Git workflow automático
/git commit -m "feat: [descripción]"
/git push

# Despliegue
vercel deploy
supabase db push
```

### **Debugging y Mantenimiento**
```bash
# Análisis de bugs
/user:debug [descripción-error]

# Refactoring
/user:refactor [módulo]

# Metrics y rendimiento
/user:metrics
```

---

## 🔧 Configuración de Hooks Claude Code

### **Hooks Recomendados**
```json
{
  "hooks": {
    "PostToolUse": {
      "Write": "npm run lint-fix",
      "Edit": "npm run type-check"
    },
    "PostResponse": {
      "test": "npm test",
      "deploy": "vercel --prod"
    }
  }
}
```

### **Variables de Entorno Template (.env.example)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Monitoring
SENTRY_DSN=your_sentry_dsn

# AI/MCPs (si aplica)
ANTHROPIC_API_KEY=your_claude_api_key
```

---

## 📊 MCPs Específicos por Tipo de Proyecto

### **SaaS/Dashboard**
```yaml
Required:
  - Magic MCP: Componentes UI complejos
  - Context7: Documentación Next.js/Supabase
  - Sequential: Lógica de negocio compleja
  - Playwright: Testing de flujos críticos

Optional:
  - Stripe MCP: Pagos
  - Email MCP: Notificaciones
  - Analytics MCP: Métricas
```

### **E-commerce**
```yaml
Required:
  - Magic MCP: Catálogo de productos
  - Context7: Documentación commerce
  - Sequential: Lógica de carrito/checkout
  - Playwright: Testing de compra

Optional:
  - Payment MCP: Múltiples gateways
  - Inventory MCP: Gestión de stock
  - Shipping MCP: Cálculo de envíos
```

### **LMS/Comunidad**
```yaml
Required:
  - Magic MCP: Componentes educativos
  - Context7: Patrones de LMS
  - Sequential: Progreso de cursos
  - Playwright: Testing de workflows educativos

Optional:
  - Video MCP: Streaming de contenido
  - Quiz MCP: Evaluaciones
  - Certificate MCP: Generación de certificados
```

---

## 🎨 Estructura de Proyecto Recomendada

```
mi-proyecto-saas/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Componentes React
│   │   ├── ui/             # shadcn/ui components
│   │   └── features/       # Componentes específicos
│   ├── lib/                # Utilities y configuración
│   │   ├── supabase/       # Cliente Supabase
│   │   └── utils/          # Funciones utilitarias
│   ├── hooks/              # Custom React hooks
│   └── types/              # Definiciones TypeScript
├── supabase/
│   ├── migrations/         # Migraciones de DB
│   └── functions/          # Edge Functions
├── docs/
│   ├── CLAUDE.md          # Configuración Claude Code
│   ├── DATABASE.md        # Esquema de datos
│   └── API.md             # Documentación API
├── tests/
│   ├── __tests__/         # Tests unitarios
│   └── e2e/               # Tests Playwright
└── .env.example           # Variables de entorno
```

---

## 🚀 Flujo de Desarrollo Paso a Paso

### **Día 1: Setup**
1. Crear PRD con ChatPRD
2. Diseñar esquema DB con DiagramGPT
3. Configurar proyecto con Claude Code
4. Setup Supabase + Vercel

### **Día 2-3: MVP Core**
1. Implementar autenticación
2. Crear modelos de datos
3. Desarrollar UI base con shadcn/ui
4. Testing básico con Playwright

### **Día 4-5: Features**
1. Implementar historias de usuario
2. Integrar MCPs específicos
3. Tests E2E completos
4. Deploy a staging

### **Día 6: Polish & Launch**
1. QA final y bugfixes
2. Documentación completa
3. Monitoring setup
4. Deploy a producción

---

## 🔍 Criterios de Selección de Stack

### **¿Cuándo recomendar este stack?**
✅ **SÍ recomendamos cuando:**
- Proyecto SaaS moderno
- Equipo pequeño (1-5 personas)
- Necesidad de desarrollo rápido
- Presupuesto limitado para infraestructura
- Prioridad en time-to-market

❌ **NO recomendamos cuando:**
- Aplicación enterprise compleja
- Requerimientos de compliance específicos
- Necesidad de control total del backend
- Equipo grande con expertise específico

### **Alternativas por Caso de Uso**
```yaml
Mobile-First: React Native + Supabase
Enterprise: Next.js + PostgreSQL + Docker
Microservices: Next.js + Node.js + Docker
Real-time Heavy: Next.js + Supabase Realtime + Redis
```

---

## 📚 Recursos y Referencias

### **Documentación Oficial**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)

### **Templates y Boilerplates**
- [SaaS Starter Template](https://github.com/example/saas-starter)
- [Supabase Next.js Template](https://github.com/supabase/supabase/tree/master/examples/nextjs)
- [shadcn Dashboard Template](https://github.com/example/shadcn-dashboard)

### **Herramientas AI Recomendadas**
- [DiagramGPT](https://www.eraser.io/diagramgpt) - Diagramas automáticos
- [ChatPRD](https://chatprd.ai) - PRD asistido por IA
- [ChartDB](https://chartdb.io) - Diseño de esquemas DB

---

## 🎯 Métricas de Éxito

### **Desarrollo**
- ⏱️ **Time to MVP**: <7 días
- 🧪 **Test Coverage**: >80%
- 🚀 **Deploy Time**: <5 minutos
- 🐛 **Bug Rate**: <5% post-launch

### **Calidad**
- 📱 **Performance**: Lighthouse >90
- ♿ **Accessibility**: WCAG AA compliant
- 🔒 **Security**: Zero vulnerabilities críticas
- 📊 **Type Safety**: 100% TypeScript coverage

---

*Última actualización: Enero 2025*
*Mantenido por: Equipo KIKI Platform*