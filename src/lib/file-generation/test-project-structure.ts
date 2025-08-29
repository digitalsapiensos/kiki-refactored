/**
 * Project Structure Generator Test
 * Tests the complete project structure generation from arquitecto-estructura responses
 */

import { fileParser } from './file-parser'
import { projectStructureGenerator, ProjectStructureOptions } from './project-structure-generator'

// Sample LLM response from arquitecto-estructura
const sampleArquitectoResponse = `
He transformado tu masterplan en una estructura MONOREPO completa siguiendo las mejores prácticas:

## Estructura del Proyecto

He generado una estructura **Turborepo** con apps/ y packages/ que incluye:

\`\`\`
/ (raíz del monorepo)
├── apps/
│   ├── main-app/          (aplicación principal)
│   └── admin-panel/       (panel administrativo)
├── packages/
│   ├── ui/                (componentes UI reutilizables)
│   ├── utils/             (funciones utilitarias)
│   ├── config/            (configuraciones compartidas)
│   └── types/             (tipos TypeScript)
├── database/
│   └── supabase/
├── docs/
└── .claude/               (configuración externa)
\`\`\`

## Archivos Generados

### Package.json Principal
\`\`\`json
{
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
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
\`\`\`

### Turbo.json
\`\`\`json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
\`\`\`

### README.md
\`\`\`markdown
# Task Management App

Una aplicación moderna para gestión de tareas con arquitectura monorepo.

## Estructura

- **apps/main-app/**: Aplicación principal React/Next.js
- **apps/admin-panel/**: Panel administrativo
- **packages/ui/**: Componentes UI compartidos
- **packages/utils/**: Utilidades compartidas

## Stack Tecnológico

- Next.js 14
- React 18
- TypeScript 5
- Supabase
- Turborepo
\`\`\`

He creado también la configuración externa .claude/ con:
- CLAUDE.md (manual maestro)
- PRD.md (requerimientos del producto)
- BACKLOG.md (backlog estratégico)
- STATUSLOG.md (seguimiento de estado)

El proyecto está listo para comenzar el desarrollo con un ecosistema profesional y escalable.
`

export async function testProjectStructureGeneration() {
  console.log('🧪 Testing Project Structure Generation...')

  // Test 1: Parse arquitecto-estructura response
  console.log('\n📋 Test 1: Parsing Arquitecto Estructura Response')
  const parsingResult = fileParser.parseResponse(
    sampleArquitectoResponse,
    'arquitecto-estructura'
  )

  console.log(`✅ Extracted ${parsingResult.extractedFiles.length} files`)
  console.log(`📊 Confidence: ${(parsingResult.confidence * 100).toFixed(1)}%`)
  console.log(`🔍 Patterns: ${parsingResult.detectedPatterns.join(', ')}`)

  // Check if project structure was detected
  const structureManifest = parsingResult.extractedFiles.find(
    f => f.fileName === 'project-structure-manifest.json'
  )

  if (structureManifest) {
    console.log('🏗️ Project structure detected!')
    const manifest = JSON.parse(structureManifest.content)
    console.log(`📦 Project: ${manifest.extractedInfo.projectName}`)
    console.log(`🛠️ Tech Stack: ${manifest.extractedInfo.techStack.join(', ')}`)
    console.log(`⚙️ Monorepo Tool: ${manifest.extractedInfo.monorepoTool}`)

    // Test 2: Generate complete project structure
    console.log('\n📋 Test 2: Generating Complete Project Structure')
    
    const structureOptions: ProjectStructureOptions = {
      projectName: manifest.extractedInfo.projectName,
      techStack: manifest.extractedInfo.techStack,
      monorepoTool: manifest.extractedInfo.monorepoTool as 'turborepo',
      hasAdminPanel: true,
      hasLandingPage: false,
      packageManager: 'npm'
    }

    const projectFiles = projectStructureGenerator.generateProjectStructure(
      sampleArquitectoResponse,
      'test-project-structure',
      structureOptions
    )

    console.log(`✅ Generated ${projectFiles.length} project files`)

    // Group files by type
    const filesByType = projectFiles.reduce((acc, file) => {
      if (!acc[file.type]) acc[file.type] = []
      acc[file.type].push(file)
      return acc
    }, {} as Record<string, any[]>)

    Object.entries(filesByType).forEach(([type, files]) => {
      console.log(`📁 ${type}: ${files.length} files`)
      files.slice(0, 3).forEach(file => {
        console.log(`  - ${file.path}${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
      })
      if (files.length > 3) {
        console.log(`  ... and ${files.length - 3} more`)
      }
    })

    // Test 3: Analyze specific files
    console.log('\n📋 Test 3: Analyzing Key Generated Files')

    const keyFiles = [
      'package.json',
      'turbo.json', 
      'README.md',
      'CLAUDE.md'
    ]

    keyFiles.forEach(fileName => {
      const file = projectFiles.find(f => f.name === fileName)
      if (file) {
        console.log(`✅ ${fileName}: ${(file.size / 1024).toFixed(1)} KB at ${file.path}`)
        // Show first line of content
        const firstLine = file.content.split('\n')[0]
        console.log(`   Preview: ${firstLine.substring(0, 50)}...`)
      } else {
        console.log(`❌ ${fileName}: Not found`)
      }
    })

    return {
      parsingResult,
      structureFiles: projectFiles,
      manifest,
      stats: {
        totalFiles: projectFiles.length,
        totalSize: projectFiles.reduce((sum, f) => sum + f.size, 0),
        byType: filesByType
      }
    }
  } else {
    console.log('❌ No project structure manifest detected')
    return {
      parsingResult,
      structureFiles: [],
      manifest: null,
      stats: null
    }
  }
}

export async function testProjectStructureIntegration() {
  console.log('\n🧪 Testing Project Structure Integration...')

  // Test the complete integration flow
  const result = await testProjectStructureGeneration()
  
  if (result.structureFiles.length > 0) {
    console.log('\n✅ Integration Test Results:')
    console.log(`📁 Total files generated: ${result.structureFiles.length}`)
    console.log(`📊 Total size: ${(result.stats!.totalSize / 1024).toFixed(1)} KB`)
    
    // Verify key components exist
    const requiredFiles = [
      'package.json',
      'README.md', 
      'CLAUDE.md',
      'PRD.md',
      'BACKLOG.md',
      'STATUSLOG.md'
    ]

    const missingFiles = requiredFiles.filter(fileName => 
      !result.structureFiles.find(f => f.name === fileName)
    )

    if (missingFiles.length === 0) {
      console.log('✅ All required files generated successfully')
    } else {
      console.log(`⚠️ Missing files: ${missingFiles.join(', ')}`)
    }

    console.log('✅ Project Structure Generation System is working correctly!')
  } else {
    console.log('❌ Project structure generation failed')
  }

  return result
}