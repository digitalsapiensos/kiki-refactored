/**
 * ZIP Download API Route
 * Handles ZIP file downloads for generated project files
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { zipAssembler } from '../../../../../lib/file-generation/zip-assembler'
import type { Database } from '../../../../../lib/database.types'

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
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    const archiveId = params.id

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

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
      }
    }

    console.log(`📦 Creating ZIP archive for project: ${projectId}`)

    // Create ZIP archive
    const archive = await zipAssembler.createStructuredZip(
      projectId,
      `project-${projectId}-${new Date().toISOString().split('T')[0]}.zip`
    )

    // Get ZIP structure for download
    const zipStructure = await zipAssembler.generateZipStructure(archive)

    console.log(`✅ ZIP archive created: ${archive.name} (${zipStructure.files.length} files)`)

    // For demonstration, return JSON structure
    // In production, you would return actual ZIP binary data
    return NextResponse.json({
      archive: {
        id: archive.id,
        name: archive.name,
        projectId: archive.projectId,
        totalFiles: zipStructure.files.length,
        totalSize: zipStructure.totalSize,
        createdAt: archive.createdAt.toISOString(),
        expiresAt: archive.expiresAt?.toISOString()
      },
      files: zipStructure.files,
      downloadInstructions: {
        method: 'POST',
        endpoint: `/api/download/zip/${archiveId}/binary`,
        contentType: 'application/zip',
        filename: archive.name
      }
    })

  } catch (error) {
    console.error('Error creating ZIP download:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to create ZIP download',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Create and return actual ZIP binary data
    const archive = await zipAssembler.createStructuredZip(projectId)
    const zipStructure = await zipAssembler.generateZipStructure(archive)

    // For now, return a simulated ZIP response
    // In production, you would use a library like JSZip to create actual ZIP binary
    const mockZipContent = this.createMockZipContent(zipStructure)

    return new NextResponse(mockZipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${archive.name}"`,
        'Content-Length': mockZipContent.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error creating binary ZIP:', error)
    
    return NextResponse.json(
      { error: 'Failed to create ZIP file' },
      { status: 500 }
    )
  }
}

// Helper function to create mock ZIP content
function createMockZipContent(zipStructure: any): Uint8Array {
  // This is a simplified mock - in production, use JSZip or similar
  const content = `Mock ZIP Archive: ${zipStructure.name}

Files included:
${zipStructure.files.map((file: any) => `- ${file.path}${file.name}`).join('\n')}

Total files: ${zipStructure.files.length}
Total size: ${(zipStructure.totalSize / 1024).toFixed(2)} KB

This is a mock ZIP file for demonstration.
In production, this would be actual ZIP binary data.
`

  return new TextEncoder().encode(content)
}