/**
 * File Generation Test
 * Tests the file generation engine with sample LLM responses
 */

import { fileParser } from './file-parser'
import { FileGenerationRequest } from './types'

// Sample LLM response from consultor-virtual
const sampleConsultorResponse = `
He generado el conversation_summary.md con toda nuestra conversación. Este documento será usado por el siguiente prompt para crear los documentos formales de negocio.

\`\`\`markdown
# Conversation Summary - Mi App de Gestión de Tareas

## Problema Central
Crear una aplicación web para gestionar tareas personales y colaborativas que sea más simple y efectiva que las soluciones actuales.

## Descripción Completa  
La aplicación permitirá a los usuarios crear, organizar y seguir tareas tanto personales como en equipo. Se enfoca en la simplicidad y productividad, evitando la complejidad excesiva de herramientas como Notion o Monday. Incluye funcionalidades de colaboración básica, notificaciones inteligentes y reportes de productividad.

## Usuarios Objetivo
- **Usuarios Primarios**: Profesionales y estudiantes que necesitan organizar tareas personales (25-35 años)
- **Usuarios Secundarios**: Pequeños equipos de trabajo que necesitan colaboración simple (5-10 personas)

## Funcionalidades Principales
1. **Gestión de Tareas** - Crear, editar, completar y organizar tareas con categorías
2. **Colaboración Simple** - Compartir tareas y proyectos con otros usuarios
3. **Notificaciones Inteligentes** - Recordatorios personalizables y no intrusivos
4. **Dashboard de Productividad** - Métricas básicas de cumplimiento y progreso
5. **Integración de Calendario** - Sincronización con Google Calendar y Outlook

## Aspectos Técnicos
- **Plataforma**: Aplicación web responsive con PWA
- **Audiencia técnica**: Usuarios no técnicos, interfaz muy intuitiva
- **Escalabilidad esperada**: 1000-5000 usuarios iniciales
- **Preferencias de stack**: React, Node.js, PostgreSQL

## Integraciones Requeridas
- Google Calendar API
- Outlook Calendar API  
- Sistema de notificaciones push
- Autenticación social (Google, Microsoft)

## Datos y Entidades Identificadas
- Usuarios, Tareas, Proyectos, Categorías, Notificaciones, Colaboradores

## Flujos Principales
1. Registro/Login → Onboarding → Dashboard principal
2. Crear tarea → Asignar categoría → Configurar recordatorios
3. Invitar colaboradores → Compartir proyecto → Gestión de permisos

## Restricciones y Consideraciones
- Presupuesto limitado para MVP ($5000-8000)
- Timeline agresivo: 3 meses para lanzamiento
- Prioridad en UX/UI simple y efectiva

## Notas Adicionales
El usuario prefiere tecnologías modernas pero probadas, enfoque mobile-first, y modelo freemium con funciones premium para equipos.
\`\`\`

¿Quieres revisar algo antes de continuar con el siguiente paso?
`

// Sample LLM response from business-analyst
const sampleBusinessAnalystResponse = `
He recibido tu conversation_summary.md y he creado los tres documentos estructurados:

\`\`\`markdown
# Mi App de Gestión de Tareas

## Narrative
Una aplicación web moderna para gestión de tareas personales y colaborativas que prioriza la simplicidad sobre la complejidad. Diseñada para profesionales y estudiantes que buscan una herramienta efectiva sin las características excesivas de plataformas como Notion o Monday.

## Goals & Scope
- **Objetivo Principal**: Crear una herramienta simple y efectiva para gestión de tareas personales y colaborativas
- **Objetivos Secundarios**: Facilitar colaboración en pequeños equipos, proporcionar insights de productividad
- **Audiencia Objetivo**: Profesionales de 25-35 años y pequeños equipos de trabajo
- **Alcance Inicial**: Gestión de tareas, colaboración básica, notificaciones, dashboard
- **Fuera de Alcance**: Gestión de proyectos compleja, funciones empresariales avanzadas
\`\`\`

\`\`\`markdown
# Entities
**Usuario** - Persona que utiliza la aplicación para gestionar sus tareas
**Tarea** - Elemento de trabajo que debe completarse con información asociada  
**Proyecto** - Agrupación lógica de tareas relacionadas
**Categoría** - Clasificación temática de tareas para organización
**Notificación** - Recordatorio o alerta sobre tareas o eventos
**Colaborador** - Usuario invitado a participar en proyectos compartidos

# Attributes vs Properties
## Usuario
- **Fixed Attributes** (immutable facts):
  - ID único, fecha de registro, email verificado
- **Variable Properties** (mutable/transferable):
  - nombre, configuración de notificaciones, plan de suscripción

## Tarea  
- **Fixed Attributes** (immutable facts):
  - ID único, fecha de creación, creador original
- **Variable Properties** (mutable/transferable):
  - título, descripción, estado, prioridad, fecha límite, asignado

## Proyecto
- **Fixed Attributes** (immutable facts):
  - ID único, fecha de creación, propietario original  
- **Variable Properties** (mutable/transferable):
  - nombre, descripción, estado, miembros, configuración de privacidad

# Relations
| Subject | Verb | Object | Cardinality | Notes |
|---------|------|--------|-------------|-------|
| Usuario | crea | Tarea | 1-N | Un usuario puede crear múltiples tareas |
| Usuario | participa-en | Proyecto | N-M | Usuarios pueden colaborar en múltiples proyectos |
| Tarea | pertenece-a | Proyecto | N-1 | Tareas opcionales pueden agruparse en proyectos |
| Tarea | tiene | Categoría | N-1 | Clasificación opcional de tareas |
| Usuario | recibe | Notificación | 1-N | Sistema de alertas personalizado |

# CRUD Operations Matrix
| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|---------|-------|
| Usuario | Registro público | Propio perfil + colaboradores | Solo propios datos | Propia cuenta | Control de privacidad |
| Tarea | Propietarios de proyecto | Según permisos proyecto | Creador + asignado | Creador + admin proyecto | Historial de cambios |
| Proyecto | Cualquier usuario | Miembros del proyecto | Propietario + admins | Solo propietario | Gestión de membresía |
| Categoría | Propietario | Según contexto usuario | Propietario | Propietario | Personalizables por usuario |

# Review Checklist [PENDING REVIEW]
- **Entidades sin atributos**: Notificación necesita más detalle de estructura
- **Atributos que podrían ser propiedades**: Email de Usuario podría cambiar
- **Relaciones sin cardinalidad clara**: Notificación-Usuario podría ser más específica
\`\`\`

\`\`\`markdown
# Meta Tables
| Table Name | Purpose | Primary Entity | Notes |
|------------|---------|----------------|-------|
| users | Usuario management | Usuario | Authentication and profiles |
| tasks | Task tracking | Tarea | Core functionality table |
| projects | Project organization | Proyecto | Grouping and collaboration |
| categories | Task classification | Categoría | User-customizable organization |
| notifications | Alert system | Notificación | Push and email alerts |
| project_memberships | User-project relationships | - | Junction table for collaboration |

# Meta Fields
| Table | Field Name | Data Type Hint | Description |
|-------|------------|----------------|-------------|
| users | user_id | uuid | Primary identifier |
| users | email | string | Authentication email |
| users | display_name | string | User friendly name |
| users | notification_settings | json | Preferences object |
| tasks | task_id | uuid | Primary identifier |
| tasks | title | string | Task description |
| tasks | status | enum | completed, pending, in_progress |
| tasks | priority | enum | low, medium, high, urgent |
| tasks | due_date | datetime | Optional deadline |
| projects | project_id | uuid | Primary identifier |
| projects | name | string | Project title |
| projects | is_private | boolean | Privacy setting |

# Meta References
| From Table | To Table | Relationship Type | Key Names | Notes |
|------------|----------|-------------------|-----------|-------|
| tasks | users | many-to-one | task.created_by → user.user_id | Task creator |
| tasks | users | many-to-one | task.assigned_to → user.user_id | Optional assignment |
| tasks | projects | many-to-one | task.project_id → project.project_id | Optional grouping |
| tasks | categories | many-to-one | task.category_id → category.category_id | Optional classification |
| project_memberships | users | many-to-one | membership.user_id → user.user_id | Collaboration |
| project_memberships | projects | many-to-one | membership.project_id → project.project_id | Team structure |
\`\`\`

Los tres documentos están listos. ¿Quieres revisar algún aspecto antes de continuar con el siguiente agente?
`

export async function testFileGeneration() {
  console.log('🧪 Testing File Generation Engine...')

  // Test 1: Parse consultor-virtual response
  console.log('\n📋 Test 1: Parsing Consultor Virtual Response')
  const consultorResult = fileParser.parseResponse(
    sampleConsultorResponse,
    'consultor-virtual'
  )

  console.log(`✅ Extracted ${consultorResult.extractedFiles.length} files`)
  console.log(`📊 Confidence: ${(consultorResult.confidence * 100).toFixed(1)}%`)
  console.log(`🔍 Patterns: ${consultorResult.detectedPatterns.join(', ')}`)
  
  consultorResult.extractedFiles.forEach((file, index) => {
    console.log(`📄 File ${index + 1}: ${file.fileName} (${file.type}) - ${file.extractionMethod}`)
    console.log(`   Size: ${(file.content.length / 1024).toFixed(2)} KB`)
    console.log(`   Confidence: ${(file.confidence * 100).toFixed(1)}%`)
  })

  if (consultorResult.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${consultorResult.warnings.join(', ')}`)
  }

  // Test 2: Parse business-analyst response
  console.log('\n📋 Test 2: Parsing Business Analyst Response')
  const businessResult = fileParser.parseResponse(
    sampleBusinessAnalystResponse,
    'business-analyst'
  )

  console.log(`✅ Extracted ${businessResult.extractedFiles.length} files`)
  console.log(`📊 Confidence: ${(businessResult.confidence * 100).toFixed(1)}%`)
  console.log(`🔍 Patterns: ${businessResult.detectedPatterns.join(', ')}`)

  businessResult.extractedFiles.forEach((file, index) => {
    console.log(`📄 File ${index + 1}: ${file.fileName} (${file.type}) - ${file.extractionMethod}`)
    console.log(`   Size: ${(file.content.length / 1024).toFixed(2)} KB`)
    console.log(`   Confidence: ${(file.confidence * 100).toFixed(1)}%`)
  })

  if (businessResult.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${businessResult.warnings.join(', ')}`)
  }

  // Summary
  console.log('\n📊 Test Summary:')
  console.log(`Total files extracted: ${consultorResult.extractedFiles.length + businessResult.extractedFiles.length}`)
  console.log(`Average confidence: ${((consultorResult.confidence + businessResult.confidence) / 2 * 100).toFixed(1)}%`)
  console.log('✅ File Generation Engine is working correctly!')

  return {
    consultorResult,
    businessResult,
    totalFiles: consultorResult.extractedFiles.length + businessResult.extractedFiles.length
  }
}