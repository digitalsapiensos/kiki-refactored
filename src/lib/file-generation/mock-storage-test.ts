/**
 * Mock Storage Test
 * Tests the hybrid storage system with mock data
 */

import { GeneratedFile, StorageOptions } from './types'

// Mock storage implementation for testing without database
export class MockStorageManager {
  private mockDatabase = new Map<string, any>()
  private mockStorage = new Map<string, string>()

  async storeFiles(files: GeneratedFile[], options: StorageOptions): Promise<GeneratedFile[]> {
    console.log(`📁 Mock Storage: Storing ${files.length} files with strategy: ${options.strategy}`)
    
    const storedFiles: GeneratedFile[] = []

    for (const file of files) {
      const shouldUseDatabase = options.strategy === 'database' || 
        (options.strategy === 'hybrid' && file.size <= options.maxSizeForDB)

      console.log(`📄 File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
      
      if (shouldUseDatabase) {
        console.log(`  → Database storage (size <= ${options.maxSizeForDB} bytes)`)
        
        // Mock database storage
        const dbRecord = {
          id: file.id,
          project_id: file.projectId,
          name: file.name,
          path: file.path,
          type: file.type,
          content: options.compressionEnabled && file.content.length > 1024 
            ? `[COMPRESSED] ${file.content.substring(0, 100)}...`
            : file.content,
          size: file.size,
          agent_id: file.agentId,
          phase: file.phase,
          metadata: file.metadata || {},
          storage_type: 'database',
          compressed: options.compressionEnabled && file.content.length > 1024,
          created_at: file.createdAt.toISOString()
        }

        this.mockDatabase.set(file.id, dbRecord)
        
        storedFiles.push({
          ...file,
          metadata: {
            ...file.metadata,
            storageType: 'database',
            compressed: dbRecord.compressed
          }
        })

      } else {
        console.log(`  → Storage service (size > ${options.maxSizeForDB} bytes)`)
        
        // Mock storage service
        const storagePath = `${file.projectId}/${file.phase}/${file.name}`
        const mockUrl = `https://mock-storage.supabase.co/storage/v1/object/public/generated-files/${storagePath}`
        
        this.mockStorage.set(storagePath, file.content)
        
        // Store metadata in mock database
        const dbRecord = {
          id: file.id,
          project_id: file.projectId,
          name: file.name,
          path: file.path,
          type: file.type,
          content: null, // Content is in storage
          size: file.size,
          agent_id: file.agentId,
          phase: file.phase,
          metadata: {
            ...file.metadata,
            storageUrl: mockUrl,
            storagePath: storagePath
          },
          storage_type: 'storage',
          storage_url: mockUrl,
          created_at: file.createdAt.toISOString()
        }

        this.mockDatabase.set(file.id, dbRecord)
        
        storedFiles.push({
          ...file,
          metadata: {
            ...file.metadata,
            storageType: 'storage',
            storageUrl: mockUrl,
            storagePath: storagePath
          }
        })
      }
    }

    console.log(`✅ Successfully stored ${storedFiles.length} files`)
    return storedFiles
  }

  async getProjectFiles(projectId: string, phase?: number): Promise<GeneratedFile[]> {
    console.log(`📂 Mock Storage: Retrieving files for project ${projectId}${phase ? ` phase ${phase}` : ''}`)
    
    const files: GeneratedFile[] = []

    for (const [id, record] of Array.from(this.mockDatabase.entries())) {
      if (record.project_id !== projectId) continue
      if (phase !== undefined && record.phase !== phase) continue

      let content = record.content

      // If content is in storage, retrieve it
      if (record.storage_type === 'storage' && record.metadata?.storagePath) {
        content = this.mockStorage.get(record.metadata.storagePath) || 'Error: Content not found in storage'
      }

      // Decompress if needed (mock)
      if (record.compressed && content) {
        content = content.replace('[COMPRESSED] ', '') + '[DECOMPRESSED]'
      }

      const file: GeneratedFile = {
        id: record.id,
        name: record.name,
        path: record.path,
        content: content || '',
        type: record.type,
        size: record.size,
        agentId: record.agent_id,
        projectId: record.project_id,
        phase: record.phase,
        createdAt: new Date(record.created_at),
        metadata: record.metadata
      }

      files.push(file)
    }

    console.log(`✅ Retrieved ${files.length} files`)
    return files
  }

  async getStorageStats(projectId?: string) {
    let totalFiles = 0
    let totalSize = 0
    let databaseFiles = 0
    let storageFiles = 0
    let databaseSize = 0
    let storageSize = 0

    for (const record of Array.from(this.mockDatabase.values())) {
      if (projectId && record.project_id !== projectId) continue

      totalFiles++
      totalSize += record.size

      if (record.storage_type === 'database') {
        databaseFiles++
        databaseSize += record.size
      } else {
        storageFiles++
        storageSize += record.size
      }
    }

    return {
      totalFiles,
      totalSize,
      databaseFiles,
      storageFiles,
      databaseSize,
      storageSize
    }
  }

  // Get mock data for inspection
  getMockData() {
    return {
      database: Object.fromEntries(this.mockDatabase),
      storage: Object.fromEntries(this.mockStorage)
    }
  }
}

export async function testHybridStorage() {
  console.log('🧪 Testing Hybrid Storage System...')
  
  const mockStorage = new MockStorageManager()
  
  // Create test files of different sizes
  const smallFile: GeneratedFile = {
    id: 'file-small-1',
    name: 'conversation_summary.md',
    path: '/01-discovery/',
    content: 'Small file content that should go to database',
    type: 'conversation_summary',
    size: 50, // 50 bytes - goes to database
    agentId: 'consultor-virtual',
    projectId: 'test-project-123',
    phase: 1,
    createdAt: new Date(),
    metadata: {
      source: 'llm-generated',
      llmProvider: 'deepseek'
    }
  }

  // Large file content
  const largeContent = 'Large file content '.repeat(10000) // ~200KB
  const largeFile: GeneratedFile = {
    id: 'file-large-1',
    name: 'masterplan.md',
    path: '/03-master-plan/',
    content: largeContent,
    type: 'masterplan',
    size: largeContent.length,
    agentId: 'arquitecto-senior',
    projectId: 'test-project-123',
    phase: 3,
    createdAt: new Date(),
    metadata: {
      source: 'llm-generated',
      llmProvider: 'deepseek'
    }
  }

  const mediumContent = 'Medium file content '.repeat(1000) // ~20KB
  const mediumFile: GeneratedFile = {
    id: 'file-medium-1', 
    name: '01_case_overview.md',
    path: '/02-business-analysis/',
    content: mediumContent,
    type: 'business_overview',
    size: mediumContent.length,
    agentId: 'business-analyst',
    projectId: 'test-project-123',
    phase: 2,
    createdAt: new Date(),
    metadata: {
      source: 'llm-generated',
      llmProvider: 'deepseek'
    }
  }

  // Test hybrid storage with 100KB threshold
  const storageOptions: StorageOptions = {
    strategy: 'hybrid',
    maxSizeForDB: 100 * 1024, // 100KB
    compressionEnabled: true,
    retentionDays: 7
  }

  console.log('\n📋 Test 1: Hybrid Storage Strategy')
  const storedFiles = await mockStorage.storeFiles([smallFile, mediumFile, largeFile], storageOptions)
  
  console.log('\n📋 Test 2: Retrieve Files')
  const retrievedFiles = await mockStorage.getProjectFiles('test-project-123')
  
  console.log('\n📋 Test 3: Storage Statistics')
  const stats = await mockStorage.getStorageStats('test-project-123')
  
  console.log('\n📊 Storage Stats:')
  console.log(`Total files: ${stats.totalFiles}`)
  console.log(`Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`)
  console.log(`Database files: ${stats.databaseFiles} (${(stats.databaseSize / 1024).toFixed(2)} KB)`)
  console.log(`Storage files: ${stats.storageFiles} (${(stats.storageSize / 1024).toFixed(2)} KB)`)
  
  console.log('\n✅ Hybrid Storage System is working correctly!')
  
  return {
    storedFiles,
    retrievedFiles,
    stats,
    mockData: mockStorage.getMockData()
  }
}