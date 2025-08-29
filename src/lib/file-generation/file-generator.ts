/**
 * File Generator
 * Main orchestrator for generating real files from LLM responses
 */

import { 
  GeneratedFile, 
  FileGenerationRequest, 
  FileGenerationStats,
  FileType,
  StorageOptions 
} from './types'
import { fileParser } from './file-parser'
import { storageManager } from './storage-manager'
import { projectStructureGenerator, ProjectStructureOptions } from './project-structure-generator'

export class FileGenerator {
  private static instance: FileGenerator
  
  public static getInstance(): FileGenerator {
    if (!FileGenerator.instance) {
      FileGenerator.instance = new FileGenerator()
    }
    return FileGenerator.instance
  }

  /**
   * Generate files from LLM response
   */
  public async generateFiles(request: FileGenerationRequest): Promise<{
    files: GeneratedFile[]
    stats: FileGenerationStats
    warnings: string[]
  }> {
    const startTime = Date.now()
    const generatedFiles: GeneratedFile[] = []
    const warnings: string[] = []

    try {
      // Parse the LLM response to extract file content
      const parsingResult = fileParser.parseResponse(
        request.llmResponse,
        request.agentId,
        request.expectedFiles
      )

      // Add parser warnings
      warnings.push(...parsingResult.warnings)

      // Convert extracted content to GeneratedFile objects
      for (const extracted of parsingResult.extractedFiles) {
        // Check if this is a project structure that needs special processing
        if (extracted.metadata?.isProjectStructure && extracted.fileName === 'project-structure-manifest.json') {
          console.log('🏗️ Detected project structure - generating complete monorepo...')
          
          // Parse the manifest to get project structure options
          const manifest = JSON.parse(extracted.content)
          const structureOptions: ProjectStructureOptions = {
            projectName: manifest.extractedInfo.projectName || 'Generated Project',
            techStack: manifest.extractedInfo.techStack || ['React', 'TypeScript'],
            monorepoTool: manifest.extractedInfo.monorepoTool as 'turborepo' | 'nx' | 'npm-workspaces',
            hasAdminPanel: manifest.detected.hasAppsFolder,
            hasLandingPage: false, // Default
            packageManager: 'npm'
          }

          // Generate complete project structure using the specialized generator
          const structureFiles = projectStructureGenerator.generateProjectStructure(
            request.llmResponse,
            request.projectId,
            structureOptions
          )

          // Add all structure files to generated files
          generatedFiles.push(...structureFiles)
          
          console.log(`✅ Generated ${structureFiles.length} project structure files`)
          continue // Skip regular processing for this manifest file
        }

        // Regular file processing
        const generatedFile: GeneratedFile = {
          id: `file-${request.projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: extracted.fileName,
          path: this.generateFilePath(extracted.fileName, extracted.type, request.phase),
          content: extracted.content,
          type: extracted.type,
          size: new Blob([extracted.content]).size,
          agentId: request.agentId,
          projectId: request.projectId,
          phase: request.phase,
          createdAt: new Date(),
          metadata: {
            source: 'llm-generated',
            llmProvider: 'deepseek',
            contentHash: this.generateContentHash(extracted.content),
            extractionMethod: extracted.extractionMethod,
            confidence: extracted.confidence,
            version: '1.0'
          }
        }

        generatedFiles.push(generatedFile)
      }

      // Store the generated files
      const storageOptions: StorageOptions = {
        strategy: 'hybrid',
        maxSizeForDB: 100 * 1024, // 100KB
        compressionEnabled: true,
        retentionDays: 7
      }

      const storedFiles = await storageManager.storeFiles(generatedFiles, storageOptions)
      
      // Generate statistics
      const stats = this.generateStats(storedFiles, Date.now() - startTime)

      return {
        files: storedFiles,
        stats,
        warnings
      }

    } catch (error) {
      console.error('Error generating files:', error)
      
      // Return error information
      warnings.push(`File generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      return {
        files: [],
        stats: this.generateEmptyStats(Date.now() - startTime),
        warnings
      }
    }
  }

  /**
   * Generate files for specific agent conversations
   */
  public async generateAgentFiles(
    agentId: string,
    projectId: string,
    phase: number,
    llmResponse: string
  ): Promise<GeneratedFile[]> {
    const expectedFiles = this.getExpectedFilesForAgent(agentId)
    
    const request: FileGenerationRequest = {
      projectId,
      agentId,
      phase,
      llmResponse,
      expectedFiles
    }

    const result = await this.generateFiles(request)
    return result.files
  }

  /**
   * Get expected files for each agent
   */
  private getExpectedFilesForAgent(agentId: string) {
    const agentFileMap = {
      'consultor-virtual': [
        { 
          name: 'conversation_summary.md', 
          type: 'conversation_summary' as FileType, 
          required: true,
          extractionPattern: /(?:conversation_summary\.md|# Conversation Summary)[\s\S]*?(?=\n#+|\n---|\n\*\*|$)/i
        }
      ],
      'business-analyst': [
        { 
          name: '01_case_overview.md', 
          type: 'business_overview' as FileType, 
          required: true,
          extractionPattern: /(?:01_case_overview\.md|# \[.*?\])[\s\S]*?(?=02_logic_breakdown|---|\n\*\*|$)/i
        },
        { 
          name: '02_logic_breakdown.md', 
          type: 'logic_breakdown' as FileType, 
          required: true,
          extractionPattern: /(?:02_logic_breakdown\.md|# Entities)[\s\S]*?(?=03_meta_outline|---|\n\*\*|$)/i
        },
        { 
          name: '03_meta_outline.md', 
          type: 'meta_outline' as FileType, 
          required: true,
          extractionPattern: /(?:03_meta_outline\.md|# Meta Tables)[\s\S]*?(?=---|$)/i
        }
      ],
      'arquitecto-senior': [
        { 
          name: 'masterplan.md', 
          type: 'masterplan' as FileType, 
          required: true,
          extractionPattern: /(?:masterplan\.md|# .*Master.*Plan|# MASTER PLAN)[\s\S]*?(?=---|$)/i
        }
      ],
      'arquitecto-estructura': [
        { 
          name: 'project-structure.md', 
          type: 'project_structure' as FileType, 
          required: true,
          extractionPattern: /(?:project.structure|estructura)[\s\S]*?(?=---|$)/i
        },
        { 
          name: 'package.json', 
          type: 'configuration' as FileType, 
          required: false,
          extractionPattern: /```json[\s\S]*?"name"[\s\S]*?```/i
        },
        { 
          name: 'README.md', 
          type: 'documentation' as FileType, 
          required: false,
          extractionPattern: /```markdown[\s\S]*?# .*[\s\S]*?```/i
        }
      ],
      'project-operations': [
        { 
          name: 'BACKLOG.md', 
          type: 'documentation' as FileType, 
          required: true,
          extractionPattern: /(?:BACKLOG\.md|# .*BACKLOG|# Backlog)[\s\S]*?(?=---|$)/i
        },
        { 
          name: 'STATUS_LOG.md', 
          type: 'documentation' as FileType, 
          required: true,
          extractionPattern: /(?:STATUS_LOG\.md|# .*STATUS|# Status)[\s\S]*?(?=---|$)/i
        }
      ]
    }

    return agentFileMap[agentId as keyof typeof agentFileMap] || []
  }

  /**
   * Generate appropriate file path based on type and phase
   */
  private generateFilePath(fileName: string, type: FileType, phase: number): string {
    const basePaths = {
      'conversation_summary': '/01-discovery/',
      'business_overview': '/02-business-analysis/',
      'logic_breakdown': '/02-business-analysis/',
      'meta_outline': '/02-business-analysis/',
      'masterplan': '/03-master-plan/',
      'project_structure': '/04-project-structure/',
      'documentation': `/0${phase}-phase-${phase}/docs/`,
      'configuration': `/0${phase}-phase-${phase}/config/`,
      'code': `/0${phase}-phase-${phase}/src/`,
      'data': `/0${phase}-phase-${phase}/data/`,
      'assets': `/0${phase}-phase-${phase}/assets/`
    }

    const basePath = basePaths[type] || `/0${phase}-phase-${phase}/misc/`
    return `${basePath}${fileName}`
  }

  /**
   * Generate content hash for file integrity
   */
  private generateContentHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * Generate file generation statistics
   */
  private generateStats(files: GeneratedFile[], processingTime: number): FileGenerationStats {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    
    const byType = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1
      return acc
    }, {} as Record<FileType, number>)

    const byPhase = files.reduce((acc, file) => {
      acc[file.phase] = (acc[file.phase] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Calculate storage usage (simplified)
    const dbFiles = files.filter(f => f.size <= 100 * 1024)
    const storageFiles = files.filter(f => f.size > 100 * 1024)

    return {
      totalFiles: files.length,
      totalSize,
      byType,
      byPhase,
      processingTime,
      storageUsage: {
        database: dbFiles.reduce((sum, f) => sum + f.size, 0),
        storage: storageFiles.reduce((sum, f) => sum + f.size, 0),
        total: totalSize
      }
    }
  }

  /**
   * Generate empty stats for error cases
   */
  private generateEmptyStats(processingTime: number): FileGenerationStats {
    return {
      totalFiles: 0,
      totalSize: 0,
      byType: {} as Record<FileType, number>,
      byPhase: {} as Record<number, number>,
      processingTime,
      storageUsage: {
        database: 0,
        storage: 0,
        total: 0
      }
    }
  }

  /**
   * Get files for a specific project and phase
   */
  public async getProjectFiles(projectId: string, phase?: number): Promise<GeneratedFile[]> {
    return await storageManager.getProjectFiles(projectId, phase)
  }

  /**
   * Delete files for cleanup
   */
  public async deleteFiles(fileIds: string[]): Promise<void> {
    await storageManager.deleteFiles(fileIds)
  }

  /**
   * Get file generation statistics for a project
   */
  public async getProjectStats(projectId: string): Promise<FileGenerationStats> {
    const files = await this.getProjectFiles(projectId)
    return this.generateStats(files, 0)
  }
}

// Export singleton instance
export const fileGenerator = FileGenerator.getInstance()

// Export utility functions
export const generateFilesFromLLM = async (
  projectId: string,
  agentId: string, 
  phase: number,
  llmResponse: string
): Promise<GeneratedFile[]> => {
  return await fileGenerator.generateAgentFiles(agentId, projectId, phase, llmResponse)
}

export const getProjectFiles = async (
  projectId: string, 
  phase?: number
): Promise<GeneratedFile[]> => {
  return await fileGenerator.getProjectFiles(projectId, phase)
}