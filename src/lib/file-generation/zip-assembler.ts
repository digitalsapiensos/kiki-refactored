/**
 * ZIP Assembler
 * Creates downloadable ZIP archives from generated files
 */

import { GeneratedFile, ZipArchive } from './types'
import { storageManager } from './storage-manager'

export class ZipAssembler {
  private static instance: ZipAssembler
  
  public static getInstance(): ZipAssembler {
    if (!ZipAssembler.instance) {
      ZipAssembler.instance = new ZipAssembler()
    }
    return ZipAssembler.instance
  }

  /**
   * Create ZIP archive from project files
   */
  public async createProjectZip(
    projectId: string,
    name?: string,
    phases?: number[]
  ): Promise<ZipArchive> {
    try {
      // Get all files for the project
      const allFiles = await storageManager.getProjectFiles(projectId)
      
      // Filter by phases if specified
      const filesToInclude = phases && phases.length > 0 
        ? allFiles.filter(file => phases.includes(file.phase))
        : allFiles

      if (filesToInclude.length === 0) {
        throw new Error('No files found for ZIP creation')
      }

      // Generate ZIP archive metadata
      const archive: ZipArchive = {
        id: `zip-${projectId}-${Date.now()}`,
        name: name || `project-${projectId}-${new Date().toISOString().split('T')[0]}.zip`,
        projectId,
        files: filesToInclude,
        totalSize: filesToInclude.reduce((sum, file) => sum + file.size, 0),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }

      // For now, we'll create a downloadable URL that points to our API
      // In production, you might want to actually create the ZIP file and store it
      archive.downloadUrl = this.generateDownloadUrl(archive)

      return archive
    } catch (error) {
      console.error('Error creating ZIP archive:', error)
      throw new Error(`Failed to create ZIP archive: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate ZIP file structure as JSON (for API response)
   */
  public async generateZipStructure(archive: ZipArchive): Promise<{
    name: string
    files: Array<{
      path: string
      name: string
      content: string
      size: number
    }>
    totalSize: number
  }> {
    const zipFiles = []

    for (const file of archive.files) {
      zipFiles.push({
        path: file.path,
        name: file.name,
        content: file.content,
        size: file.size
      })
    }

    // Add a project info file
    const projectInfo = this.generateProjectInfoFile(archive)
    zipFiles.push({
      path: '/PROJECT_INFO.md',
      name: 'PROJECT_INFO.md', 
      content: projectInfo,
      size: new Blob([projectInfo]).size
    })

    return {
      name: archive.name,
      files: zipFiles,
      totalSize: archive.totalSize
    }
  }

  /**
   * Create ZIP with proper folder structure
   */
  public async createStructuredZip(
    projectId: string,
    name?: string
  ): Promise<ZipArchive> {
    const files = await storageManager.getProjectFiles(projectId)
    
    // Group files by phase and organize structure
    const structuredFiles = this.organizeFilesStructure(files)
    
    const archive: ZipArchive = {
      id: `zip-structured-${projectId}-${Date.now()}`,
      name: name || `structured-project-${projectId}.zip`,
      projectId,
      files: structuredFiles,
      totalSize: structuredFiles.reduce((sum, file) => sum + file.size, 0),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    archive.downloadUrl = this.generateDownloadUrl(archive)
    return archive
  }

  /**
   * Organize files into proper project structure
   */
  private organizeFilesStructure(files: GeneratedFile[]): GeneratedFile[] {
    const structuredFiles = [...files]

    // Add README.md at root
    const readmeContent = this.generateProjectReadme(files)
    structuredFiles.push({
      id: `readme-${Date.now()}`,
      name: 'README.md',
      path: '/README.md',
      content: readmeContent,
      type: 'documentation',
      size: new Blob([readmeContent]).size,
      agentId: 'system',
      projectId: files[0]?.projectId || 'unknown',
      phase: 0,
      createdAt: new Date(),
      metadata: {
        source: 'template',
        generated: true
      }
    })

    // Add project structure overview
    const structureContent = this.generateProjectStructure(files)
    structuredFiles.push({
      id: `structure-${Date.now()}`,
      name: 'PROJECT_STRUCTURE.md',
      path: '/PROJECT_STRUCTURE.md', 
      content: structureContent,
      type: 'documentation',
      size: new Blob([structureContent]).size,
      agentId: 'system',
      projectId: files[0]?.projectId || 'unknown',
      phase: 0,
      createdAt: new Date(),
      metadata: {
        source: 'template',
        generated: true
      }
    })

    return structuredFiles
  }

  /**
   * Generate download URL for ZIP archive
   */
  private generateDownloadUrl(archive: ZipArchive): string {
    // This points to our download API endpoint
    return `/api/download/zip/${archive.id}?project=${archive.projectId}`
  }

  /**
   * Generate project info file content
   */
  private generateProjectInfoFile(archive: ZipArchive): string {
    const filesByPhase = archive.files.reduce((acc, file) => {
      if (!acc[file.phase]) {
        acc[file.phase] = []
      }
      acc[file.phase].push(file)
      return acc
    }, {} as Record<number, GeneratedFile[]>)

    const phaseNames = {
      1: 'Discovery & Concept',
      2: 'Business Analysis', 
      3: 'Master Planning',
      4: 'Project Structure',
      5: 'Operations Setup'
    }

    let content = `# Project Information

Generated: ${archive.createdAt.toISOString()}
Project ID: ${archive.projectId}
Total Files: ${archive.files.length}
Total Size: ${(archive.totalSize / 1024).toFixed(2)} KB

## File Summary

`

    Object.entries(filesByPhase)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([phase, files]) => {
        const phaseName = phaseNames[parseInt(phase) as keyof typeof phaseNames] || `Phase ${phase}`
        content += `### ${phaseName} (${files.length} files)\n\n`
        
        files.forEach(file => {
          content += `- **${file.name}** (${(file.size / 1024).toFixed(2)} KB) - ${file.type}\n`
        })
        
        content += '\n'
      })

    content += `## Usage Instructions

1. Extract this ZIP file to your desired location
2. Review the PROJECT_STRUCTURE.md file for project overview
3. Start with the discovery phase documents (01-discovery/)
4. Follow the numbered phases in order
5. Each phase builds upon the previous phase's outputs

## Generated by KIKI

This project was generated by the KIKI project creation system using professional AI agents.
Each file represents the output of a specialized agent working on your project requirements.

For questions or support, visit: [Your Support URL]
`

    return content
  }

  /**
   * Generate project README
   */
  private generateProjectReadme(files: GeneratedFile[]): string {
    const projectName = this.extractProjectName(files)
    
    return `# ${projectName}

This project was generated using the KIKI professional project creation system.

## Project Overview

This repository contains all the documentation, specifications, and initial structure for your project, organized by development phases.

## Structure

\`\`\`
/
├── 01-discovery/           # Initial project concept and requirements
├── 02-business-analysis/   # Business logic and domain analysis  
├── 03-master-plan/         # Strategic roadmap and technical plan
├── 04-project-structure/   # Project scaffolding and architecture
├── 05-operations/          # Development workflows and documentation
├── PROJECT_STRUCTURE.md   # Complete project overview
└── README.md              # This file
\`\`\`

## Getting Started

1. **Review Discovery Phase**: Start with \`01-discovery/conversation_summary.md\`
2. **Understand Business Logic**: Review the business analysis documents
3. **Study the Master Plan**: Examine the strategic roadmap
4. **Explore Project Structure**: Review the technical architecture
5. **Setup Operations**: Implement the recommended workflows

## Generated Files

Total: ${files.length} files
Generated: ${new Date().toISOString()}

## Next Steps

1. Set up your development environment
2. Initialize version control
3. Begin implementation following the master plan
4. Refer to operational documentation for workflows

---

*Generated by KIKI Professional Project Creation System*
`
  }

  /**
   * Generate project structure overview
   */
  private generateProjectStructure(files: GeneratedFile[]): string {
    const filesByPhase = files.reduce((acc, file) => {
      if (!acc[file.phase]) {
        acc[file.phase] = []
      }
      acc[file.phase].push(file)
      return acc
    }, {} as Record<number, GeneratedFile[]>)

    let content = `# Project Structure Overview

This document provides a complete overview of the generated project structure and files.

## File Organization

`

    Object.entries(filesByPhase)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([phase, phaseFiles]) => {
        content += `### Phase ${phase}\n\n`
        content += `**Purpose**: ${this.getPhaseDescription(parseInt(phase))}\n\n`
        
        phaseFiles.forEach(file => {
          content += `- **${file.path}${file.name}**\n`
          content += `  - Type: ${file.type}\n`
          content += `  - Size: ${(file.size / 1024).toFixed(2)} KB\n`
          content += `  - Agent: ${file.agentId}\n`
          if (file.metadata?.source) {
            content += `  - Source: ${file.metadata.source}\n`
          }
          content += '\n'
        })
      })

    content += `## Implementation Notes

Each phase builds upon the previous:
1. **Discovery** → Conversation summary and initial requirements
2. **Business Analysis** → Formal business documents and logic breakdown  
3. **Master Plan** → Strategic roadmap and technical architecture
4. **Project Structure** → Implementation scaffolding and organization
5. **Operations** → Development workflows and project management

## File Relationships

- Conversation Summary → Business Analysis Documents
- Business Documents → Master Plan
- Master Plan → Project Structure
- Project Structure → Operations Documentation

This ensures consistency and traceability throughout the project creation process.
`

    return content
  }

  /**
   * Helper methods
   */
  private extractProjectName(files: GeneratedFile[]): string {
    // Try to extract project name from conversation summary or other files
    const conversationSummary = files.find(f => f.type === 'conversation_summary')
    if (conversationSummary?.content) {
      const nameMatch = conversationSummary.content.match(/# Conversation Summary - (.+?)(?:\n|$)/)
      if (nameMatch) {
        return nameMatch[1]
      }
    }

    return 'Generated Project'
  }

  private getPhaseDescription(phase: number): string {
    const descriptions = {
      1: 'Initial discovery and requirements gathering',
      2: 'Business logic analysis and domain modeling',
      3: 'Strategic planning and technical architecture',
      4: 'Project scaffolding and structure creation', 
      5: 'Operations setup and workflow configuration'
    }

    return descriptions[phase as keyof typeof descriptions] || `Phase ${phase} activities`
  }

  /**
   * Cleanup old ZIP archives
   */
  public async cleanupExpiredArchives(): Promise<number> {
    // This would be implemented to clean up expired ZIP files
    // For now, return 0 as placeholder
    return 0
  }
}

// Export singleton instance
export const zipAssembler = ZipAssembler.getInstance()

// Export utility functions
export const createProjectZip = async (
  projectId: string,
  name?: string,
  phases?: number[]
): Promise<ZipArchive> => {
  return await zipAssembler.createProjectZip(projectId, name, phases)
}

export const createStructuredZip = async (
  projectId: string,
  name?: string
): Promise<ZipArchive> => {
  return await zipAssembler.createStructuredZip(projectId, name)
}