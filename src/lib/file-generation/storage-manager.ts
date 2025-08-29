/**
 * Storage Manager
 * Handles hybrid storage of generated files (Database + Supabase Storage)
 */

import { createClient } from '@supabase/supabase-js'
import { GeneratedFile, StorageOptions } from './types'
import type { Database } from '../database.types'

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export class StorageManager {
  private static instance: StorageManager
  
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * Store files using hybrid strategy
   */
  public async storeFiles(
    files: GeneratedFile[], 
    options: StorageOptions
  ): Promise<GeneratedFile[]> {
    const storedFiles: GeneratedFile[] = []

    for (const file of files) {
      try {
        if (options.strategy === 'hybrid') {
          if (file.size <= options.maxSizeForDB) {
            // Store in database
            const stored = await this.storeInDatabase(file, options)
            storedFiles.push(stored)
          } else {
            // Store in Supabase Storage
            const stored = await this.storeInStorage(file, options)
            storedFiles.push(stored)
          }
        } else if (options.strategy === 'database') {
          const stored = await this.storeInDatabase(file, options)
          storedFiles.push(stored)
        } else if (options.strategy === 'storage') {
          const stored = await this.storeInStorage(file, options)
          storedFiles.push(stored)
        }
      } catch (error) {
        console.error(`Error storing file ${file.name}:`, error)
        // Continue with other files
      }
    }

    return storedFiles
  }

  /**
   * Store file in database (for small files)
   */
  private async storeInDatabase(
    file: GeneratedFile, 
    options: StorageOptions
  ): Promise<GeneratedFile> {
    let content = file.content
    
    // Compress content if enabled
    if (options.compressionEnabled && content.length > 1024) {
      content = await this.compressContent(content)
    }

    // Calculate expiration date
    const expiresAt = options.retentionDays 
      ? new Date(Date.now() + options.retentionDays * 24 * 60 * 60 * 1000)
      : null

    const fileRecord = {
      id: file.id,
      project_id: file.projectId,
      name: file.name,
      path: file.path,
      type: file.type,
      content: content,
      size: file.size,
      agent_id: file.agentId,
      phase: file.phase,
      metadata: file.metadata || {},
      storage_type: 'database' as const,
      compressed: options.compressionEnabled && content !== file.content,
      expires_at: expiresAt?.toISOString(),
      created_at: file.createdAt.toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('kiki_generated_files')
      .insert(fileRecord)
      .select()
      .single()

    if (error) {
      console.error('Database storage error:', error)
      throw new Error(`Failed to store file in database: ${error.message}`)
    }

    return {
      ...file,
      metadata: {
        ...file.metadata,
        storageType: 'database',
        compressed: fileRecord.compressed
      }
    }
  }

  /**
   * Store file in Supabase Storage (for large files)
   */
  private async storeInStorage(
    file: GeneratedFile, 
    options: StorageOptions
  ): Promise<GeneratedFile> {
    const bucket = 'generated-files'
    const filePath = `${file.projectId}/${file.phase}/${file.name}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.content, {
        contentType: this.getContentType(file.name),
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    // Calculate expiration date
    const expiresAt = options.retentionDays 
      ? new Date(Date.now() + options.retentionDays * 24 * 60 * 60 * 1000)
      : null

    // Store metadata in database
    const fileRecord = {
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
        storageUrl: urlData.publicUrl,
        storagePath: filePath
      },
      storage_type: 'storage' as const,
      storage_url: urlData.publicUrl,
      compressed: false,
      expires_at: expiresAt?.toISOString(),
      created_at: file.createdAt.toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('kiki_generated_files')
      .insert(fileRecord)
      .select()
      .single()

    if (error) {
      console.error('Database metadata storage error:', error)
      throw new Error(`Failed to store file metadata: ${error.message}`)
    }

    return {
      ...file,
      metadata: {
        ...file.metadata,
        storageType: 'storage',
        storageUrl: urlData.publicUrl,
        storagePath: filePath
      }
    }
  }

  /**
   * Retrieve files for a project
   */
  public async getProjectFiles(
    projectId: string, 
    phase?: number
  ): Promise<GeneratedFile[]> {
    let query = supabase
      .from('kiki_generated_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (phase !== undefined) {
      query = query.eq('phase', phase)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error retrieving files:', error)
      return []
    }

    const files: GeneratedFile[] = []

    for (const record of data || []) {
      let content = record.content

      // Handle storage files
      if (record.storage_type === 'storage' && record.storage_url) {
        try {
          const response = await fetch(record.storage_url)
          content = await response.text()
        } catch (error) {
          console.error('Error fetching storage content:', error)
          content = `Error: Could not retrieve content from storage`
        }
      }

      // Decompress if needed
      if (record.compressed && content) {
        try {
          content = await this.decompressContent(content)
        } catch (error) {
          console.error('Error decompressing content:', error)
        }
      }

      const file: GeneratedFile = {
        id: record.id,
        name: record.name,
        path: record.path,
        content: content || '',
        type: record.type as any,
        size: record.size,
        agentId: record.agent_id,
        projectId: record.project_id,
        phase: record.phase,
        createdAt: new Date(record.created_at),
        metadata: record.metadata as any
      }

      files.push(file)
    }

    return files
  }

  /**
   * Delete files
   */
  public async deleteFiles(fileIds: string[]): Promise<void> {
    // Get file records first to handle storage cleanup
    const { data: files, error: selectError } = await supabase
      .from('kiki_generated_files')
      .select('*')
      .in('id', fileIds)

    if (selectError) {
      console.error('Error selecting files for deletion:', selectError)
      return
    }

    // Delete from storage if needed
    for (const file of files || []) {
      if (file.storage_type === 'storage' && file.metadata?.storagePath) {
        const { error: storageError } = await supabase.storage
          .from('generated-files')
          .remove([file.metadata.storagePath])
          
        if (storageError) {
          console.error('Error deleting from storage:', storageError)
        }
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('kiki_generated_files')
      .delete()
      .in('id', fileIds)

    if (deleteError) {
      console.error('Error deleting files from database:', deleteError)
      throw new Error(`Failed to delete files: ${deleteError.message}`)
    }
  }

  /**
   * Cleanup expired files
   */
  public async cleanupExpiredFiles(): Promise<number> {
    const now = new Date().toISOString()

    // Get expired files
    const { data: expiredFiles, error: selectError } = await supabase
      .from('kiki_generated_files')
      .select('id, metadata')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)

    if (selectError || !expiredFiles?.length) {
      return 0
    }

    // Delete expired files
    const fileIds = expiredFiles.map(f => f.id)
    await this.deleteFiles(fileIds)

    return fileIds.length
  }

  /**
   * Helper methods
   */
  private async compressContent(content: string): Promise<string> {
    // Simple compression - in production, use a proper compression library
    // This is a placeholder implementation
    try {
      // Using built-in compression would require additional libraries
      // For now, return original content
      return content
    } catch (error) {
      console.error('Compression error:', error)
      return content
    }
  }

  private async decompressContent(content: string): Promise<string> {
    // Simple decompression - matches compressContent implementation
    try {
      // Using built-in decompression would require additional libraries
      // For now, return original content
      return content
    } catch (error) {
      console.error('Decompression error:', error)
      return content
    }
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    const contentTypes: Record<string, string> = {
      'md': 'text/markdown',
      'json': 'application/json',
      'yaml': 'text/yaml',
      'yml': 'text/yaml',
      'txt': 'text/plain',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'sql': 'text/plain'
    }

    return contentTypes[extension || ''] || 'text/plain'
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats(projectId?: string): Promise<{
    totalFiles: number
    totalSize: number
    databaseFiles: number
    storageFiles: number
    databaseSize: number
    storageSize: number
  }> {
    let query = supabase
      .from('kiki_generated_files')
      .select('storage_type, size')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error || !data) {
      return {
        totalFiles: 0,
        totalSize: 0,
        databaseFiles: 0,
        storageFiles: 0,
        databaseSize: 0,
        storageSize: 0
      }
    }

    const stats = data.reduce((acc, file) => {
      acc.totalFiles++
      acc.totalSize += file.size

      if (file.storage_type === 'database') {
        acc.databaseFiles++
        acc.databaseSize += file.size
      } else {
        acc.storageFiles++
        acc.storageSize += file.size
      }

      return acc
    }, {
      totalFiles: 0,
      totalSize: 0,
      databaseFiles: 0,
      storageFiles: 0,
      databaseSize: 0,
      storageSize: 0
    })

    return stats
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance()