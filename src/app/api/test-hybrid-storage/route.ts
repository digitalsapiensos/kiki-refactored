/**
 * Test Hybrid Storage API
 * Temporary endpoint to test hybrid storage functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { testHybridStorage } from '../../../lib/file-generation/mock-storage-test'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting Hybrid Storage Test...')
    
    const result = await testHybridStorage()
    
    return NextResponse.json({
      success: true,
      message: 'Hybrid storage test completed successfully',
      results: {
        totalStoredFiles: result.storedFiles.length,
        totalRetrievedFiles: result.retrievedFiles.length,
        stats: result.stats,
        storageDistribution: {
          database: {
            files: result.stats.databaseFiles,
            sizeKB: Math.round(result.stats.databaseSize / 1024)
          },
          storage: {
            files: result.stats.storageFiles, 
            sizeKB: Math.round(result.stats.storageSize / 1024)
          }
        },
        hybridStrategyWorking: result.stats.databaseFiles > 0 && result.stats.storageFiles > 0,
        fileDetails: result.storedFiles.map(f => ({
          name: f.name,
          size: f.size,
          sizeKB: Math.round(f.size / 1024),
          storageType: f.metadata?.storageType,
          phase: f.phase,
          type: f.type
        }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test hybrid storage error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Hybrid storage test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}