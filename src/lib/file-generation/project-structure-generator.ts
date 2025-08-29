/**
 * Project Structure Generator
 * Generates complete monorepo project structures from masterplan responses
 */

import { GeneratedFile, FileType } from './types'

export interface ProjectStructureOptions {
  projectName: string
  techStack: string[]
  hasAdminPanel?: boolean
  hasLandingPage?: boolean
  monorepoTool?: 'turborepo' | 'nx' | 'npm-workspaces'
  packageManager?: 'npm' | 'yarn' | 'pnpm'
}

export class ProjectStructureGenerator {
  private static instance: ProjectStructureGenerator
  
  public static getInstance(): ProjectStructureGenerator {
    if (!ProjectStructureGenerator.instance) {
      ProjectStructureGenerator.instance = new ProjectStructureGenerator()
    }
    return ProjectStructureGenerator.instance
  }

  /**
   * Generate complete project structure from masterplan
   */
  public generateProjectStructure(
    masterplanContent: string,
    projectId: string,
    options: ProjectStructureOptions
  ): GeneratedFile[] {
    const files: GeneratedFile[] = []
    const timestamp = new Date()

    // Parse masterplan to extract key information
    const projectInfo = this.parseMasterplan(masterplanContent, options)

    // Generate root level files
    files.push(...this.generateRootFiles(projectInfo, projectId, timestamp))

    // Generate apps structure
    files.push(...this.generateAppsStructure(projectInfo, projectId, timestamp))

    // Generate packages structure
    files.push(...this.generatePackagesStructure(projectInfo, projectId, timestamp))

    // Generate database structure
    files.push(...this.generateDatabaseStructure(projectInfo, projectId, timestamp))

    // Generate docs structure
    files.push(...this.generateDocsStructure(projectInfo, projectId, timestamp))

    // Generate tools and config
    files.push(...this.generateToolsAndConfig(projectInfo, projectId, timestamp))

    // Generate Claude configuration (external)
    files.push(...this.generateClaudeConfig(projectInfo, projectId, timestamp))

    return files
  }

  /**
   * Parse masterplan content to extract project information
   */
  private parseMasterplan(masterplanContent: string, options: ProjectStructureOptions) {
    return {
      projectName: options.projectName,
      techStack: options.techStack,
      hasAdminPanel: options.hasAdminPanel || false,
      hasLandingPage: options.hasLandingPage || false,
      monorepoTool: options.monorepoTool || 'turborepo',
      packageManager: options.packageManager || 'npm',
      masterplanContent,
      // Extract entities and features from masterplan
      entities: this.extractEntities(masterplanContent),
      features: this.extractFeatures(masterplanContent),
      apiEndpoints: this.extractApiEndpoints(masterplanContent)
    }
  }

  /**
   * Generate root level configuration files
   */
  private generateRootFiles(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // Root package.json
    files.push({
      id: `root-package-${projectId}`,
      name: 'package.json',
      path: '/',
      content: this.generateRootPackageJson(projectInfo),
      type: 'configuration' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        fileType: 'monorepo-config'
      }
    })

    // Turbo.json (if using Turborepo)
    if (projectInfo.monorepoTool === 'turborepo') {
      files.push({
        id: `turbo-config-${projectId}`,
        name: 'turbo.json',
        path: '/',
        content: this.generateTurboConfig(projectInfo),
        type: 'configuration' as FileType,
        size: 0,
        agentId: 'arquitecto-estructura',
        projectId,
        phase: 4,
        createdAt: timestamp,
        metadata: {
          source: 'llm-generated',
          fileType: 'build-config'
        }
      })
    }

    // .gitignore
    files.push({
      id: `gitignore-${projectId}`,
      name: '.gitignore',
      path: '/',
      content: this.generateGitignore(projectInfo),
      type: 'configuration' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'template',
        fileType: 'git-config'
      }
    })

    // Root README.md
    files.push({
      id: `root-readme-${projectId}`,
      name: 'README.md',
      path: '/',
      content: this.generateRootReadme(projectInfo),
      type: 'documentation' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        fileType: 'project-docs'
      }
    })

    return files.map(f => ({ ...f, size: new Blob([f.content]).size }))
  }

  /**
   * Generate apps/ structure
   */
  private generateAppsStructure(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // Main app structure
    files.push(...this.generateMainApp(projectInfo, projectId, timestamp))

    // Admin panel (if needed)
    if (projectInfo.hasAdminPanel) {
      files.push(...this.generateAdminApp(projectInfo, projectId, timestamp))
    }

    // Landing page (if needed)
    if (projectInfo.hasLandingPage) {
      files.push(...this.generateLandingApp(projectInfo, projectId, timestamp))
    }

    return files
  }

  /**
   * Generate main application structure
   */
  private generateMainApp(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []
    const appPath = '/apps/main-app'

    // App package.json
    files.push({
      id: `main-app-package-${projectId}`,
      name: 'package.json',
      path: `${appPath}/`,
      content: this.generateAppPackageJson('main-app', projectInfo),
      type: 'configuration' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        appType: 'main-app'
      }
    })

    // Next.js config (if using Next.js)
    if (projectInfo.techStack.includes('Next.js')) {
      files.push({
        id: `main-app-next-config-${projectId}`,
        name: 'next.config.js',
        path: `${appPath}/`,
        content: this.generateNextConfig(projectInfo),
        type: 'configuration' as FileType,
        size: 0,
        agentId: 'arquitecto-estructura',
        projectId,
        phase: 4,
        createdAt: timestamp,
        metadata: {
          source: 'template',
          framework: 'nextjs'
        }
      })
    }

    // App layout and pages
    files.push(...this.generateAppPages(appPath, projectInfo, projectId, timestamp))

    // App components
    files.push(...this.generateAppComponents(appPath, projectInfo, projectId, timestamp))

    // App features
    files.push(...this.generateAppFeatures(appPath, projectInfo, projectId, timestamp))

    return files.map(f => ({ ...f, size: new Blob([f.content]).size }))
  }

  /**
   * Generate packages/ structure
   */
  private generatePackagesStructure(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // UI package
    files.push(...this.generateUIPackage(projectInfo, projectId, timestamp))

    // Utils package
    files.push(...this.generateUtilsPackage(projectInfo, projectId, timestamp))

    // Config package
    files.push(...this.generateConfigPackage(projectInfo, projectId, timestamp))

    // Types package
    files.push(...this.generateTypesPackage(projectInfo, projectId, timestamp))

    return files
  }

  /**
   * Generate UI package with shared components
   */
  private generateUIPackage(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []
    const packagePath = '/packages/ui'

    // Package.json
    files.push({
      id: `ui-package-${projectId}`,
      name: 'package.json',
      path: `${packagePath}/`,
      content: this.generateUIPackageJson(projectInfo),
      type: 'configuration' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        packageType: 'ui-components'
      }
    })

    // Basic UI components
    const components = ['Button', 'Input', 'Modal', 'Card', 'Layout']
    components.forEach(component => {
      files.push({
        id: `ui-${component.toLowerCase()}-${projectId}`,
        name: `${component}.tsx`,
        path: `${packagePath}/src/components/`,
        content: this.generateUIComponent(component, projectInfo),
        type: 'code' as FileType,
        size: 0,
        agentId: 'arquitecto-estructura',
        projectId,
        phase: 4,
        createdAt: timestamp,
        metadata: {
          source: 'template',
          componentType: component.toLowerCase()
        }
      })
    })

    // UI package index
    files.push({
      id: `ui-index-${projectId}`,
      name: 'index.ts',
      path: `${packagePath}/src/`,
      content: this.generateUIPackageIndex(components),
      type: 'code' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'template',
        fileType: 'package-index'
      }
    })

    return files.map(f => ({ ...f, size: new Blob([f.content]).size }))
  }

  /**
   * Generate database structure
   */
  private generateDatabaseStructure(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // Supabase schema (if using Supabase)
    if (projectInfo.techStack.includes('Supabase')) {
      files.push({
        id: `db-schema-${projectId}`,
        name: 'schema.sql',
        path: '/database/supabase/',
        content: this.generateSupabaseSchema(projectInfo),
        type: 'code' as FileType,
        size: 0,
        agentId: 'arquitecto-estructura',
        projectId,
        phase: 4,
        createdAt: timestamp,
        metadata: {
          source: 'llm-generated',
          database: 'supabase'
        }
      })

      files.push({
        id: `db-policies-${projectId}`,
        name: 'policies.sql',
        path: '/database/supabase/',
        content: this.generateSupabasePolicies(projectInfo),
        type: 'code' as FileType,
        size: 0,
        agentId: 'arquitecto-estructura',
        projectId,
        phase: 4,
        createdAt: timestamp,
        metadata: {
          source: 'llm-generated',
          database: 'supabase'
        }
      })
    }

    return files.map(f => ({ ...f, size: new Blob([f.content]).size }))
  }

  /**
   * Generate Claude configuration files (external to project)
   */
  private generateClaudeConfig(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // CLAUDE.md (master configuration)
    files.push({
      id: `claude-config-${projectId}`,
      name: 'CLAUDE.md',
      path: '/../.claude/',
      content: this.generateClaudeConfigFile(projectInfo),
      type: 'documentation' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        fileType: 'claude-config'
      }
    })

    // PRD.md
    files.push({
      id: `prd-${projectId}`,
      name: 'PRD.md',
      path: '/../.claude/',
      content: this.generatePRDFile(projectInfo),
      type: 'documentation' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        fileType: 'product-requirements'
      }
    })

    // BACKLOG.md
    files.push({
      id: `backlog-${projectId}`,
      name: 'BACKLOG.md',
      path: '/../.claude/',
      content: this.generateBacklogFile(projectInfo),
      type: 'documentation' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'llm-generated',
        fileType: 'project-backlog'
      }
    })

    // STATUSLOG.md
    files.push({
      id: `statuslog-${projectId}`,
      name: 'STATUSLOG.md',
      path: '/../.claude/',
      content: this.generateStatusLogFile(projectInfo),
      type: 'documentation' as FileType,
      size: 0,
      agentId: 'arquitecto-estructura',
      projectId,
      phase: 4,
      createdAt: timestamp,
      metadata: {
        source: 'template',
        fileType: 'status-tracking'
      }
    })

    return files.map(f => ({ ...f, size: new Blob([f.content]).size }))
  }

  // Content generation methods (stubs for now - would be fully implemented)
  private generateRootPackageJson(projectInfo: any): string {
    return `{
  "name": "${projectInfo.projectName}",
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
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "packageManager": "${projectInfo.packageManager}@latest"
}`
  }

  private generateTurboConfig(projectInfo: any): string {
    return `{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "clean": {
      "cache": false
    }
  }
}`
  }

  private generateGitignore(projectInfo: any): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
dist/
build/

# Environment variables
.env*
!.env.example

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo/

# Runtime data
pids
*.pid
*.seed
*.pid.lock`
  }

  private generateRootReadme(projectInfo: any): string {
    return `# ${projectInfo.projectName}

${projectInfo.masterplanContent.substring(0, 200)}...

## Architecture

This project uses a monorepo architecture with:

- **apps/**: Application code (main app, admin panel, etc.)
- **packages/**: Shared packages (UI components, utilities, etc.)
- **database/**: Database schema and migrations
- **docs/**: Project documentation

## Getting Started

\`\`\`bash
# Install dependencies
${projectInfo.packageManager} install

# Start development
${projectInfo.packageManager} run dev

# Build all packages
${projectInfo.packageManager} run build
\`\`\`

## Tech Stack

${projectInfo.techStack.map((tech: string) => `- ${tech}`).join('\n')}

## Project Structure

Generated by KIKI Arquitecto de Estructura based on the masterplan.
`
  }

  // Placeholder methods for other content generators
  private generateAppPackageJson(appName: string, projectInfo: any): string {
    return `{
  "name": "${appName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@workspace/ui": "workspace:*",
    "@workspace/utils": "workspace:*"
  }
}`
  }

  private generateNextConfig(projectInfo: any): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/utils"],
  // TODO: Add specific configuration based on masterplan requirements
}

module.exports = nextConfig`
  }

  private generateUIPackageJson(projectInfo: any): string {
    return `{
  "name": "@workspace/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.0.0",
    "@types/react": "^18.0.0"
  }
}`
  }

  private generateUIComponent(componentName: string, projectInfo: any): string {
    return `// Propósito: ${componentName} component for shared UI system
// @filepath: packages/ui/src/components/${componentName}.tsx
// TODO: Implement ${componentName} component based on design system requirements
// FEATURE-ALIGNMENT: Core UI components for consistent interface

import React from 'react'

export interface ${componentName}Props {
  // TODO: Define component props based on masterplan requirements
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  // TODO: Implement ${componentName} component logic
  return (
    <div className="${componentName.toLowerCase()}">
      {/* TODO: Implement ${componentName} UI structure */}
    </div>
  )
}

export default ${componentName}`
  }

  private generateUIPackageIndex(components: string[]): string {
    return `// UI Package Index - Export all shared components
${components.map(component => `export { ${component} } from './components/${component}'`).join('\n')}`
  }

  private generateSupabaseSchema(projectInfo: any): string {
    return `-- Database Schema for ${projectInfo.projectName}
-- Generated from masterplan entities and relationships
-- TODO: Implement actual tables based on meta_outline.md

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TODO: Create tables based on entities identified in masterplan:
${projectInfo.entities.map((entity: string) => `-- ${entity} table`).join('\n')}

-- TODO: Add relationships and constraints
-- TODO: Add indexes for performance
-- TODO: Add triggers for audit trails`
  }

  private generateSupabasePolicies(projectInfo: any): string {
    return `-- Row Level Security Policies for ${projectInfo.projectName}
-- Generated based on masterplan security requirements
-- TODO: Implement RLS policies based on access patterns

-- Enable RLS on all tables
-- TODO: ALTER TABLE each_table ENABLE ROW LEVEL SECURITY;

-- TODO: Create policies based on user roles and permissions identified in masterplan`
  }

  private generateClaudeConfigFile(projectInfo: any): string {
    return `# CLAUDE.md - Master Configuration for ${projectInfo.projectName}

## PROJECT CORE
- **Objective**: ${projectInfo.projectName} - [Extract objective from masterplan]
- **Tech Stack**: ${projectInfo.techStack.join(', ')}
- **Architecture**: Monorepo with apps/ + packages/

## MONOREPO STRUCTURE
- **apps/main-app/**: Primary application
${projectInfo.hasAdminPanel ? '- **apps/admin-panel/**: Administrative interface' : ''}
- **packages/ui/**: Shared UI components
- **packages/utils/**: Shared utilities
- **packages/types/**: TypeScript type definitions

## DEVELOPMENT WORKFLOW
- **Build Tool**: ${projectInfo.monorepoTool}
- **Package Manager**: ${projectInfo.packageManager}
- **Commands**: 
  - Dev: \`${projectInfo.packageManager} run dev\`
  - Build: \`${projectInfo.packageManager} run build\`

## CLAUDE INSTRUCTIONS
- Always check PRD.md, BACKLOG.md, and STATUSLOG.md before implementing
- Update STATUSLOG.md after significant changes
- Follow monorepo conventions for cross-package dependencies
- Generate components in packages/ui for reusability`
  }

  private generatePRDFile(projectInfo: any): string {
    return `# Product Requirements Document - ${projectInfo.projectName}

## PRODUCT VISION
**Vision Statement**: [Extract from masterplan]
**Problem Statement**: [Extract from masterplan]
**Solution Approach**: [Extract from masterplan]

## FUNCTIONAL REQUIREMENTS
${projectInfo.features.map((feature: string, index: number) => `### EPIC ${index + 1}: ${feature}
- **User Story**: [To be defined based on masterplan]
- **Acceptance Criteria**: [To be defined]
- **Priority**: [High/Medium/Low]`).join('\n\n')}

## TECH STACK DECISIONS
${projectInfo.techStack.map((tech: string) => `- **${tech}**: [Justification from masterplan]`).join('\n')}

## SUCCESS METRICS
- [Extract from masterplan requirements]`
  }

  private generateBacklogFile(projectInfo: any): string {
    return `# PROJECT BACKLOG - ${projectInfo.projectName}

## EPICS IN PROGRESS
- [ ] [EPIC-001] Project Structure Setup
  - **Status**: In Progress
  - **Progress**: 100% (Structure generated)

## BACKLOG ESTRATÉGICO

### HIGH PRIORITY EPICS
${projectInfo.features.map((feature: string, index: number) => `- [ ] [EPIC-${String(index + 2).padStart(3, '0')}] ${feature}
  - **Business Value**: [To be defined]
  - **Effort Estimation**: [To be estimated]`).join('\n')}

## DEFINITION OF DONE
### Para EPICS:
- [ ] All stories completed
- [ ] Integration tests passing
- [ ] Documentation updated`
  }

  private generateStatusLogFile(projectInfo: any): string {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    return `# PROJECT STATUS LOG - ${projectInfo.projectName}

## CURRENT STATUS (Updated: ${now})
**Overall Health**: 🟢 Green
**Current Focus**: Project structure generation completed
**Progress**: 25% complete - Structure phase done
**Last Updated By**: Claude
**Next Review**: Next development session

## TODAY'S ACTIVITY LOG
### ${now} - PROJECT STRUCTURE GENERATED
**Context**: Masterplan transformation into monorepo structure
**Decision Made**: Generated complete ${projectInfo.monorepoTool} monorepo with shared packages
**Rationale**: Enables code reuse, consistent UI, scalable architecture
**Implementation Details**: 
- Apps structure: main-app${projectInfo.hasAdminPanel ? ', admin-panel' : ''}
- Packages: ui, utils, config, types
- External Claude config with PRD, BACKLOG, STATUSLOG
**Files Changed**: [Complete project structure]
**Status**: ✅ Completed
**Next Steps**: Begin development implementation`
  }

  // Helper methods
  private extractEntities(masterplanContent: string): string[] {
    // Extract entities from masterplan content
    // This is a simplified implementation
    const entities = []
    if (masterplanContent.includes('User')) entities.push('User')
    if (masterplanContent.includes('Task') || masterplanContent.includes('Tarea')) entities.push('Task')
    if (masterplanContent.includes('Project') || masterplanContent.includes('Proyecto')) entities.push('Project')
    return entities.length > 0 ? entities : ['User', 'Project', 'Task'] // Default entities
  }

  private extractFeatures(masterplanContent: string): string[] {
    // Extract main features from masterplan
    // This is a simplified implementation
    return ['User Management', 'Core Functionality', 'Admin Interface', 'API Integration']
  }

  private extractApiEndpoints(masterplanContent: string): string[] {
    // Extract API endpoints mentioned in masterplan
    return ['GET /api/users', 'POST /api/projects', 'GET /api/health']
  }

  // Placeholder methods for other generators (these will be fully implemented)
  private generateUtilsPackage(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement utils package generation
    return [] 
  }
  private generateConfigPackage(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement config package generation
    return [] 
  }
  private generateTypesPackage(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement types package generation
    return [] 
  }
  private generateDocsStructure(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement docs structure generation
    return [] 
  }
  private generateToolsAndConfig(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement tools and config generation
    return [] 
  }
  private generateAdminApp(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement admin app generation
    return [] 
  }
  private generateLandingApp(projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement landing app generation
    return [] 
  }
  private generateAppPages(appPath: string, projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement app pages generation
    return [] 
  }
  private generateAppComponents(appPath: string, projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement app components generation
    return [] 
  }
  private generateAppFeatures(appPath: string, projectInfo: any, projectId: string, timestamp: Date): GeneratedFile[] { 
    // TODO: Implement app features generation
    return [] 
  }
}

// Export singleton instance
export const projectStructureGenerator = ProjectStructureGenerator.getInstance()

// Export utility function
export const generateProjectStructure = (
  masterplanContent: string,
  projectId: string,
  options: ProjectStructureOptions
): GeneratedFile[] => {
  return projectStructureGenerator.generateProjectStructure(masterplanContent, projectId, options)
}