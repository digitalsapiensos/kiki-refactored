/**
 * Conversation Analyzer for KIKI Wizard
 * Analyzes chat messages to detect when enough information has been gathered
 */

export interface ConceptAnalysis {
  hasProjectConcept: boolean
  hasTargetUsers: boolean
  hasMVPFeatures: boolean
  hasValidationStrategy: boolean
  hasProjectName: boolean
  
  completeness: number // 0-100
  missingElements: string[]
  extractedData: {
    projectName?: string
    concept?: string
    targetUsers?: string
    mvpFeatures?: string[]
    validationStrategy?: string
  }
}

export interface ResearchAnalysis {
  hasCompetitors: boolean
  hasGithubRepos: boolean
  hasRecommendedMCPs: boolean
  hasInspiration: boolean
  
  completeness: number
  missingElements: string[]
  extractedData: {
    competitors?: string[]
    githubRepos?: string[]
    mcps?: string[]
    inspiration?: string
  }
}

export interface TechPlanningAnalysis {
  hasFrontendChoice: boolean
  hasUILibraryChoice: boolean
  hasBackendChoice: boolean
  hasAuthStrategy: boolean
  hasHostingChoice: boolean
  
  completeness: number
  missingElements: string[]
  extractedData: {
    frontend?: string
    uiLibrary?: string
    backend?: string
    auth?: string
    hosting?: string
  }
}

export class ConversationAnalyzer {
  /**
   * Analyzes Phase 1 (Conceptualization) conversations
   */
  static analyzeConceptualization(messages: any[]): ConceptAnalysis {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    // Extract key information using patterns and keywords
    const analysis: ConceptAnalysis = {
      hasProjectConcept: false,
      hasTargetUsers: false,
      hasMVPFeatures: false,
      hasValidationStrategy: false,
      hasProjectName: false,
      completeness: 0,
      missingElements: [],
      extractedData: {}
    }
    
    // Check for project concept/idea
    const conceptPatterns = [
      /proyecto\s+(?:es|será|consiste|trata)/i,
      /idea\s+(?:es|principal|consiste)/i,
      /quiero\s+(?:hacer|crear|construir)/i,
      /problema\s+(?:que|es|resolver)/i,
      /solución\s+(?:es|será|propongo)/i
    ]
    
    if (conceptPatterns.some(pattern => pattern.test(conversationText))) {
      analysis.hasProjectConcept = true
      // Extract the concept (simplified - in production would use AI)
      const conceptMatch = conversationText.match(/(?:proyecto|idea|quiero hacer|problema es|solución es)\s*:?\s*([^.!?]+[.!?])/i)
      if (conceptMatch) {
        analysis.extractedData.concept = conceptMatch[1].trim()
      }
    }
    
    // Check for target users
    const userPatterns = [
      /usuarios?\s+(?:son|serán|ideales|objetivo)/i,
      /dirigido\s+a/i,
      /para\s+(?:personas|gente|usuarios)/i,
      /audiencia\s+(?:es|será)/i,
      /clientes?\s+(?:son|serán)/i
    ]
    
    if (userPatterns.some(pattern => pattern.test(conversationText))) {
      analysis.hasTargetUsers = true
      const userMatch = conversationText.match(/(?:usuarios|dirigido a|audiencia|clientes)\s*:?\s*([^.!?]+[.!?])/i)
      if (userMatch) {
        analysis.extractedData.targetUsers = userMatch[1].trim()
      }
    }
    
    // Check for MVP features
    const mvpPatterns = [
      /funcionalidades?\s+(?:principales|mvp|básicas|esenciales)/i,
      /características?\s+(?:principales|mvp|básicas)/i,
      /features?\s+(?:principales|mvp|básicas)/i,
      /\d+\s*[-.)]\s*\w+/g // Numbered lists
    ]
    
    if (mvpPatterns.some(pattern => pattern.test(conversationText))) {
      analysis.hasMVPFeatures = true
      // Extract features from numbered lists or bullet points
      const featureMatches = conversationText.match(/\d+\s*[-.)]\s*([^\n]+)/g)
      if (featureMatches && featureMatches.length >= 3) {
        analysis.extractedData.mvpFeatures = featureMatches.map(f => 
          f.replace(/\d+\s*[-.)]\s*/, '').trim()
        )
      }
    }
    
    // Check for project name
    const namePatterns = [
      /(?:se\s+llama|nombre\s+es|llamar[áé]|proyecto:)\s*"?([^".!?\n]+)"?/i,
      /(?:título|name):\s*"?([^".!?\n]+)"?/i
    ]
    
    const nameMatch = conversationText.match(namePatterns[0]) || conversationText.match(namePatterns[1])
    if (nameMatch) {
      analysis.hasProjectName = true
      analysis.extractedData.projectName = nameMatch[1].trim()
    }
    
    // Check for validation strategy (optional for MVP)
    const validationPatterns = [
      /validar\s+(?:con|mediante|a través)/i,
      /probar\s+(?:con|el concepto)/i,
      /primeros?\s+(?:usuarios|clientes)/i,
      /lanzamiento\s+(?:inicial|beta|piloto)/i
    ]
    
    if (validationPatterns.some(pattern => pattern.test(conversationText))) {
      analysis.hasValidationStrategy = true
    }
    
    // Calculate completeness
    const requiredElements = [
      analysis.hasProjectConcept,
      analysis.hasTargetUsers,
      analysis.hasMVPFeatures,
      analysis.hasProjectName
    ]
    
    const optionalElements = [
      analysis.hasValidationStrategy
    ]
    
    const requiredScore = requiredElements.filter(Boolean).length / requiredElements.length * 80
    const optionalScore = optionalElements.filter(Boolean).length / optionalElements.length * 20
    
    analysis.completeness = Math.round(requiredScore + optionalScore)
    
    // Determine missing elements
    if (!analysis.hasProjectConcept) {
      analysis.missingElements.push('Concepto o idea principal del proyecto')
    }
    if (!analysis.hasTargetUsers) {
      analysis.missingElements.push('Usuarios objetivo o audiencia')
    }
    if (!analysis.hasMVPFeatures) {
      analysis.missingElements.push('Funcionalidades principales del MVP')
    }
    if (!analysis.hasProjectName) {
      analysis.missingElements.push('Nombre del proyecto')
    }
    
    return analysis
  }
  
  /**
   * Analyzes Phase 2 (Research) conversations
   */
  static analyzeResearch(messages: any[]): ResearchAnalysis {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    const analysis: ResearchAnalysis = {
      hasCompetitors: false,
      hasGithubRepos: false,
      hasRecommendedMCPs: false,
      hasInspiration: false,
      completeness: 0,
      missingElements: [],
      extractedData: {}
    }
    
    // Check for competitors
    if (/competidor|competencia|similares|parecidos/i.test(conversationText)) {
      analysis.hasCompetitors = true
      const competitorMatches = conversationText.match(/(?:como|ejemplo|similar a)\s+(\w+)/gi)
      if (competitorMatches) {
        analysis.extractedData.competitors = competitorMatches.map(m => 
          m.replace(/(?:como|ejemplo|similar a)\s+/i, '').trim()
        )
      }
    }
    
    // Check for GitHub repos
    if (/github|repositorio|repo|código abierto|open source/i.test(conversationText)) {
      analysis.hasGithubRepos = true
    }
    
    // Check for MCPs
    if (/mcp|context7|magic|sequential|playwright/i.test(conversationText)) {
      analysis.hasRecommendedMCPs = true
    }
    
    // Check for inspiration/learnings
    if (/aprendí|evitar|no hacer|inspiración|referencias/i.test(conversationText)) {
      analysis.hasInspiration = true
    }
    
    // Calculate completeness
    const elements = [
      analysis.hasCompetitors,
      analysis.hasGithubRepos,
      analysis.hasRecommendedMCPs,
      analysis.hasInspiration
    ]
    
    analysis.completeness = Math.round(
      elements.filter(Boolean).length / elements.length * 100
    )
    
    // Missing elements
    if (!analysis.hasCompetitors) {
      analysis.missingElements.push('Análisis de competencia')
    }
    if (!analysis.hasGithubRepos) {
      analysis.missingElements.push('Repositorios de referencia')
    }
    if (!analysis.hasRecommendedMCPs) {
      analysis.missingElements.push('MCPs recomendados')
    }
    if (!analysis.hasInspiration) {
      analysis.missingElements.push('Inspiración y aprendizajes')
    }
    
    return analysis
  }
  
  /**
   * Analyzes Phase 3 (Tech Planning) conversations
   */
  static analyzeTechPlanning(messages: any[]): TechPlanningAnalysis {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    const analysis: TechPlanningAnalysis = {
      hasFrontendChoice: false,
      hasUILibraryChoice: false,
      hasBackendChoice: false,
      hasAuthStrategy: false,
      hasHostingChoice: false,
      completeness: 0,
      missingElements: [],
      extractedData: {}
    }
    
    // Check for frontend framework
    if (/next\.?js|react|vue|angular|svelte/i.test(conversationText)) {
      analysis.hasFrontendChoice = true
      const match = conversationText.match(/(next\.?js|react|vue|angular|svelte)/i)
      if (match) {
        analysis.extractedData.frontend = match[1]
      }
    }
    
    // Check for UI library
    if (/shadcn|material.?ui|tailwind|chakra|ant.?design/i.test(conversationText)) {
      analysis.hasUILibraryChoice = true
    }
    
    // Check for backend
    if (/supabase|firebase|node|express|fastify/i.test(conversationText)) {
      analysis.hasBackendChoice = true
    }
    
    // Check for auth
    if (/auth|autenticación|clerk|auth0|supabase.?auth/i.test(conversationText)) {
      analysis.hasAuthStrategy = true
    }
    
    // Check for hosting
    if (/vercel|netlify|aws|railway|render/i.test(conversationText)) {
      analysis.hasHostingChoice = true
    }
    
    // Calculate completeness
    const elements = [
      analysis.hasFrontendChoice,
      analysis.hasUILibraryChoice,
      analysis.hasBackendChoice,
      analysis.hasAuthStrategy,
      analysis.hasHostingChoice
    ]
    
    analysis.completeness = Math.round(
      elements.filter(Boolean).length / elements.length * 100
    )
    
    // Missing elements
    if (!analysis.hasFrontendChoice) {
      analysis.missingElements.push('Framework frontend')
    }
    if (!analysis.hasUILibraryChoice) {
      analysis.missingElements.push('Librería de UI')
    }
    if (!analysis.hasBackendChoice) {
      analysis.missingElements.push('Solución backend')
    }
    if (!analysis.hasAuthStrategy) {
      analysis.missingElements.push('Estrategia de autenticación')
    }
    if (!analysis.hasHostingChoice) {
      analysis.missingElements.push('Plataforma de hosting')
    }
    
    return analysis
  }
}