/**
 * API Route para servir system prompts dinámicamente desde archivos markdown
 * GET /api/prompts/[step] - Retorna el system prompt para un step específico
 */

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// Path base a los system prompts
const PROMPTS_BASE_PATH = '/Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/System Prompts/situaciones-usuario/01-inicio-proyecto'

// Configuración de cada step con explicaciones pedagógicas
const STEP_CONFIG = {
  '1': {
    fileName: '1-extractor-conversacional.md',
    title: 'Conversación de Negocio',
    role: 'Consultor virtual',
    description: 'Extraemos y clarificamos tu idea mediante preguntas guiadas estructuradas',
    aiRecommendation: 'LLM de tu preferencia',
    expectedOutput: 'conversation_summary.md',
    pedagogicalExplanation: `**¿Por qué este paso es crucial?**

Este prompt implementa una **metodología de consultoría profesional** que convierte ideas vagas en documentos estructurados. Está diseñado con:

🎯 **CONVERSACIÓN GUIADA EN 6 PASOS**:
- **STEP 1-2**: Captura y clarificación - Evita assumptions y malentendidos
- **STEP 3**: Exploración de contexto - Identifica stakeholders y restricciones reales  
- **STEP 4**: Profundización en features - Define el alcance real del MVP
- **STEP 5**: Aspectos técnicos - Balancea ambición con realidad técnica
- **STEP 6**: Validación y resumen - Asegura que no se pierde información crítica

📋 **METODOLOGÍA PROBADA**: Basada en **Design Thinking** y **Business Analysis**:
- Una pregunta por vez (evita overwhelm)
- Construye sobre respuestas anteriores (contexto acumulativo)
- Valida comprensión antes de avanzar (reduce retrabajo)

🎓 **APRENDES**: Cómo hacer discovery de requisitos, cómo estructurar una idea de negocio, cómo comunicar una visión de producto.`,
    instructions: [
      'Copia el system prompt completo',
      'Ve a tu LLM favorito', 
      'Pega el prompt en una nueva conversación',
      'Comparte tu idea de aplicación cuando te lo pida',
      'Sigue la conversación hasta generar conversation_summary.md',
      'Vuelve aquí y pega la URL de tu conversación'
    ]
  },
  '2': {
    fileName: '2-formalizador-negocio.md',
    title: 'Formalización de Negocio',
    role: 'Business Analyst',
    description: 'Transformamos la conversación en documentos estructurados de negocio',
    aiRecommendation: 'LLM de tu preferencia',
    expectedOutput: '3 documentos de negocio formales',
    pedagogicalExplanation: `**¿Por qué separar negocio de tecnología?**

Este prompt implementa el principio de **separación de concerns** - primero entender QUÉ construir, después CÓMO construirlo.

🏗️ **BUSINESS-LOGIC DECOMPOSER**: Metodología de **análisis de sistemas** profesional:
- **01_case_overview.md**: Visión ejecutiva (para stakeholders y funding)
- **02_logic_breakdown.md**: Análisis detallado (entidades, relaciones, CRUD)  
- **03_meta_outline.md**: Esquema conceptual de datos (pre-database design)

📊 **PIPELINE DE 7 PASOS** basado en **Domain-Driven Design**:
- **STEP 1-2**: Domain discovery (¿qué "cosas" existen en tu negocio?)
- **STEP 3-4**: Entity modeling (¿qué propiedades tienen? ¿cómo se relacionan?)
- **STEP 5**: CRUD analysis (¿quién puede hacer qué con cada entidad?)
- **STEP 6-7**: Meta modeling (preparación para diseño de base de datos)

🎓 **APRENDES**: Domain modeling, entity relationship design, business rule analysis, security at the business level.`,
    instructions: [
      'Copia el system prompt del Paso 2',
      'Usa tu LLM favorito para análisis profundo',
      'Pega el conversation_summary.md del paso anterior', 
      'Sigue las instrucciones para generar los 3 documentos',
      'Guarda los archivos generados',
      'Vuelve aquí y pega la URL de tu conversación'
    ]
  },
  '3': {
    fileName: '3-generador-masterplan.md',
    title: 'Master Plan Técnico',
    role: 'Arquitecto Senior',
    description: 'Creamos hoja de ruta completa con stack tecnológico y arquitectura',
    aiRecommendation: 'LLM de tu preferencia',
    expectedOutput: 'masterplan.md completo',
    pedagogicalExplanation: `**¿Cómo se traduce negocio a tecnología?**

Este prompt implementa **arquitectura de software profesional** - el puente entre negocio y código.

🛠️ **ANÁLISIS Y SÍNTESIS EN 6 PASOS**:
- **STEP 1**: Document analysis - Lee los 3 docs de negocio con ojo técnico
- **STEP 2**: **Stack recommendation** - Elige tecnologías 2025 (Supabase, React 19, TypeScript 5.0)
- **STEP 3**: **Phase planning** - Divide desarrollo en MVP + expansiones
- **STEP 4**: **Risk identification** - Anticipa problemas técnicos/negocio/desarrollo
- **STEP 5**: **Design principles** - UX/UI guidelines y arquitectura
- **STEP 6**: **Future roadmap** - Escalabilidad y expansión

🎨 **EQUILIBRIO CLAVE**: Ambición vs Realismo
- Recomienda tecnologías modernas pero probadas
- Divide en fases para entregar valor rápido
- Identifica riesgos ANTES de que sean problemas

🎓 **APRENDES**: Arquitectura de software, selección de tecnologías, planificación de fases, gestión de riesgos técnicos.`,
    instructions: [
      'Copia el system prompt del Paso 3',
      'Usa tu LLM favorito para análisis técnico',
      'Proporciona los 3 documentos del paso anterior',
      'Genera el masterplan.md técnico completo',
      'Guarda el archivo masterplan.md', 
      'Vuelve aquí y pega la URL de tu conversación'
    ]
  },
  '4': {
    fileName: '4-arquitecto-estructura.md',
    title: 'Estructura del Proyecto',
    role: 'Arquitecto de Estructura',
    description: 'Generamos andamiaje completo con carpetas y archivos stub organizados',
    aiRecommendation: 'Claude Code (IDE)',
    expectedOutput: 'Proyecto estructurado',
    pedagogicalExplanation: `**¿Por qué MONOREPO y no proyecto simple?**

Este prompt enseña **arquitectura escalable** desde el día 1 usando **metodología MONOREPO**.

🏢 **ARQUITECTURA APPS/ + PACKAGES/**:
- **apps/main-app/**: Tu aplicación principal
- **apps/admin-panel/**: Panel administrativo (futuro)
- **packages/ui/**: Componentes reutilizables (Button, Input, Modal)
- **packages/utils/**: Funciones compartidas (formatters, validators)
- **packages/config/**: Configuraciones (ESLint, TypeScript, Tailwind)

🔄 **REUTILIZACIÓN INTELIGENTE**: Un botón, usado en todas las apps
- **Consistencia**: Design system unificado
- **Escalabilidad**: Fácil añadir landing pages, mobile app
- **DX Superior**: Un repo, una instalación, builds optimizados

🎓 **APRENDES**: Arquitectura de monorepo, organización de código, design systems, tooling moderno (Turborepo/Nx).`,
    instructions: [
      'Copia el system prompt del Paso 4',
      'CAMBIO: Usa Claude Code en tu IDE favorito',
      'Proporciona el masterplan.md del paso anterior',
      'Genera la estructura completa del proyecto',
      'Crea carpetas, archivos stub y documentación',
      'Vuelve aquí y pega la URL de tu conversación'
    ]
  },
  '5': {
    fileName: '5-configurador-proyecto.md',
    title: 'Configuración Operativa',
    role: 'Project Operations',
    description: 'Configuramos backlog, tracking y sistema operativo del proyecto',
    aiRecommendation: 'Claude Code (IDE)',
    expectedOutput: 'Proyecto listo para development',
    pedagogicalExplanation: `**¿Cómo se gestiona un proyecto de software profesional?**

Este prompt final implementa **DevOps y Project Management** profesional - el "sistema operativo" de tu proyecto.

📋 **SISTEMA DE GESTIÓN TRICAPA**:
- **../.claude/BACKLOG.md**: Estrategia (EPICs → Stories) - QUÉ construir
- **../.claude/STATUS_LOG.md**: Tácticas (decisiones diarias) - CÓMO va el progreso  
- **../.claude/PRD.md**: Visión (requirements) - POR QUÉ construir esto

⚡ **METODOLOGÍA POR SPRINTS**:
- **BACKLOG**: Solo EPICs y Stories (nivel estratégico)
- **sprints/[timestamp]/**: Tasks detallados por sprint
- **Jerarquía**: EPIC → STORY → TASK → Implementation

🤖 **CLAUDE INTEGRATION**: Configuraciones para que Claude Code:
- Consulte PRD antes de implementar
- Actualice STATUS_LOG en cada decisión  
- Siga methodology probada

🎓 **APRENDES**: Agile project management, documentation as code, DevOps workflows, AI-assisted development.`,
    instructions: [
      'Copia el system prompt del Paso 5 (FINAL)',
      'Usa Claude Code en tu IDE',
      'Proporciona la estructura del paso anterior',
      'Genera BACKLOG.md, STATUS_LOG.md, configuraciones',
      'Configura el sistema operativo del proyecto',
      'Tu proyecto estará 100% listo para development'
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { step: string } }
) {
  try {
    const step = params.step
    const config = STEP_CONFIG[step as keyof typeof STEP_CONFIG]
    
    if (!config) {
      return NextResponse.json(
        { error: `Step ${step} not found` },
        { status: 404 }
      )
    }

    // Leer el archivo markdown
    const filePath = path.join(PROMPTS_BASE_PATH, config.fileName)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Prompt file not found: ${config.fileName}` },
        { status: 404 }
      )
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // Extraer el contenido entre <system_prompt> tags
    const systemPromptMatch = fileContent.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/)
    const systemPrompt = systemPromptMatch ? systemPromptMatch[1].trim() : fileContent

    return NextResponse.json({
      step: parseInt(step),
      title: config.title,
      role: config.role,
      description: config.description,
      aiRecommendation: config.aiRecommendation,
      expectedOutput: config.expectedOutput,
      instructions: config.instructions,
      pedagogicalExplanation: config.pedagogicalExplanation,
      systemPrompt: systemPrompt
    })

  } catch (error) {
    console.error(`Error loading prompt for step ${params.step}:`, error)
    return NextResponse.json(
      { error: 'Internal server error loading prompt' },
      { status: 500 }
    )
  }
}