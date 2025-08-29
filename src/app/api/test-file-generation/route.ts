/**
 * Test File Generation API
 * Temporary endpoint to test file generation functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { testFileGeneration } from '../../../lib/file-generation/test-file-generation'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting File Generation Test...')
    
    const result = await testFileGeneration()
    
    return NextResponse.json({
      success: true,
      message: 'File generation test completed successfully',
      results: {
        consultorFiles: result.consultorResult.extractedFiles.length,
        businessFiles: result.businessResult.extractedFiles.length,
        totalFiles: result.totalFiles,
        consultorConfidence: result.consultorResult.confidence,
        businessConfidence: result.businessResult.confidence,
        extractedFiles: [
          ...result.consultorResult.extractedFiles.map(f => ({
            name: f.fileName,
            type: f.type,
            size: f.content.length,
            confidence: f.confidence,
            method: f.extractionMethod,
            agent: 'consultor-virtual'
          })),
          ...result.businessResult.extractedFiles.map(f => ({
            name: f.fileName,
            type: f.type,
            size: f.content.length,
            confidence: f.confidence,
            method: f.extractionMethod,
            agent: 'business-analyst'
          }))
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test file generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'File generation test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}