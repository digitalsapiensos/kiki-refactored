import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { getDeepSeekAnalyzer } from '../../../lib/deepseek-analyzer'
import { ConversationAnalyzer } from '../../../lib/conversation-analyzer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, phase } = await request.json()

    if (!messages || !phase) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let analysis = null

    // Try DeepSeek first if API key is available
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    
    if (deepseekApiKey) {
      try {
        const analyzer = getDeepSeekAnalyzer()
        
        switch (phase) {
          case 'conceptualization':
            analysis = await analyzer.analyzeConceptualization(messages)
            break
          case 'research':
            analysis = await analyzer.analyzeResearch(messages)
            break
          case 'tech-planning':
            analysis = await analyzer.analyzeTechPlanning(messages)
            break
          default:
            return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
        }
      } catch (error) {
        console.error('DeepSeek analysis failed, falling back to regex:', error)
        // Fallback to regex analysis
      }
    }

    // Fallback to regex-based analysis if DeepSeek failed or no API key
    if (!analysis) {
      switch (phase) {
        case 'conceptualization':
          analysis = ConversationAnalyzer.analyzeConceptualization(messages)
          break
        case 'research':
          analysis = ConversationAnalyzer.analyzeResearch(messages)
          break
        case 'tech-planning':
          analysis = ConversationAnalyzer.analyzeTechPlanning(messages)
          break
        default:
          return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    )
  }
}