/**
 * Type definitions for KIKI Chat System
 * Neobrutalism chat interface with 5-phase wizard agents
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  phase: number;
  description: string;
  color: string; // Tailwind color class
  personality: string;
  expertise: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'agent' | 'system';
  agentId?: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface FileGeneration {
  id: string;
  fileName: string;
  type: string;
  progress: number; // 0-100
  status: 'pending' | 'generating' | 'completed' | 'error';
  agentId: string;
}

export interface ProjectProgress {
  currentPhase: number;
  completedPhases: number[];
  totalPhases: number;
  phaseNames: string[];
  progress: number; // 0-100 overall progress
}

export interface ChatSession {
  id: string;
  projectId: string;
  currentAgent: Agent;
  messages: ChatMessage[];
  fileGenerations: FileGeneration[];
  projectProgress: ProjectProgress;
  isActive: boolean;
}

export interface AgentTransition {
  fromAgent: Agent;
  toAgent: Agent;
  reason: string;
  handoffMessage: string;
}