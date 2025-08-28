# 🎨 PROPUESTA DE REFACTOR - LANDING PAGE KIKI

**Estado Actual**: Funcional en localhost:8888  
**Objetivo**: Eliminar referencias al AI chat, mantener estructura de wizard guiado

---

## 🎯 **CAMBIOS ESPECÍFICOS EN EL COPY**

### **HERO SECTION**
```typescript
// ANTES:
"Tu compañero para crear aplicaciones profesionales usando metodología Vibe Coding"

// DESPUÉS (agregar):
"Tu compañero para crear aplicaciones profesionales usando metodología Vibe Coding"
"De idea vaga → Proyecto completo listo para programar"
```

### **FEATURES SECTION - 6 CARDS**

#### **Card 1: Eliminar AI Especializado**
```typescript
// ANTES:
{
  icon: MessageSquare,
  title: "Asistentes IA Especializados",
  description: "Cinco expertos digitales que te guían paso a paso en cada fase del desarrollo"
}

// DESPUÉS:
{
  icon: Rocket,
  title: "Proceso Guiado Paso a Paso",
  description: "Te llevamos desde \"tengo una idea\" hasta \"proyecto listo para programar\" con metodología probada"
}
```

#### **Card 2: Mantener Vibe Coding**
```typescript
// MANTENER IGUAL:
{
  icon: Code2,
  title: "Metodología 'Vibe Coding'",
  description: "Construye primero, aprende después. Resultados rápidos sin complejidad innecesaria."
}
```

#### **Card 3: Mantener Just-in-Time**
```typescript
// MANTENER IGUAL:
{
  icon: BookOpen,
  title: "Aprendizaje Just-in-Time", 
  description: "Información precisa en el momento exacto que la necesitas, sin sobrecarga"
}
```

#### **Card 4: Mantener Accesible**
```typescript
// MANTENER IGUAL:
{
  icon: Users,
  title: "Accesible para Todos",
  description: "Democratizamos el desarrollo. Tu creatividad es más valiosa que tu experiencia técnica."
}
```

#### **Card 5: Refinar Resultado**
```typescript
// ANTES:
{
  icon: Rocket,
  title: "De la Idea al Prototipo",
  description: "Transformamos conceptos en prototipos funcionales con documentación profesional"
}

// DESPUÉS:
{
  icon: Package,
  title: "Estructura Completa",
  description: "Carpetas, archivos stub, configuraciones y TODOs específicos listos para programar"
}
```

#### **Card 6: Cambiar IA Práctica**
```typescript
// ANTES:
{
  icon: Sparkles,
  title: "IA Práctica",
  description: "Herramientas inteligentes que potencian tu creatividad sin complejidad técnica"
}

// DESPUÉS:
{
  icon: CheckCircle,
  title: "Backlog y Documentación",
  description: "BACKLOG.md, STATUS_LOG.md, comandos Claude y toda la documentación operativa"
}
```

### **PROCESS SECTION - TU VIAJE EN 5 FASES**

#### **Cambios en las Descriptions:**
```typescript
// ANTES - Paso 1:
{ phase: 1, name: "Conceptualización", assistant: "Peter", 
  subtitle: "Define claramente tu visión y objetivos del proyecto" }

// DESPUÉS - Paso 1:
{ phase: 1, name: "Conversación de Negocio", role: "📝 Consultor virtual",
  subtitle: "Extraemos y clarificamos tu idea mediante preguntas guiadas estructuradas",
  output: "conversation_summary.md" }

// ANTES - Paso 2:
{ phase: 2, name: "Investigación", assistant: "Sara",
  subtitle: "Análisis de mercado y validación de la propuesta" }

// DESPUÉS - Paso 2:
{ phase: 2, name: "Formalización de Negocio", role: "📝 Business Analyst",
  subtitle: "Transformamos la conversación en documentos estructurados de negocio",
  output: "3 documentos de negocio formales" }

// ANTES - Paso 3:
{ phase: 3, name: "Planificación Técnica", assistant: "Tony",
  subtitle: "Arquitectura y stack tecnológico optimizado" }

// DESPUÉS - Paso 3:
{ phase: 3, name: "Master Plan Técnico", role: "📝 Arquitecto Senior", 
  subtitle: "Creamos hoja de ruta completa con stack tecnológico y arquitectura",
  output: "masterplan.md completo" }

// ANTES - Paso 4:
{ phase: 4, name: "Documentación", assistant: "Chris",
  subtitle: "Especificaciones técnicas y guías de usuario" }

// DESPUÉS - Paso 4:
{ phase: 4, name: "Estructura del Proyecto", role: "📝 Arquitecto de Estructura",
  subtitle: "Generamos andamiaje completo con carpetas y archivos stub organizados",
  output: "Proyecto estructurado" }

// ANTES - Paso 5:
{ phase: 5, name: "Implementación", assistant: "Quentin",
  subtitle: "Despliegue y puesta en producción" }

// DESPUÉS - Paso 5:
{ phase: 5, name: "Configuración Operativa", role: "📝 Project Operations",
  subtitle: "Configuramos backlog, tracking y sistema operativo del proyecto",
  output: "Proyecto listo para desarrollo" }
```

### **CTA SECTION - Refinar Messaging**

```typescript
// ANTES:
"¿Listo para crear tu próximo proyecto?"
"Únete a quienes han elegido la eficiencia sobre la complejidad innecesaria."
"La creatividad no requiere años de experiencia técnica."

// DESPUÉS:
"¿Listo para convertir tu idea en proyecto?"
"2-4 horas de trabajo guiado = Proyecto completo listo para programar"
"La creatividad no requiere años de experiencia técnica." // MANTENER
```

---

## 📋 **IMPLEMENTACIÓN TÉCNICA**

### **Nuevos Imports Necesarios:**
```typescript
import { 
  Sparkles,     // mantener
  Users,        // mantener
  Rocket,       // mantener para paso a paso
  BookOpen,     // mantener 
  Code2,        // mantener
  MessageSquare,// eliminar de features, mantener para CTA
  Target,       // NUEVO - para paso a paso
  Bot,          // NUEVO - para IA como herramienta  
  Package,      // NUEVO - para estructura
  CheckCircle,  // NUEVO - para backlog
  FileText      // NUEVO - para outputs
} from 'lucide-react'
```

### **Nueva Data Structure:**
```typescript
const processSteps = [
  { 
    step: 1, 
    name: "Conversación de Negocio", 
    role: "📝 Consultor virtual",
    description: "Extraemos y clarificamos tu idea mediante preguntas guiadas estructuradas",
    output: "conversation_summary.md"
  },
  // ... resto de pasos
]
```

---

## 🎨 **WIREFRAME FINAL DE LA NUEVA LANDING**

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                               🟡 HERO AMARILLO                               │
│                                                                               │
│                                   KIKI                                        │
│                                                                               │
│         Tu compañero para crear aplicaciones profesionales                   │
│                   usando metodología Vibe Coding                             │
│                                                                               │
│        De idea vaga → Proyecto completo listo para programar                 │
│                                                                               │
│           [  Comenzar Gratis  ]    [  Iniciar Sesión  ]                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                    🔵 ¿Por qué KIKI y no otro tutorial?                      │
│                                                                               │
│  🚀 PROCESO GUIADO      ⚡ METODOLOGÍA       🤖 IA COMO                      │
│     PASO A PASO           'VIBE CODING'        HERRAMIENTA                   │
│  Te llevamos desde      Construye primero,   Usa tu AI favorito             │
│  "idea" hasta           aprende después      (ChatGPT, Claude, etc.)        │
│  "proyecto listo"                            con nuestros prompts           │
│                                                                               │
│  👥 ACCESIBLE PARA      📦 ESTRUCTURA        ✅ BACKLOG Y                    │
│     TODOS                  COMPLETA             DOCUMENTACIÓN                │
│  Tu creatividad >       Carpetas, archivos,  BACKLOG.md,                   │
│  experiencia técnica    configs y TODOs      STATUS_LOG.md, etc.           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                    🟢 Proceso guiado: 5 pasos (2-4 horas)                    │
│                                                                               │
│  1️⃣ CONVERSACIÓN DE NEGOCIO     📝 Consultor virtual                        │
│     Extraemos y clarificamos tu idea mediante preguntas guiadas             │
│     📤 Output: conversation_summary.md                                       │
│                                                                               │
│  2️⃣ FORMALIZACIÓN DE NEGOCIO    📝 Business Analyst                         │
│     Transformamos la conversación en documentos estructurados               │
│     📤 Output: 3 documentos de negocio formales                            │
│                                                                               │
│  3️⃣ MASTER PLAN TÉCNICO         📝 Arquitecto Senior                        │
│     Creamos hoja de ruta completa con stack y arquitectura                  │
│     📤 Output: masterplan.md completo                                       │
│                                                                               │
│  4️⃣ ESTRUCTURA DEL PROYECTO     📝 Arquitecto de Estructura                 │
│     Generamos andamiaje completo con carpetas y archivos stub               │
│     📤 Output: Proyecto estructurado                                        │
│                                                                               │
│  5️⃣ CONFIGURACIÓN OPERATIVA     📝 Project Operations                       │
│     Configuramos backlog, tracking y sistema operativo                      │
│     📤 Output: Proyecto listo para development                              │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                          🟣 ¿Listo para convertir tu idea?                   │
│                                                                               │
│           2-4 horas de trabajo guiado = Proyecto completo                    │
│                     listo para programar                                     │
│                                                                               │
│           La creatividad no requiere años de experiencia técnica            │
│                                                                               │
│                        [ Comenzar Mi Proyecto → ]                            │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ **ESTADO DE LA PROPUESTA**

**WIREFRAMES**: ✅ Completados  
**COPY CHANGES**: ✅ Definidos  
**VISUAL DESIGN**: ✅ Mantenido (mismos colores/estructura)  
**IMPLEMENTACIÓN**: ⚠️ Pendiente (problema con TypeScript config)

**PRÓXIMO PASO**: ¿Quieres que solucione primero el problema TypeScript del proyecto o prefieres que sigamos con los wireframes del wizard interno?
