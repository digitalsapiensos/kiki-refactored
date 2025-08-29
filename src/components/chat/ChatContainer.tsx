/**
 * ChatContainer Component
 * Main layout for the KIKI chat system with neobrutalism styling
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChatSession, ChatMessage, Agent } from './types';
import { KIKIMessageBubble } from './AgentChatBubble';
import { KIKIInputField } from './UserInputField';
import { FileGenerationProgress } from './FileGenerationProgress';
import { ProjectProgress } from './ProjectProgress';
import { AgentTransition } from './AgentTransition';
import { getAgentById } from './mockData';

interface ChatContainerProps {
  session: ChatSession;
  onSendMessage: (message: string) => void;
  onAgentTransition?: (newAgentId: string) => void;
  className?: string;
  showSidebar?: boolean;
  autoScroll?: boolean;
}

export function ChatContainer({
  session,
  onSendMessage,
  onAgentTransition,
  className,
  showSidebar = true,
  autoScroll = true
}: ChatContainerProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isAgentTyping, setIsAgentTyping] = React.useState(false);
  const [showTransition, setShowTransition] = React.useState(false);

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages, autoScroll]);

  // Handle sending messages
  const handleSendMessage = React.useCallback((message: string) => {
    // Simulate agent typing
    setIsAgentTyping(true);
    
    // Send the message
    onSendMessage(message);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsAgentTyping(false);
    }, 2000);
  }, [onSendMessage]);

  // Handle agent transitions
  const handleAgentTransition = (newAgentId: string) => {
    setShowTransition(false);
    onAgentTransition?.(newAgentId);
  };

  return (
    <div className={cn(
      "flex h-screen bg-background",
      className
    )}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r-2 border-black bg-secondary-background p-4 overflow-y-auto">
          <ChatSidebar session={session} />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <ChatHeader session={session} />

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* File generation progress */}
          {session.fileGenerations.some(f => f.status !== 'completed') && (
            <FileGenerationProgress 
              files={session.fileGenerations} 
              showCompleted={false}
            />
          )}

          {/* Chat messages */}
          {session.messages.map((message) => {
            const agent = message.agentId ? getAgentById(message.agentId) : undefined;
            
            return (
              <KIKIMessageBubble
                key={message.id}
                message={message}
                agent={agent}
                showTimestamp
                isKIKIPersonality
              />
            );
          })}

          {/* Agent transition */}
          {showTransition && (
            <div className="my-8">
              {/* This would show the transition component when needed */}
              {/* Implementation would depend on the specific transition data */}
            </div>
          )}

          {/* Messages end marker for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <KIKIInputField
          onSendMessage={handleSendMessage}
          disabled={!session.isActive}
          agentName={session.currentAgent.name}
          isAgentTyping={isAgentTyping}
          showPersonalityTips
          currentPhase={session.currentAgent.phase}
        />
      </div>
    </div>
  );
}

// Chat header component
interface ChatHeaderProps {
  session: ChatSession;
}

function ChatHeader({ session }: ChatHeaderProps) {
  return (
    <div className="border-b-2 border-black bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Current agent info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 border-2 border-black flex items-center justify-center font-bold text-lg",
              `bg-${session.currentAgent.color}`
            )}>
              {session.currentAgent.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-black">
                {session.currentAgent.name}
              </h2>
              <p className="text-sm font-mono text-gray-600">
                {session.currentAgent.role} • Fase {session.currentAgent.phase}
              </p>
            </div>
          </div>
        </div>

        {/* Session status */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-3 py-1 border-2 border-black font-mono text-xs font-bold",
            session.isActive ? "bg-green-400 text-green-800" : "bg-gray-400 text-gray-800"
          )}>
            {session.isActive ? 'ACTIVO' : 'INACTIVO'}
          </div>
          
          <button className="w-8 h-8 border-2 border-black bg-background hover:bg-gray-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Agent description */}
      <div className="mt-3 text-sm font-mono text-gray-700 italic max-w-2xl">
        {session.currentAgent.description}
      </div>
    </div>
  );
}

// Sidebar component
interface ChatSidebarProps {
  session: ChatSession;
}

function ChatSidebar({ session }: ChatSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Project progress */}
      <div>
        <h3 className="font-heading font-bold text-lg mb-3">Progreso</h3>
        <ProjectProgress 
          progress={session.projectProgress} 
          variant="compact"
          showPercentage
        />
      </div>

      {/* File generations */}
      {session.fileGenerations.length > 0 && (
        <div>
          <h3 className="font-heading font-bold text-lg mb-3">Archivos</h3>
          <div className="space-y-2">
            {session.fileGenerations.slice(0, 5).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 border border-black bg-background text-xs font-mono"
              >
                <div className={cn(
                  "w-2 h-2 border border-black",
                  file.status === 'completed' && "bg-green-400",
                  file.status === 'generating' && "bg-yellow-400 animate-pulse",
                  file.status === 'pending' && "bg-gray-400"
                )} />
                <span className="flex-1 truncate">{file.fileName}</span>
                <span className="text-gray-600">{file.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat stats */}
      <div>
        <h3 className="font-heading font-bold text-lg mb-3">Estadísticas</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span>Mensajes:</span>
            <span>{session.messages.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Fase actual:</span>
            <span>{session.currentAgent.phase}/5</span>
          </div>
          <div className="flex justify-between">
            <span>Archivos:</span>
            <span>{session.fileGenerations.filter(f => f.status === 'completed').length}/{session.fileGenerations.length}</span>
          </div>
        </div>
      </div>

      {/* KIKI tips */}
      <div className="bg-yellow-100 border-2 border-black p-3">
        <h4 className="font-heading font-bold text-sm mb-2">💡 Tip de KIKI</h4>
        <p className="text-xs font-mono text-gray-700">
          {session.currentAgent.phase === 1 && "No hay ideas tontas, solo ideas que aún no han encontrado su momento. ¡Cuéntame la tuya!"}
          {session.currentAgent.phase === 2 && "Investigar es como stalkear, pero de forma productiva y legal 🕵️"}
          {session.currentAgent.phase === 3 && "Elegir tecnología es como elegir outfit: lo importante es que funcione y te haga sentir bien"}
          {session.currentAgent.phase === 4 && "La documentación es el mapa del tesoro que tu yo del futuro te agradecerá"}
          {session.currentAgent.phase === 5 && "¡Ya casi! El deploy es como el gran estreno de tu película"}
        </p>
      </div>

      {/* Emergency help */}
      <div className="border-2 border-black bg-red-100 p-3">
        <h4 className="font-heading font-bold text-sm mb-2">🆘 ¿Perdido?</h4>
        <p className="text-xs font-mono text-red-800 mb-2">
          Si no sabes qué responder, prueba con:
        </p>
        <ul className="text-xs font-mono text-red-700 space-y-1">
          <li>• "No estoy seguro"</li>
          <li>• "¿Puedes explicar más?"</li>
          <li>• "Necesito ayuda"</li>
          <li>• "Dame un ejemplo"</li>
        </ul>
      </div>
    </div>
  );
}