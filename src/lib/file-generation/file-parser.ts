/**
 * File Parser
 * Extracts file content from LLM responses using various strategies
 */

import { 
  FileParsingResult, 
  ExtractedFileContent, 
  FileType, 
  ExpectedFile 
} from './types'

export class FileParser {
  private static instance: FileParser
  
  public static getInstance(): FileParser {
    if (!FileParser.instance) {
      FileParser.instance = new FileParser()
    }
    return FileParser.instance
  }

  /**
   * Parse LLM response to extract file content
   */
  public parseResponse(
    llmResponse: string, 
    agentId: string,
    expectedFiles?: ExpectedFile[]
  ): FileParsingResult {
    const extractedFiles: ExtractedFileContent[] = []
    const detectedPatterns: string[] = []
    const warnings: string[] = []

    // Strategy 1: Extract markdown code blocks with filenames
    const markdownFiles = this.extractMarkdownFiles(llmResponse)
    extractedFiles.push(...markdownFiles)
    if (markdownFiles.length > 0) {
      detectedPatterns.push('markdown_code_blocks')
    }

    // Strategy 2: Extract specific file patterns based on agent
    const agentSpecificFiles = this.extractAgentSpecificFiles(llmResponse, agentId)
    extractedFiles.push(...agentSpecificFiles)
    if (agentSpecificFiles.length > 0) {
      detectedPatterns.push('agent_specific_patterns')
    }

    // Strategy 3: Extract files based on expected file list
    if (expectedFiles) {
      const expectedFileContent = this.extractExpectedFiles(llmResponse, expectedFiles)
      extractedFiles.push(...expectedFileContent)
      if (expectedFileContent.length > 0) {
        detectedPatterns.push('expected_file_patterns')
      }
    }

    // Strategy 4: Generic content extraction for known file types
    const genericFiles = this.extractGenericFiles(llmResponse)
    extractedFiles.push(...genericFiles)
    if (genericFiles.length > 0) {
      detectedPatterns.push('generic_patterns')
    }

    // Calculate overall confidence
    const confidence = this.calculateConfidence(extractedFiles, detectedPatterns)

    // Generate warnings
    if (extractedFiles.length === 0) {
      warnings.push('No files extracted from response')
    }
    if (confidence < 0.7) {
      warnings.push('Low confidence in file extraction')
    }

    return {
      extractedFiles,
      detectedPatterns,
      confidence,
      warnings
    }
  }

  /**
   * Extract files from markdown code blocks
   */
  private extractMarkdownFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []
    
    // Pattern: ```markdown or ```[language] followed by content
    const markdownPattern = /```(?:markdown|md)?\s*\n([\s\S]*?)\n```/gi
    const matches = Array.from(response.matchAll(markdownPattern))

    matches.forEach((match, index) => {
      const content = match[1].trim()
      
      // Try to extract filename from content or context
      const fileName = this.extractFileNameFromContent(content, response, match.index) || 
                     `extracted_file_${index + 1}.md`
      
      files.push({
        fileName,
        content,
        type: this.inferFileType(fileName),
        confidence: 0.8,
        extractionMethod: 'markdown_block',
        metadata: {
          originalMatch: match[0],
          index: match.index
        }
      })
    })

    return files
  }

  /**
   * Extract files based on agent-specific patterns
   */
  private extractAgentSpecificFiles(response: string, agentId: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    switch (agentId) {
      case 'consultor-virtual':
        files.push(...this.extractConsultorFiles(response))
        break
      case 'business-analyst':  
        files.push(...this.extractBusinessAnalystFiles(response))
        break
      case 'arquitecto-senior':
        files.push(...this.extractArquitectoFiles(response))
        break
      case 'arquitecto-estructura':
        files.push(...this.extractEstructuraFiles(response))
        break
      case 'project-operations':
        files.push(...this.extractOperationsFiles(response))
        break
    }

    return files
  }

  /**
   * Extract conversation summary for consultor-virtual
   */
  private extractConsultorFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Look for conversation summary pattern
    const summaryPattern = /(?:conversation_summary\.md|# Conversation Summary)[\s\S]*?(?=\n#+|\n---|\n\*\*|$)/i
    const match = response.match(summaryPattern)

    if (match) {
      let content = match[0]
      
      // Clean up the content
      content = this.cleanMarkdownContent(content)
      
      files.push({
        fileName: 'conversation_summary.md',
        content,
        type: 'conversation_summary',
        confidence: 0.9,
        extractionMethod: 'pattern_match',
        metadata: {
          agent: 'consultor-virtual',
          pattern: 'conversation_summary'
        }
      })
    }

    return files
  }

  /**
   * Extract business analysis files
   */
  private extractBusinessAnalystFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Extract case overview
    const overviewPattern = /(?:01_case_overview\.md|# \[.*?\])[\s\S]*?(?=02_logic_breakdown|---|\n\*\*|$)/i
    const overviewMatch = response.match(overviewPattern)
    
    if (overviewMatch) {
      files.push({
        fileName: '01_case_overview.md',
        content: this.cleanMarkdownContent(overviewMatch[0]),
        type: 'business_overview',
        confidence: 0.85,
        extractionMethod: 'pattern_match',
        metadata: { agent: 'business-analyst', document: 'case_overview' }
      })
    }

    // Extract logic breakdown
    const logicPattern = /(?:02_logic_breakdown\.md|# Entities)[\s\S]*?(?=03_meta_outline|---|\n\*\*|$)/i
    const logicMatch = response.match(logicPattern)
    
    if (logicMatch) {
      files.push({
        fileName: '02_logic_breakdown.md', 
        content: this.cleanMarkdownContent(logicMatch[0]),
        type: 'logic_breakdown',
        confidence: 0.85,
        extractionMethod: 'pattern_match',
        metadata: { agent: 'business-analyst', document: 'logic_breakdown' }
      })
    }

    // Extract meta outline
    const metaPattern = /(?:03_meta_outline\.md|# Meta Tables)[\s\S]*?(?=---|$)/i
    const metaMatch = response.match(metaPattern)
    
    if (metaMatch) {
      files.push({
        fileName: '03_meta_outline.md',
        content: this.cleanMarkdownContent(metaMatch[0]),
        type: 'meta_outline', 
        confidence: 0.85,
        extractionMethod: 'pattern_match',
        metadata: { agent: 'business-analyst', document: 'meta_outline' }
      })
    }

    return files
  }

  /**
   * Extract arquitecto-senior files (masterplan)
   */
  private extractArquitectoFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Look for masterplan pattern
    const masterplanPattern = /(?:masterplan\.md|# .*Master.*Plan|# MASTER PLAN)[\s\S]*?(?=---|$)/i
    const match = response.match(masterplanPattern)

    if (match) {
      files.push({
        fileName: 'masterplan.md',
        content: this.cleanMarkdownContent(match[0]),
        type: 'masterplan',
        confidence: 0.9,
        extractionMethod: 'pattern_match',
        metadata: {
          agent: 'arquitecto-senior',
          document: 'masterplan'
        }
      })
    }

    return files
  }

  /**
   * Extract arquitecto-estructura files (project structure)
   */
  private extractEstructuraFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Check if this is a complete project structure response
    if (this.isProjectStructureResponse(response)) {
      // Generate project structure metadata file
      files.push({
        fileName: 'project-structure-manifest.json',
        content: this.generateProjectStructureManifest(response),
        type: 'project_structure',
        confidence: 0.9,
        extractionMethod: 'ai_analysis',
        metadata: {
          agent: 'arquitecto-estructura',
          isProjectStructure: true,
          requiresSpecialProcessing: true
        }
      })
    }

    // Look for specific project structure files
    const patterns = [
      { name: 'package.json', pattern: /```json[\s\S]*?"name"[\s\S]*?```/i, type: 'configuration' },
      { name: 'turbo.json', pattern: /```json[\s\S]*?"pipeline"[\s\S]*?```/i, type: 'configuration' },
      { name: 'README.md', pattern: /```markdown[\s\S]*?# .*[\s\S]*?```/i, type: 'documentation' },
      { name: '.gitignore', pattern: /```(?:text|gitignore)[\s\S]*?node_modules[\s\S]*?```/i, type: 'configuration' }
    ]

    patterns.forEach(({ name, pattern, type }) => {
      const match = response.match(pattern)
      if (match) {
        files.push({
          fileName: name,
          content: this.extractCodeBlockContent(match[0]),
          type: type as any,
          confidence: 0.85,
          extractionMethod: 'pattern_match',
          metadata: {
            agent: 'arquitecto-estructura',
            pattern: name,
            fileType: type
          }
        })
      }
    })

    return files
  }

  /**
   * Check if response contains a complete project structure
   */
  private isProjectStructureResponse(response: string): boolean {
    const structureIndicators = [
      'monorepo', 'apps/', 'packages/', 'turbo', 'workspace',
      'project structure', 'estructura', 'carpetas'
    ]
    
    const indicatorCount = structureIndicators.reduce((count, indicator) => {
      return count + (response.toLowerCase().includes(indicator.toLowerCase()) ? 1 : 0)
    }, 0)
    
    return indicatorCount >= 3 // If 3+ indicators, likely a project structure
  }

  /**
   * Generate manifest for project structure processing
   */
  private generateProjectStructureManifest(response: string): string {
    const manifest = {
      type: 'project-structure',
      timestamp: new Date().toISOString(),
      detected: {
        hasMonorepo: response.toLowerCase().includes('monorepo'),
        hasTurbo: response.toLowerCase().includes('turbo'),
        hasAppsFolder: response.toLowerCase().includes('apps/'),
        hasPackagesFolder: response.toLowerCase().includes('packages/'),
        hasClaudeConfig: response.toLowerCase().includes('claude.md')
      },
      extractedInfo: {
        projectName: this.extractProjectName(response),
        techStack: this.extractTechStack(response),
        monorepoTool: this.extractMonorepoTool(response)
      },
      requiresStructureGeneration: true,
      processingInstructions: {
        useProjectStructureGenerator: true,
        generateMonorepoStructure: true,
        createClaudeConfig: true
      }
    }

    return JSON.stringify(manifest, null, 2)
  }

  private extractProjectName(response: string): string {
    const namePatterns = [
      /# ([^#\n]+)/i,
      /proyecto[:\s]+([^\n]+)/i,
      /project[:\s]+([^\n]+)/i
    ]

    for (const pattern of namePatterns) {
      const match = response.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return 'Generated Project'
  }

  private extractTechStack(response: string): string[] {
    const techKeywords = [
      'Next.js', 'React', 'TypeScript', 'Node.js', 'Supabase', 
      'PostgreSQL', 'Tailwind', 'Turborepo', 'Nx'
    ]

    return techKeywords.filter(tech => 
      response.toLowerCase().includes(tech.toLowerCase())
    )
  }

  private extractMonorepoTool(response: string): string {
    if (response.toLowerCase().includes('turborepo') || response.toLowerCase().includes('turbo')) {
      return 'turborepo'
    }
    if (response.toLowerCase().includes('nx')) {
      return 'nx'
    }
    return 'npm-workspaces'
  }

  /**
   * Extract project operations files
   */
  private extractOperationsFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Look for operational files
    const patterns = [
      { name: 'BACKLOG.md', pattern: /(?:BACKLOG\.md|# .*BACKLOG|# Backlog)[\s\S]*?(?=---|$)/i },
      { name: 'STATUS_LOG.md', pattern: /(?:STATUS_LOG\.md|# .*STATUS|# Status)[\s\S]*?(?=---|$)/i }
    ]

    patterns.forEach(({ name, pattern }) => {
      const match = response.match(pattern)
      if (match) {
        files.push({
          fileName: name,
          content: this.cleanMarkdownContent(match[0]),
          type: this.inferFileType(name),
          confidence: 0.8,
          extractionMethod: 'pattern_match',
          metadata: {
            agent: 'project-operations',
            document: name
          }
        })
      }
    })

    return files
  }

  /**
   * Extract files based on expected file list
   */
  private extractExpectedFiles(response: string, expectedFiles: ExpectedFile[]): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    expectedFiles.forEach(expected => {
      if (expected.extractionPattern) {
        const match = response.match(expected.extractionPattern)
        if (match) {
          files.push({
            fileName: expected.name,
            content: this.cleanMarkdownContent(match[0]),
            type: expected.type,
            confidence: 0.7,
            extractionMethod: 'pattern_match',
            metadata: {
              expected: true,
              required: expected.required
            }
          })
        }
      }
    })

    return files
  }

  /**
   * Extract generic files from common patterns
   */
  private extractGenericFiles(response: string): ExtractedFileContent[] {
    const files: ExtractedFileContent[] = []

    // Look for file-like structures in the response
    const fileIndicators = [
      { pattern: /```(?:json|yaml|yml|xml)[\s\S]*?```/gi, type: 'configuration' as FileType },
      { pattern: /```(?:sql|postgres)[\s\S]*?```/gi, type: 'code' as FileType },
      { pattern: /```(?:dockerfile|docker)[\s\S]*?```/gi, type: 'configuration' as FileType }
    ]

    fileIndicators.forEach(({ pattern, type }) => {
      const matches = Array.from(response.matchAll(pattern))
      matches.forEach((match, index) => {
        const content = this.extractCodeBlockContent(match[0])
        const extension = this.getExtensionForType(type)
        
        files.push({
          fileName: `extracted_${type}_${index + 1}.${extension}`,
          content,
          type,
          confidence: 0.6,
          extractionMethod: 'pattern_match',
          metadata: {
            generic: true,
            originalPattern: pattern.toString()
          }
        })
      })
    })

    return files
  }

  /**
   * Helper methods
   */
  private extractFileNameFromContent(content: string, fullResponse: string, matchIndex?: number): string | null {
    // Look for filename patterns in the content or surrounding context
    const fileNamePatterns = [
      /^#\s+(.+\.md)$/m,
      /(?:archivo|file):\s*(.+\.\w+)/i,
      /(?:nombre|name):\s*(.+\.\w+)/i
    ]

    for (const pattern of fileNamePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    // Look in surrounding context if match index is provided
    if (matchIndex && matchIndex > 0) {
      const contextBefore = fullResponse.substring(Math.max(0, matchIndex - 200), matchIndex)
      for (const pattern of fileNamePatterns) {
        const match = contextBefore.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }
    }

    return null
  }

  private inferFileType(fileName: string): FileType {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    const typeMap: Record<string, FileType> = {
      'md': 'documentation',
      'json': 'configuration', 
      'yaml': 'configuration',
      'yml': 'configuration',
      'sql': 'code',
      'js': 'code',
      'ts': 'code',
      'jsx': 'code',
      'tsx': 'code'
    }

    if (fileName.includes('conversation_summary')) return 'conversation_summary'
    if (fileName.includes('case_overview')) return 'business_overview'
    if (fileName.includes('logic_breakdown')) return 'logic_breakdown'  
    if (fileName.includes('meta_outline')) return 'meta_outline'
    if (fileName.includes('masterplan')) return 'masterplan'

    return typeMap[extension || ''] || 'documentation'
  }

  private cleanMarkdownContent(content: string): string {
    return content
      .replace(/^```(?:markdown|md)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()
  }

  private extractCodeBlockContent(codeBlock: string): string {
    return codeBlock
      .replace(/^```\w*\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()
  }

  private getExtensionForType(type: FileType): string {
    const extensionMap: Record<FileType, string> = {
      'conversation_summary': 'md',
      'business_overview': 'md', 
      'logic_breakdown': 'md',
      'meta_outline': 'md',
      'masterplan': 'md',
      'project_structure': 'md',
      'documentation': 'md',
      'configuration': 'json',
      'code': 'js',
      'data': 'json',
      'assets': 'txt'
    }

    return extensionMap[type] || 'txt'
  }

  private calculateConfidence(files: ExtractedFileContent[], patterns: string[]): number {
    if (files.length === 0) return 0

    const avgFileConfidence = files.reduce((sum, file) => sum + file.confidence, 0) / files.length
    const patternBonus = Math.min(patterns.length * 0.1, 0.3)
    
    return Math.min(avgFileConfidence + patternBonus, 1.0)
  }
}

// Export singleton instance
export const fileParser = FileParser.getInstance()