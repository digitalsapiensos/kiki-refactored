import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { ProjectGenerator, type ProjectData } from '../../../../lib/project-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get project ID from request
    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('kiki_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch all phase data
    const { data: phaseData, error: phaseError } = await supabase
      .from('kiki_phase_data')
      .select('*')
      .eq('project_id', projectId)
      .order('phase', { ascending: true })

    if (phaseError) {
      return NextResponse.json(
        { error: 'Failed to fetch phase data' },
        { status: 500 }
      )
    }

    // Construct ProjectData from phase data
    const projectData = constructProjectData(project, phaseData || [])

    // Generate the project ZIP
    const generator = new ProjectGenerator(projectData)
    const blob = await generator.generateProjectZip()

    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Return the ZIP file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectData.projectName.toLowerCase().replace(/\s+/g, '-')}-kiki.zip"`
      }
    })

  } catch (error) {
    console.error('Error generating project:', error)
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    )
  }
}

function constructProjectData(
  project: any,
  phaseData: any[]
): ProjectData {
  // Extract data from each phase
  const phase1Data = phaseData.find(p => p.phase === 1)?.data || {}
  const phase2Data = phaseData.find(p => p.phase === 2)?.data || {}
  const phase3Data = phaseData.find(p => p.phase === 3)?.data || {}
  const phase4Data = phaseData.find(p => p.phase === 4)?.data || {}
  const phase5Data = phaseData.find(p => p.phase === 5)?.data || {}

  return {
    // Basic Info
    projectName: project.name,
    description: project.description || '',
    
    // Phase 1 - Conceptualization
    concept: phase1Data.concept || 'AI-powered solution',
    targetUser: phase1Data.targetUser || 'Modern professionals',
    coreProblem: phase1Data.coreProblem || 'Efficiency and productivity',
    mvpFeatures: phase1Data.mvpFeatures || [
      'User authentication',
      'Core functionality',
      'Dashboard interface'
    ],
    elevatorPitch: phase1Data.elevatorPitch || `${project.name} helps ${phase1Data.targetUser || 'users'} solve ${phase1Data.coreProblem || 'their problems'} through innovative technology.`,
    
    // Phase 2 - Research
    competitors: phase2Data.competitors || [
      {
        name: 'Competitor A',
        url: 'https://example.com',
        strengths: ['Market leader', 'Good UX'],
        weaknesses: ['Expensive', 'Limited features'],
        keyTakeaway: 'Focus on affordability and features'
      }
    ],
    githubRepos: phase2Data.githubRepos || [
      {
        name: 'awesome-project',
        url: 'https://github.com/example/awesome-project',
        stars: 1000,
        whyRelevant: 'Similar architecture',
        whatToTake: 'Authentication flow'
      }
    ],
    recommendedMCPs: phase2Data.recommendedMCPs || [
      {
        name: 'Context7',
        purpose: 'Documentation lookup',
        useCase: 'When implementing new libraries'
      },
      {
        name: 'Sequential',
        purpose: 'Complex analysis',
        useCase: 'For architectural decisions'
      },
      {
        name: 'Magic',
        purpose: 'UI component generation',
        useCase: 'Creating new components'
      }
    ],
    
    // Phase 3 - Technical Planning
    techStack: phase3Data.techStack || {
      frontend: {
        framework: 'Next.js 14',
        ui: 'shadcn/ui',
        styling: 'Tailwind CSS',
        reason: 'Modern, fast, and well-documented'
      },
      backend: {
        service: 'Supabase',
        database: 'PostgreSQL',
        auth: 'Supabase Auth',
        reason: 'Integrated solution with great DX'
      },
      deployment: {
        frontend: 'Vercel',
        reason: 'Seamless Next.js integration'
      }
    },
    databaseSchema: phase3Data.databaseSchema || {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'uuid', constraints: 'primary key' },
            { name: 'email', type: 'text', constraints: 'unique not null' },
            { name: 'created_at', type: 'timestamp', constraints: 'default now()' }
          ],
          relationships: []
        }
      ]
    },
    envVariables: phase3Data.envVariables || [
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        description: 'Your Supabase project URL',
        example: 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co'
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Your Supabase anon key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Your Supabase service role key (keep secret!)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    ]
  }
}