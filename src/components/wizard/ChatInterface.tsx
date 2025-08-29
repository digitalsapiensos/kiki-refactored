'use client';

/**
 * ChatInterface - Interface principal de chat con agentes KIKI
 * Maneja la conversación, simulación de typing, y mock responses
 */

import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { ChatSession, ChatMessage, Agent } from '../chat/types';
import { AgentChatBubble, KIKIMessageBubble } from '../chat/AgentChatBubble';
import { UserInputField } from '../chat/UserInputField';
import { mockAgentSystem, simulateTypingDelay } from '../chat/MockAgentSystem';
import { analyzeHandoffReadiness } from '../chat/ContextHandoffSystem';

interface ChatInterfaceProps {
  chatSession: ChatSession;
  onChatUpdate: (session: ChatSession) => void;
  currentStep: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatSession,
  onChatUpdate,
  currentStep
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Using imported mockAgentSystem instance - no need to create new

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession.messages]);

  // Initialize conversation if no messages for current agent
  useEffect(() => {
    const agentMessages = chatSession.messages.filter(
      msg => msg.agentId === chatSession.currentAgent.id
    );
    
    if (agentMessages.length === 0) {
      handleAgentIntroduction();
    }
  }, [chatSession.currentAgent.id]);

  const handleAgentIntroduction = async () => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const introMessage = mockAgentSystem.getAgentIntroduction(
      chatSession.currentAgent,
      currentStep
    );
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: introMessage,
      type: 'agent',
      agentId: chatSession.currentAgent.id,
      timestamp: new Date()
    };
    
    const updatedSession: ChatSession = {
      ...chatSession,
      messages: [...chatSession.messages, newMessage]
    };
    
    setIsTyping(false);
    onChatUpdate(updatedSession);
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: message.trim(),
      type: 'user',
      timestamp: new Date()
    };
    
    const sessionWithUserMessage: ChatSession = {
      ...chatSession,
      messages: [...chatSession.messages, userMessage]
    };
    
    onChatUpdate(sessionWithUserMessage);
    setUserInput('');
    setIsTyping(true);
    
    // Simulate agent response delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // Generate mock agent response
    const agentResponse = await mockAgentSystem.generateResponse(
      chatSession.currentAgent,
      message,
      currentStep,
      chatSession.messages
    );
    
    const agentMessage: ChatMessage = {
      id: `msg-${Date.now()}-agent`,
      content: agentResponse,
      type: 'agent',
      agentId: chatSession.currentAgent.id,
      timestamp: new Date()
    };
    
    const finalSession: ChatSession = {
      ...sessionWithUserMessage,
      messages: [...sessionWithUserMessage.messages, agentMessage]
    };
    
    setIsTyping(false);
    onChatUpdate(finalSession);
    
    // Check if conversation should trigger file generation
    if (shouldTriggerFileGeneration(agentMessage.content, currentStep)) {
      setTimeout(() => triggerFileGeneration(), 1000);
    }
  };

  const shouldTriggerFileGeneration = (response: string, step: number): boolean => {
    const triggerWords = [
      'perfecto', 'excelente', 'genial', 'entendido', 
      'vamos a crear', 'generaré', 'documentaré'
    ];
    
    return triggerWords.some(word => 
      response.toLowerCase().includes(word)
    ) && Math.random() > 0.6; // 40% chance
  };

  const triggerFileGeneration = () => {
    const mockFiles = mockAgentSystem.generateMockFiles(
      chatSession.currentAgent,
      currentStep
    );
    
    const updatedSession: ChatSession = {
      ...chatSession,
      fileGenerations: [
        ...chatSession.fileGenerations.filter(f => f.status !== 'pending'),
        ...mockFiles
      ]
    };
    
    onChatUpdate(updatedSession);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage(userInput);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-b-4 border-black p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getAgentGradient(chatSession.currentAgent.color)} border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <span className="text-white font-black text-lg">
              {chatSession.currentAgent.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-black text-lg">{chatSession.currentAgent.name}</h3>
            <p className="text-sm text-gray-600">{chatSession.currentAgent.role}</p>
          </div>
          
          {/* Status indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full"></div>
            <span className="text-sm font-bold">En línea</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
        {chatSession.messages
          .filter(msg => msg.agentId === chatSession.currentAgent.id || msg.type === 'user')
          .map((message) => (
            <div key={message.id}>
              {message.type === 'agent' ? (
                <AgentChatBubble 
                  message={message}
                  agent={chatSession.currentAgent}
                />
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-blue-500 text-white p-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getAgentGradient(chatSession.currentAgent.color)} border-2 border-black rounded-full flex items-center justify-center`}>
              <span className="text-white font-black text-sm">
                {chatSession.currentAgent.name.charAt(0)}
              </span>
            </div>
            <div className="bg-gray-200 border-4 border-black p-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {chatSession.currentAgent.name} está escribiendo...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed z-index for proper layering */}
      <div className="border-t-4 border-black bg-white p-4 sticky bottom-0 z-40">
        <UserInputField 
          value={userInput}
          onChange={setUserInput}
          onSend={() => handleUserMessage(userInput)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          placeholder={`Escribe tu mensaje a ${chatSession.currentAgent.name}...`}
        />
        
        {/* Quick Actions - Properly positioned with high z-index and optimized interactions */}
        <div className="mt-3 flex flex-wrap gap-2 relative z-50">
          {getQuickActions(currentStep).map((action, index) => (
            <button
              key={`${currentStep}-${index}`}
              onClick={() => handleUserMessage(action)}
              disabled={isTyping}
              className="px-3 py-1 bg-yellow-200 border-2 border-black text-sm font-bold rounded hover:bg-yellow-300 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:hover:translate-x-0 disabled:hover:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 will-change-transform"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getAgentGradient = (color: string): string => {
  const gradients: { [key: string]: string } = {
    'chart-1': 'from-yellow-400 to-yellow-600',
    'chart-2': 'from-blue-400 to-blue-600', 
    'chart-3': 'from-green-400 to-green-600',
    'chart-4': 'from-orange-400 to-orange-600',
    'chart-5': 'from-purple-400 to-purple-600',
  };
  
  return gradients[color] || 'from-gray-400 to-gray-600';
};

const getQuickActions = (step: number): string[] => {
  const actions = {
    1: ['Cuéntame más', 'No estoy seguro', '¿Puedes ayudarme?', 'Siguiente paso'],
    2: ['Buscar competidores', '¿Es viable?', 'Validar idea', 'Análisis de mercado'],
    3: ['Recomendar tecnologías', '¿Qué arquitectura?', 'Base de datos', 'Escalabilidad'],
    4: ['Crear documentación', 'Especificaciones', 'Diagramas', 'Manual usuario'],
    5: ['Configurar entorno', 'Deploy', 'CI/CD', 'Entrega final']
  };
  
  return actions[step as keyof typeof actions] || ['Continuar', 'Ayuda', 'Siguiente'];
};