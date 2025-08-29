/**
 * ContextHandoffSystem - Sistema simple de análisis de handoffs entre agentes
 */

import { ChatMessage, Agent, ChatSession } from './types';

export interface HandoffAnalysis {
  isReady: boolean;
  confidence: number;
  reason: string;
}

/**
 * Analiza si una conversación está lista para handoff al siguiente agente
 */
export const analyzeHandoffReadiness = (
  messages: ChatMessage[], 
  currentAgent: Agent,
  session?: ChatSession
): HandoffAnalysis => {
  
  const agentMessages = messages.filter(m => m.agentId === currentAgent.id);
  const userMessages = messages.filter(m => m.type === 'user');
  
  let confidence = 0;
  let reason = '';
  
  // Factor básico: número de interacciones
  if (agentMessages.length >= 2 && userMessages.length >= 2) {
    confidence += 0.5;
  }
  
  // Factor: señales positivas en mensajes recientes
  const recentMessages = messages.slice(-3);
  const hasPositiveSignals = recentMessages.some(m => 
    m.content.toLowerCase().includes('perfecto') ||
    m.content.toLowerCase().includes('genial') ||
    m.content.toLowerCase().includes('excelente') ||
    m.content.toLowerCase().includes('listo') ||
    m.content.toLowerCase().includes('siguiente')
  );
  
  if (hasPositiveSignals) {
    confidence += 0.3;
  }
  
  // Factor: longitud de respuestas (indica engagement)
  const avgUserMessageLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  if (avgUserMessageLength > 30) {
    confidence += 0.2;
  }
  
  // Determinar si está listo
  const isReady = confidence > 0.7;
  
  if (isReady) {
    reason = `Conversación completa: ${agentMessages.length} intercambios del agente, ${userMessages.length} respuestas del usuario, señales positivas detectadas`;
  } else if (agentMessages.length < 2) {
    reason = 'Necesita más interacciones con el agente actual';
  } else if (!hasPositiveSignals) {
    reason = 'Esperando señales de confirmación del usuario';
  } else {
    reason = 'Conversación aún en desarrollo';
  }
  
  return {
    isReady,
    confidence,
    reason
  };
};