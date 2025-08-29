/**
 * Test Project Structure API
 * Temporary endpoint to test project structure generation functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { testProjectStructureIntegration } from '../../../lib/file-generation/test-project-structure'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting Project Structure Generation Test...')
    
    const result = await testProjectStructureIntegration()
    
    return NextResponse.json({
      success: true,
      message: 'Project structure generation test completed successfully',
      results: {
        structureDetected: !!result.manifest,
        totalStructureFiles: result.structureFiles.length,
        totalParsingFiles: result.parsingResult.extractedFiles.length,
        
        // Parsing Results
        parsingResults: {
          confidence: result.parsingResult.confidence,
          patterns: result.parsingResult.detectedPatterns,
          warnings: result.parsingResult.warnings,
          extractedFiles: result.parsingResult.extractedFiles.map(f => ({
            name: f.fileName,
            type: f.type,
            size: f.content.length,
            confidence: f.confidence,
            method: f.extractionMethod,
            isProjectStructure: !!f.metadata?.isProjectStructure
          }))
        },

        // Project Structure Results
        projectStructure: result.manifest ? {
          projectName: result.manifest.extractedInfo.projectName,
          techStack: result.manifest.extractedInfo.techStack,
          monorepoTool: result.manifest.extractedInfo.monorepoTool,
          detected: result.manifest.detected
        } : null,

        // Generated Files Summary
        generatedFiles: result.structureFiles.length > 0 ? {
          totalFiles: result.structureFiles.length,
          totalSizeKB: Math.round(result.stats!.totalSize / 1024),
          byType: Object.entries(result.stats!.byType).map(([type, files]) => ({
            type,
            count: (files as any[]).length,
            sizeKB: Math.round((files as any[]).reduce((sum, f) => sum + f.size, 0) / 1024)
          })),
          keyFiles: result.structureFiles
            .filter(f => ['package.json', 'README.md', 'CLAUDE.md', 'turbo.json'].includes(f.name))
            .map(f => ({
              name: f.name,
              path: f.path,
              sizeKB: Math.round(f.size / 1024),
              type: f.type
            }))
        } : null,

        // Sample Files Content (first 200 chars)
        sampleContent: result.structureFiles.length > 0 ? {
          packageJson: result.structureFiles.find(f => f.name === 'package.json')?.content.substring(0, 200),
          readme: result.structureFiles.find(f => f.name === 'README.md')?.content.substring(0, 200),
          claudeConfig: result.structureFiles.find(f => f.name === 'CLAUDE.md')?.content.substring(0, 200)
        } : null,

        // Test Results
        testResults: {
          structureDetectionWorking: !!result.manifest,
          fileGenerationWorking: result.structureFiles.length > 0,
          integrationWorking: !!result.manifest && result.structureFiles.length > 0,
          requiredFilesGenerated: ['package.json', 'README.md', 'CLAUDE.md'].every(fileName => 
            result.structureFiles.find(f => f.name === fileName)
          )
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test project structure error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Project structure generation test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}