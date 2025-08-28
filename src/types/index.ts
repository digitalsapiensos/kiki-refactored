/**
 * Tipos TypeScript globales para el proyecto Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/types/index.ts
 */

// Tipos de usuario
export interface User {
  id: string
  email: string
  fullName: string
  company?: string
  role: 'student' | 'admin' | 'teacher'
  projectLimit: number
  projectCount: number
  createdAt: Date
  updatedAt: Date
}

// Tipos de proyecto
export interface Project {
  id: string
  userId: string
  name: string
  description: string
  status: 'draft' | 'planning' | 'ready'
  techStack: TechStack
  environmentVars: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

// Tipos de fases del wizard
export interface ProjectPhase {
  id: string
  projectId: string
  phaseName: 'concept' | 'research' | 'planning' | 'generate' | 'export'
  status: 'pending' | 'in_progress' | 'completed'
  data: any // TODO: Definir tipos específicos para cada fase
  chatHistory: ChatMessage[]
  completedAt?: Date
  createdAt: Date
}

// Tipos de chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    phase: string
    tokens?: number
    provider?: string
  }
}

// Tipos de asistentes
export interface Assistant {
  id: string
  name: string
  phase: string
  avatar: string
  systemPrompt: string
  welcomeMessage: string
}

// Tipos de tech stack
export interface TechStack {
  frontend: string
  styling: string
  backend: string
  database: string
  auth: string[]
  features: string[]
}

// TODO: Añadir más tipos según sea necesario