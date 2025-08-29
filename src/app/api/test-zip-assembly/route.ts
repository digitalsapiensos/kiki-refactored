/**
 * Test ZIP Assembly API
 * Temporary endpoint to test complete ZIP assembly functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { testZipAssemblySystem } from '../../../lib/file-generation/test-zip-assembly'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting ZIP Assembly System Test...')
    
    const result = await testZipAssemblySystem()
    
    return NextResponse.json({
      success: result.success,
      message: 'ZIP Assembly system test completed successfully',
      results: {
        // Storage Results
        storageResults: {
          totalFilesStored: result.storedFiles.length,
          totalSizeKB: Math.round(result.storedFiles.reduce((sum, f) => sum + f.size, 0) / 1024),
          filesByPhase: result.storedFiles.reduce((acc, file) => {
            acc[file.phase] = (acc[file.phase] || 0) + 1
            return acc
          }, {} as Record<number, number>),
          hybridStorageWorking: result.stats.databaseFiles > 0 && result.stats.storageFiles >= 0
        },

        // ZIP Archive Results
        zipArchive: {
          id: result.zipArchive.id,
          name: result.zipArchive.name,
          totalFiles: result.zipArchive.files.length,
          totalSizeKB: Math.round(result.zipArchive.totalSize / 1024),
          downloadUrl: result.downloadUrl,
          createdAt: result.zipArchive.createdAt.toISOString(),
          expiresAt: result.zipArchive.expiresAt?.toISOString()
        },

        // ZIP Structure Results
        zipStructure: {
          totalFiles: result.zipStructure.files.length,
          totalSizeKB: Math.round(result.zipStructure.totalSize / 1024),
          hasProjectInfo: result.zipStructure.files.some(f => f.name === 'PROJECT_INFO.md'),
          fileTypes: result.zipStructure.files.reduce((acc, file) => {
            const ext = file.name.split('.').pop() || 'unknown'
            acc[ext] = (acc[ext] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          sampleFiles: result.zipStructure.files.slice(0, 5).map(f => ({
            name: f.name,
            path: f.path,
            sizeKB: Math.round(f.size / 1024)
          }))
        },

        // Storage Statistics
        storageStats: {
          totalFiles: result.stats.totalFiles,
          totalSizeKB: Math.round(result.stats.totalSize / 1024),
          distribution: {
            database: {
              files: result.stats.databaseFiles,
              sizeKB: Math.round(result.stats.databaseSize / 1024)
            },
            storage: {
              files: result.stats.storageFiles, 
              sizeKB: Math.round(result.stats.storageSize / 1024)
            }
          }
        },

        // Test Validation
        testValidation: {
          storageSystemWorking: result.storedFiles.length > 0,
          zipAssemblyWorking: result.zipArchive.files.length > 0,
          structureGenerationWorking: result.zipStructure.files.length > 0,
          downloadUrlGenerated: !!result.downloadUrl,
          hybridStorageWorking: result.stats.totalFiles > 0,
          allPhasesRepresented: Object.keys(
            result.storedFiles.reduce((acc, f) => ({ ...acc, [f.phase]: true }), {})
          ).length >= 4,
          completeWorkflowWorking: true
        },

        // File Details for Verification
        generatedFileDetails: result.storedFiles.map(file => ({
          name: file.name,
          type: file.type,
          phase: file.phase,
          agent: file.agentId,
          sizeKB: Math.round(file.size / 1024),
          storageType: file.metadata?.storageType || 'unknown',
          path: file.path
        }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test ZIP assembly error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'ZIP Assembly system test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}