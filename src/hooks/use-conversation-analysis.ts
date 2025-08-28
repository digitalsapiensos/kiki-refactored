/**
 * Hook for real-time conversation analysis
 * Monitors chat messages and determines when phase is complete
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ConversationAnalyzer, type ConceptAnalysis, type ResearchAnalysis, type TechPlanningAnalysis } from '../lib/conversation-analyzer'
import { getDeepSeekAnalyzer } from '../lib/deepseek-analyzer'
import type { Database } from '../lib/database.types'

type Message = Database['public']['Tables']['kiki_chat_messages']['Row']
type Phase = 'conceptualization' | 'research' | 'tech-planning' | 'documentation' | 'export'

interface UseConversationAnalysisProps {
  messages: Message[]
  currentPhase: Phase
  onPhaseComplete?: (analysis: any) => void
}

interface AnalysisState {
  isAnalyzing: boolean
  completeness: number
  canProceed: boolean
  missingElements: string[]
  extractedData: any
}

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second

export function useConversationAnalysis({
  messages,
  currentPhase,
  onPhaseComplete
}: UseConversationAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    completeness: 0,
    canProceed: false,
    missingElements: [],
    extractedData: null
  })
  
  // Track retry attempts and last analysis timestamp
  const retryCount = useRef(0)
  const lastAnalysisTime = useRef(0)
  const analysisInProgress = useRef(false)

  const analyzeConversation = useCallback(async () => {
    if (messages.length === 0) return
    
    // Prevent concurrent analysis
    if (analysisInProgress.current) return
    
    // Check if we've exceeded retry attempts
    if (retryCount.current >= MAX_RETRY_ATTEMPTS) {
      console.error('Maximum retry attempts reached, stopping analysis')
      return
    }
    
    // Throttle analysis calls
    const now = Date.now()
    if (now - lastAnalysisTime.current < RETRY_DELAY) {
      return
    }
    
    analysisInProgress.current = true
    lastAnalysisTime.current = now

    setAnalysis(prev => ({ ...prev, isAnalyzing: true }))

    try {
      let result: ConceptAnalysis | ResearchAnalysis | TechPlanningAnalysis | null = null
      
      // Prefer server-side analysis for better security and performance
      const useServerAnalysis = true // Always try server first
      
      if (useServerAnalysis) {
        try {
          const response = await fetch('/api/analyze-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages,
              phase: currentPhase
            })
          })

          if (response.ok) {
            const data = await response.json()
            result = data.analysis
          } else {
            throw new Error('Server analysis failed')
          }
        } catch (error) {
          console.error('Server analysis failed, falling back to client-side:', error)
          retryCount.current++
          // Fall through to client-side analysis
        }
      }
      
      // Fallback to client-side analysis if server failed
      if (!result) {
        // Check if we can use DeepSeek on client-side
        const clientDeepSeekKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
        
        if (clientDeepSeekKey) {
          try {
            const deepSeekAnalyzer = getDeepSeekAnalyzer()
            
            switch (currentPhase) {
              case 'conceptualization':
                result = await deepSeekAnalyzer.analyzeConceptualization(messages)
                break
              case 'research':
                result = await deepSeekAnalyzer.analyzeResearch(messages)
                break
              case 'tech-planning':
                result = await deepSeekAnalyzer.analyzeTechPlanning(messages)
                break
              default:
                break
            }
          } catch (error) {
            console.error('Client DeepSeek failed:', error)
          }
        }
        
        // Final fallback to regex-based analysis
        if (!result) {
          switch (currentPhase) {
            case 'conceptualization':
              result = ConversationAnalyzer.analyzeConceptualization(messages)
              break
            case 'research':
              result = ConversationAnalyzer.analyzeResearch(messages)
              break
            case 'tech-planning':
              result = ConversationAnalyzer.analyzeTechPlanning(messages)
              break
            default:
              break
          }
        }
      }

      if (result) {
        const canProceed = result.completeness >= 80 // 80% threshold
        
        setAnalysis({
          isAnalyzing: false,
          completeness: result.completeness,
          canProceed,
          missingElements: result.missingElements,
          extractedData: result.extractedData
        })

        // Notify parent when phase is complete
        if (canProceed && onPhaseComplete) {
          onPhaseComplete(result.extractedData)
        }
        
        // Reset retry count on success
        retryCount.current = 0
      } else {
        setAnalysis(prev => ({ ...prev, isAnalyzing: false }))
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error)
      retryCount.current++
      setAnalysis(prev => ({ ...prev, isAnalyzing: false }))
    } finally {
      analysisInProgress.current = false
    }
  }, [messages, currentPhase, onPhaseComplete])

  // Analyze whenever messages change
  useEffect(() => {
    // Only analyze after user messages (not assistant messages)
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      // Reset retry count for new user messages
      if (messages.length > 1) {
        const secondLastMessage = messages[messages.length - 2]
        if (secondLastMessage?.role === 'assistant') {
          retryCount.current = 0
        }
      }
      analyzeConversation()
    }
  }, [messages, analyzeConversation])

  // Helper to get contextual hints for the assistant
  const getAssistantHints = useCallback(() => {
    if (analysis.missingElements.length === 0) {
      return null
    }

    // Provide hints to guide the assistant's next question
    return {
      missingInfo: analysis.missingElements,
      completeness: analysis.completeness,
      suggestion: `Pregunta sobre: ${analysis.missingElements[0]}`
    }
  }, [analysis])

  // Helper to check if specific information is present
  const hasInformation = useCallback((infoType: string) => {
    switch (currentPhase) {
      case 'conceptualization':
        const conceptAnalysis = analysis.extractedData as ConceptAnalysis['extractedData']
        return {
          concept: !!conceptAnalysis?.concept,
          users: !!conceptAnalysis?.targetUsers,
          features: !!conceptAnalysis?.mvpFeatures,
          name: !!conceptAnalysis?.projectName
        }[infoType] || false
      
      case 'research':
        const researchData = analysis.extractedData as ResearchAnalysis['extractedData']
        return {
          competitors: !!researchData?.competitors,
          repos: !!researchData?.githubRepos,
          mcps: !!researchData?.mcps
        }[infoType] || false
      
      default:
        return false
    }
  }, [currentPhase, analysis])

  return {
    ...analysis,
    getAssistantHints,
    hasInformation,
    reanalyze: analyzeConversation
  }
}