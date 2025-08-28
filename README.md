# 🚀 KIKI - Distribuidor de System Prompts Profesionales

**SISTEMA REFACTORIZADO** - Plataforma pedagógica que distribuye system prompts enterprise-grade para crear proyectos profesionales usando metodología Vibe Coding.

> 📚 **Navegación de Documentación**: Ver [CLAUDE.md](./CLAUDE.md) para documentación completa del sistema refactorizado.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Características Principales](#características-principales)
- [Nueva Arquitectura](#nueva-arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Desarrollo](#desarrollo)
- [Sistema de Prompts](#sistema-de-prompts)

## 🔧 Instalación

```bash
# Instalación
npm install

# Desarrollo local
npm run dev

# Servidor en: http://localhost:8888
```

## ✨ Características Principales (POST-REFACTOR)

- ✅ **System prompts dinámicos** - Carga desde archivos .md reales
- ✅ **Wizard pedagógico de 5 pasos** - Enseña conceptos de desarrollo profesional  
- ✅ **Multi-AI compatible** - ChatGPT, Claude, Perplexity, Gemini
- ✅ **Copy-to-clipboard** - Distribución directa de prompts
- ✅ **Navegación libre** - Salto entre pasos sin restricciones
- ✅ **Storage simple** - localStorage en lugar de database compleja
- ✅ **UI diferenciada** - Chat (pasos 1-3) vs IDE work (pasos 4-5)
- ✅ **Explicaciones pedagógicas** - Design Thinking, DDD, MONOREPO, DevOps

## 🏗️ Nueva Arquitectura (POST-REFACTOR)

### **ANTES vs DESPUÉS**
- ❌ **AI chat integrado** → ✅ **System prompts distribuibles**
- ❌ **Database compleja** → ✅ **localStorage simple**  
- ❌ **Vendor lock-in** → ✅ **Multi-AI compatible**
- ❌ **Sistema complejo** → ✅ **Arquitectura simple**

## 🛠️ Stack Tecnológico (SIMPLIFICADO)

- **Frontend**: Next.js 14, shadcn/ui, Tailwind CSS
- **Design System**: **neobrutalism.dev** - Sistema de diseño principal  
- **Components**: neobrutalism-components (borders negros, shadows, font-mono)
- **Storage**: localStorage (eliminó database compleja)
- **System Prompts**: Archivos .md como single source of truth
- **AI Integration**: Externa (usuario usa su AI favorito)
- **Hosting**: Vercel

## 🗂️ Sistema de Prompts

### **System Prompts Source (Single Source of Truth)**
```
/System Prompts/situaciones-usuario/01-inicio-proyecto/
├── 1-extractor-conversacional.md    # Paso 1: Consultor virtual
├── 2-formalizador-negocio.md        # Paso 2: Business Analyst  
├── 3-generador-masterplan.md        # Paso 3: Arquitecto Senior
├── 4-arquitecto-estructura.md       # Paso 4: Arquitecto de Estructura
└── 5-configurador-proyecto.md       # Paso 5: Project Operations
```

### **API Endpoints**
- `GET /api/prompts/[step]` - Retorna prompt + metadata para step específico
- **Automatic Loading**: Wizard carga dinámicamente desde archivos
- **Live Updates**: Editas .md → Se actualiza automáticamente en UI

## 🚀 Desarrollo

```bash
# Desarrollo local (puerto 8888)
npm run dev

# Build
npm run build

# Testear wizard completo
open http://localhost:8888/dashboard/projects/new
```

### **Desarrollo de Prompts**
```bash
# Editar prompts
vim "/System Prompts/situaciones-usuario/01-inicio-proyecto/[step].md"

# Test inmediato
open http://localhost:8888/new-wizard/test-project

# Los cambios se reflejan automáticamente
```

## 📚 Documentación

### **Documentos Principales**
- [Master Plan Refactor](../KIKI_REFACTOR_MASTER_PLAN.md) - Plan completo del refactor
- [Landing Page Proposal](./LANDING_PAGE_REFACTOR_PROPOSAL.md) - Cambios implementados
- [CLAUDE.md](./CLAUDE.md) - Configuración para AI assistants

### **System Prompts**
- [Extractor Conversacional](../System Prompts/situaciones-usuario/01-inicio-proyecto/1-extractor-conversacional.md)
- [Formalizador Negocio](../System Prompts/situaciones-usuario/01-inicio-proyecto/2-formalizador-negocio.md)
- [Generador MasterPlan](../System Prompts/situaciones-usuario/01-inicio-proyecto/3-generador-masterplan.md)
- [Arquitecto Estructura](../System Prompts/situaciones-usuario/01-inicio-proyecto/4-arquitecto-estructura.md)
- [Configurador Proyecto](../System Prompts/situaciones-usuario/01-inicio-proyecto/5-configurador-proyecto.md)

---

**ESTADO**: ✅ Refactor completado y funcionando - Sistema pedagógico de distribución de prompts