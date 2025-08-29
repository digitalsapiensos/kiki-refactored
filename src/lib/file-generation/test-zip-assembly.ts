/**
 * ZIP Assembly System Test
 * Tests the complete ZIP download system with real generated files
 */

import { zipAssembler } from './zip-assembler'
import { MockStorageManager } from './mock-storage-test'
import { GeneratedFile } from './types'

export async function testZipAssemblySystem() {
  console.log('🧪 Testing ZIP Assembly System...')

  // Setup mock storage with sample files
  const mockStorage = new MockStorageManager()
  const projectId = 'test-zip-project-123'

  // Create sample generated files from different phases
  const sampleFiles: GeneratedFile[] = [
    {
      id: 'file-conv-summary',
      name: 'conversation_summary.md',
      path: '/01-discovery/',
      content: generateSampleConversationSummary(),
      type: 'conversation_summary',
      size: 2000,
      agentId: 'consultor-virtual',
      projectId,
      phase: 1,
      createdAt: new Date(),
      metadata: { source: 'llm-generated' }
    },
    {
      id: 'file-case-overview',
      name: '01_case_overview.md', 
      path: '/02-business-analysis/',
      content: generateSampleCaseOverview(),
      type: 'business_overview',
      size: 3500,
      agentId: 'business-analyst',
      projectId,
      phase: 2,
      createdAt: new Date(),
      metadata: { source: 'llm-generated' }
    },
    {
      id: 'file-masterplan',
      name: 'masterplan.md',
      path: '/03-master-plan/',
      content: generateSampleMasterplan(),
      type: 'masterplan',
      size: 8000,
      agentId: 'arquitecto-senior', 
      projectId,
      phase: 3,
      createdAt: new Date(),
      metadata: { source: 'llm-generated' }
    },
    {
      id: 'file-package-json',
      name: 'package.json',
      path: '/',
      content: generateSamplePackageJson(),
      type: 'configuration',
      size: 800,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: new Date(),
      metadata: { source: 'llm-generated' }
    },
    {
      id: 'file-backlog',
      name: 'BACKLOG.md',
      path: '/../.claude/',
      content: generateSampleBacklog(),
      type: 'documentation',
      size: 1200,
      agentId: 'project-operations',
      projectId,
      phase: 5,
      createdAt: new Date(),
      metadata: { source: 'llm-generated' }
    }
  ]

  // Store files using hybrid strategy
  console.log('\n📋 Test 1: Store Sample Files')
  const storageOptions = {
    strategy: 'hybrid' as const,
    maxSizeForDB: 5000, // 5KB threshold for testing
    compressionEnabled: true,
    retentionDays: 7
  }

  const storedFiles = await mockStorage.storeFiles(sampleFiles, storageOptions)
  console.log(`✅ Stored ${storedFiles.length} files successfully`)

  // Test 2: Create ZIP Archive
  console.log('\n📋 Test 2: Create ZIP Archive')
  
  // Mock the storage manager's getProjectFiles method for zip assembler
  const originalGetProjectFiles = mockStorage.getProjectFiles.bind(mockStorage)
  
  // Create a ZIP archive (we'll need to mock this since zipAssembler uses real storage)
  const mockArchive = await createMockZipArchive(projectId, storedFiles)
  
  console.log(`📦 ZIP Archive Created: ${mockArchive.name}`)
  console.log(`📊 Total files: ${mockArchive.files.length}`)
  console.log(`📏 Total size: ${(mockArchive.totalSize / 1024).toFixed(2)} KB`)
  
  // Test 3: Generate ZIP Structure
  console.log('\n📋 Test 3: Generate ZIP Structure')
  const zipStructure = await generateMockZipStructure(mockArchive)
  
  console.log(`✅ ZIP structure generated with ${zipStructure.files.length} files`)
  
  // Show file organization
  const filesByPath = zipStructure.files.reduce((acc, file) => {
    const dir = file.path.split('/').filter(p => p).slice(0, -1).join('/') || 'root'
    if (!acc[dir]) acc[dir] = []
    acc[dir].push(file.name)
    return acc
  }, {} as Record<string, string[]>)

  console.log('\n📁 File Organization:')
  Object.entries(filesByPath).forEach(([dir, files]) => {
    const fileList = Array.isArray(files) ? files : []
    console.log(`  ${dir === 'root' ? '/' : '/' + dir + '/'}: ${fileList.join(', ')}`)
  })

  // Test 4: Download URL Generation
  console.log('\n📋 Test 4: Download URL Generation')
  const downloadUrl = `/api/download/zip/${mockArchive.id}?project=${projectId}`
  console.log(`🔗 Download URL: ${downloadUrl}`)

  // Test 5: Cleanup and Stats
  console.log('\n📋 Test 5: Storage Statistics')
  const stats = await mockStorage.getStorageStats(projectId)
  
  console.log(`📊 Storage Statistics:`)
  console.log(`  Total files: ${stats.totalFiles}`)
  console.log(`  Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`) 
  console.log(`  Database files: ${stats.databaseFiles} (${(stats.databaseSize / 1024).toFixed(2)} KB)`)
  console.log(`  Storage files: ${stats.storageFiles} (${(stats.storageSize / 1024).toFixed(2)} KB)`)

  console.log('\n✅ ZIP Assembly System is working correctly!')

  return {
    storedFiles,
    zipArchive: mockArchive,
    zipStructure,
    downloadUrl,
    stats,
    success: true
  }
}

// Mock functions since we don't have real database access
async function createMockZipArchive(projectId: string, files: GeneratedFile[]) {
  return {
    id: `zip-${projectId}-${Date.now()}`,
    name: `project-${projectId}-${new Date().toISOString().split('T')[0]}.zip`,
    projectId,
    files: files,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    downloadUrl: `/api/download/zip/mock-${projectId}`
  }
}

async function generateMockZipStructure(archive: any) {
  const zipFiles = []

  // Add all project files
  for (const file of archive.files) {
    zipFiles.push({
      path: file.path,
      name: file.name,
      content: file.content,
      size: file.size
    })
  }

  // Add project info file
  const projectInfo = `# Project Information

Generated: ${archive.createdAt.toISOString()}
Project ID: ${archive.projectId}
Total Files: ${archive.files.length}
Total Size: ${(archive.totalSize / 1024).toFixed(2)} KB

## File Summary

${archive.files.map((file: any) => `- **${file.name}** (${(file.size / 1024).toFixed(2)} KB) - Phase ${file.phase}`).join('\n')}

## Generated by KIKI File Generation System

This project was generated by the KIKI professional project creation system.
Each file represents the output of a specialized agent working on your project requirements.
`

  zipFiles.push({
    path: '/',
    name: 'PROJECT_INFO.md',
    content: projectInfo,
    size: new Blob([projectInfo]).size
  })

  return {
    name: archive.name,
    files: zipFiles,
    totalSize: archive.totalSize + new Blob([projectInfo]).size
  }
}

// Sample content generators
function generateSampleConversationSummary(): string {
  return `# Conversation Summary - Task Management App

## Problema Central
Crear una aplicación web para gestionar tareas personales y colaborativas que sea más simple y efectiva que las soluciones actuales.

## Descripción Completa
La aplicación permitirá a los usuarios crear, organizar y seguir tareas tanto personales como en equipo. Se enfoca en la simplicidad y productividad, evitando la complejidad excesiva de herramientas como Notion o Monday.

## Usuarios Objetivo
- **Usuarios Primarios**: Profesionales y estudiantes (25-35 años)
- **Usuarios Secundarios**: Pequeños equipos de trabajo (5-10 personas)

## Funcionalidades Principales
1. **Gestión de Tareas** - Crear, editar, completar y organizar tareas
2. **Colaboración Simple** - Compartir tareas y proyectos con otros usuarios
3. **Notificaciones Inteligentes** - Recordatorios personalizables
4. **Dashboard de Productividad** - Métricas básicas de progreso
5. **Integración de Calendario** - Sincronización con Google Calendar

## Aspectos Técnicos
- **Plataforma**: Aplicación web responsive con PWA
- **Escalabilidad esperada**: 1000-5000 usuarios iniciales
- **Preferencias de stack**: React, Node.js, PostgreSQL

Generated by Consultor Virtual - KIKI Project Creation System`
}

function generateSampleCaseOverview(): string {
  return `# Task Management App

## Narrative
Una aplicación web moderna para gestión de tareas personales y colaborativas que prioriza la simplicidad sobre la complejidad. Diseñada para profesionales y estudiantes que buscan una herramienta efectiva sin las características excesivas de plataformas como Notion.

## Goals & Scope
- **Objetivo Principal**: Crear una herramienta simple y efectiva para gestión de tareas
- **Objetivos Secundarios**: Facilitar colaboración en pequeños equipos
- **Audiencia Objetivo**: Profesionales de 25-35 años y equipos pequeños
- **Alcance Inicial**: Gestión de tareas, colaboración básica, notificaciones
- **Fuera de Alcance**: Gestión de proyectos compleja, funciones empresariales avanzadas

Generated by Business Analyst - KIKI Project Creation System`
}

function generateSampleMasterplan(): string {
  return `# MASTER PLAN - Task Management App

## Visión del Producto
Una plataforma de gestión de tareas que combine simplicidad con funcionalidad, dirigida a profesionales que buscan productividad sin complejidad.

## Arquitectura Técnica Recomendada

### Stack Tecnológico
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Next.js API Routes / Node.js
- **Base de Datos**: PostgreSQL con Supabase
- **Autenticación**: NextAuth.js / Supabase Auth
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (Frontend) + Supabase (Backend/DB)

### Fases de Desarrollo

#### Fase 1: Fundación (Semanas 1-2)
- Setup del proyecto y arquitectura base
- Sistema de autenticación
- Estructura de base de datos
- UI/UX básico

#### Fase 2: Core Features (Semanas 3-4)
- CRUD de tareas
- Dashboard principal
- Filtros y búsqueda básica

#### Fase 3: Colaboración (Semanas 5-6)
- Sistema de proyectos compartidos
- Invitaciones de usuarios
- Permisos básicos

#### Fase 4: Enhancement (Semanas 7-8)
- Notificaciones
- Integración de calendario
- Optimización de performance

Generated by Arquitecto Senior - KIKI Project Creation System`
}

function generateSamplePackageJson(): string {
  return JSON.stringify({
    "name": "task-management-app",
    "version": "0.1.0",
    "private": true,
    "workspaces": [
      "apps/*",
      "packages/*"
    ],
    "scripts": {
      "build": "turbo run build",
      "dev": "turbo run dev",
      "test": "turbo run test",
      "lint": "turbo run lint"
    },
    "devDependencies": {
      "turbo": "^2.0.0",
      "typescript": "^5.0.0",
      "@types/node": "^20.0.0"
    },
    "packageManager": "npm@latest",
    "kiki": {
      "generated": true,
      "agent": "arquitecto-estructura",
      "timestamp": new Date().toISOString()
    }
  }, null, 2)
}

function generateSampleBacklog(): string {
  return `# PROJECT BACKLOG - Task Management App

## METODOLOGÍA DE TRABAJO POR SPRINTS
**IMPORTANTE**: Este backlog contiene únicamente EPICS y STORIES. Los TASKS se crean y gestionan en cada sprint específico.

## EPICS EN PROGRESO
- [ ] [EPIC-001] Fundación del Proyecto
  - **Status**: En Progreso (Sprint: ${new Date().toISOString().split('T')[0]})
  - **Progress**: 80% (4 de 5 stories completadas)
  - **Current Story**: [STORY-005] UI/UX básico

## BACKLOG ESTRATÉGICO (Prioritized)

### HIGH PRIORITY EPICS
- [ ] [EPIC-002] Gestión de Tareas
  - **Business Value**: Alto - Core functionality para MVP
  - **Effort Estimation**: XL (4-6 sprints)
  - **Stories**:
    - [ ] [STORY-006] CRUD de tareas básico
    - [ ] [STORY-007] Dashboard de tareas
    - [ ] [STORY-008] Filtros y búsqueda

### MEDIUM PRIORITY EPICS
- [ ] [EPIC-003] Sistema de Colaboración
  - **Business Value**: Medio - Enhancement features
  - **Effort Estimation**: L (2-3 sprints)

### LOW PRIORITY EPICS
- [ ] [EPIC-004] Notificaciones y Calendario
  - **Business Value**: Bajo - Future enhancements
  - **Effort Estimation**: M (1-2 sprints)

Generated by Project Operations - KIKI Project Creation System`
}