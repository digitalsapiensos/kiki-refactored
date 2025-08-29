/**
 * File Generation Types
 * Type definitions for the file generation system
 */

export interface GeneratedFile {
  id: string
  name: string
  path: string
  content: string
  type: FileType
  size: number
  agentId: string
  projectId: string
  phase: number
  createdAt: Date
  metadata?: FileMetadata
}

export interface FileMetadata {
  source: 'llm-generated' | 'template' | 'user-uploaded'
  llmProvider?: 'deepseek' | 'openai'
  tokenUsage?: number
  processingTime?: number
  contentHash?: string
  version?: string
  dependencies?: string[]
  extractionMethod?: 'markdown_block' | 'pattern_match' | 'template_fill' | 'ai_analysis'
  confidence?: number
  [key: string]: any // Allow additional metadata properties
}

export type FileType = 
  | 'conversation_summary'
  | 'business_overview' 
  | 'logic_breakdown'
  | 'meta_outline'
  | 'masterplan'
  | 'project_structure'
  | 'documentation'
  | 'configuration'
  | 'code'
  | 'data'
  | 'assets'

export interface FileGenerationRequest {
  projectId: string
  agentId: string
  phase: number
  llmResponse: string
  expectedFiles?: ExpectedFile[]
  context?: GenerationContext
}

export interface ExpectedFile {
  name: string
  type: FileType
  required: boolean
  template?: string
  extractionPattern?: RegExp
}

export interface GenerationContext {
  conversationHistory: ConversationMessage[]
  userInputs: Record<string, any>
  projectMetadata: Record<string, any>
  previousFiles: GeneratedFile[]
}

export interface ConversationMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  agentId?: string
  timestamp: Date
}

export interface StorageOptions {
  strategy: 'database' | 'storage' | 'hybrid'
  maxSizeForDB: number // bytes
  compressionEnabled: boolean
  retentionDays?: number
}

export interface ZipArchive {
  id: string
  name: string
  projectId: string
  files: GeneratedFile[]
  totalSize: number
  createdAt: Date
  downloadUrl?: string
  expiresAt?: Date
}

export interface FileParsingResult {
  extractedFiles: ExtractedFileContent[]
  detectedPatterns: string[]
  confidence: number
  warnings: string[]
}

export interface ExtractedFileContent {
  fileName: string
  content: string
  type: FileType
  confidence: number
  extractionMethod: 'markdown_block' | 'pattern_match' | 'template_fill' | 'ai_analysis'
  metadata?: Record<string, any>
}

export interface FileGenerationStats {
  totalFiles: number
  totalSize: number
  byType: Record<FileType, number>
  byPhase: Record<number, number>
  processingTime: number
  storageUsage: {
    database: number
    storage: number
    total: number
  }
}