/**
 * Project Files API Route
 * Handles listing and managing generated files for projects
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fileGenerator, createProjectZip } from '../../../../lib/file-generation'
import type { Database } from '../../../../lib/database.types'

// Configure Supabase Admin Client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const phase = searchParams.get('phase')
    const action = searchParams.get('action')
    const projectId = params.projectId

    // Verify user authentication (optional for development)
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (!authError && authUser) {
        user = authUser
        
        // Verify user has access to the project
        const { data: project, error: projectError } = await supabaseAdmin
          .from('kiki_projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single()

        if (projectError || !project) {
          return NextResponse.json(
            { error: 'Project not found or access denied' },
            { status: 404 }
          )
        }
      }
    }

    if (action === 'zip') {
      // Create ZIP archive
      const phases = searchParams.get('phases')?.split(',').map(p => parseInt(p))
      const archive = await createProjectZip(projectId, undefined, phases)
      
      return NextResponse.json({
        archive: {
          id: archive.id,
          name: archive.name,
          totalFiles: archive.files.length,
          totalSize: archive.totalSize,
          downloadUrl: archive.downloadUrl,
          createdAt: archive.createdAt.toISOString(),
          expiresAt: archive.expiresAt?.toISOString()
        }
      })
    }

    if (action === 'stats') {
      // Get file statistics
      const stats = await fileGenerator.getProjectStats(projectId)
      
      return NextResponse.json({
        stats: {
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSize,
          byType: stats.byType,
          byPhase: stats.byPhase,
          storageUsage: stats.storageUsage
        }
      })
    }

    // Default: List files
    const phaseNumber = phase ? parseInt(phase) : undefined
    const files = await fileGenerator.getProjectFiles(projectId, phaseNumber)

    // Group files by phase
    const filesByPhase = files.reduce((acc, file) => {
      if (!acc[file.phase]) {
        acc[file.phase] = []
      }
      acc[file.phase].push({
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size,
        agentId: file.agentId,
        createdAt: file.createdAt.toISOString(),
        metadata: {
          source: file.metadata?.source,
          extractionMethod: file.metadata?.extractionMethod,
          confidence: file.metadata?.confidence
        }
      })
      return acc
    }, {} as Record<number, any[]>)

    return NextResponse.json({
      projectId,
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      filesByPhase,
      availablePhases: Object.keys(filesByPhase).map(p => parseInt(p)).sort()
    })

  } catch (error) {
    console.error('Error listing project files:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to list project files',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const phase = searchParams.get('phase')
    const projectId = params.projectId

    if (!fileId && !phase) {
      return NextResponse.json(
        { error: 'Either fileId or phase parameter is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('kiki_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    if (fileId) {
      // Delete specific file
      await fileGenerator.deleteFiles([fileId])
      
      return NextResponse.json({
        message: 'File deleted successfully',
        deletedFileId: fileId
      })
    }

    if (phase) {
      // Delete all files for a phase
      const phaseNumber = parseInt(phase)
      const files = await fileGenerator.getProjectFiles(projectId, phaseNumber)
      const fileIds = files.map(f => f.id)
      
      if (fileIds.length > 0) {
        await fileGenerator.deleteFiles(fileIds)
      }
      
      return NextResponse.json({
        message: `Deleted ${fileIds.length} files from phase ${phaseNumber}`,
        deletedCount: fileIds.length,
        phase: phaseNumber
      })
    }

  } catch (error) {
    console.error('Error deleting files:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to delete files',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}