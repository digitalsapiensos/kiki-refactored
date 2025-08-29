/**
 * AgentChatBubble Component
 * Neobrutalism-styled chat bubbles for KIKI agents and users
 */

import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChatMessage, Agent } from './types';
import { AgentAvatarWithTyping } from './AgentAvatar';

interface AgentChatBubbleProps {
  message: ChatMessage;
  agent?: Agent;
  className?: string;
  showTimestamp?: boolean;
}

export function AgentChatBubble({
  message,
  agent,
  className,
  showTimestamp = false
}: AgentChatBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isSystem) {
    return (
      <div className={cn("flex justify-center my-6", className)}>
        <div className="px-4 py-2 bg-gray-100 border-2 border-black font-mono text-sm max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {/* Avatar (only for agent messages) */}
      {!isUser && agent && (
        <div className="flex-shrink-0">
          <AgentAvatarWithTyping 
            agent={agent} 
            size="md"
            isTyping={message.isTyping}
          />
        </div>
      )}
      
      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Agent name and role (only for agent messages) */}
        {!isUser && agent && (
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-black">
              {agent.name}
            </span>
            <span className={cn(
              "text-xs font-mono font-bold px-2 py-1",
              "bg-gray-100 border-2 border-black rounded-none",
              "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            )}>
              {agent.role}
            </span>
          </div>
        )}
        
        {/* Message Bubble - Perfect neobrutalism styling */}
        <div className={cn(
          "px-4 py-3 border-2 border-black font-base rounded-none",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "transition-all duration-200",
          // Different styles for user vs agent
          isUser 
            ? "bg-main text-main-foreground" // Purple background for user
            : "bg-background text-foreground", // White background for agent
          // Animation for typing messages
          message.isTyping && "animate-pulse"
        )}>
          {/* Message text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Typing indicator for agent messages */}
          {message.isTyping && !isUser && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-gray-500">
                {agent?.name} está escribiendo...
              </span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {showTimestamp && (
          <span className={cn(
            "text-xs font-mono text-gray-500",
            isUser ? "text-right" : "text-left"
          )}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

// Specialized component for KIKI personality messages with enhanced styling
interface KIKIMessageBubbleProps extends AgentChatBubbleProps {
  isKIKIPersonality?: boolean;
}

export function KIKIMessageBubble({
  isKIKIPersonality = true,
  ...props
}: KIKIMessageBubbleProps) {
  if (!isKIKIPersonality) {
    return <AgentChatBubble {...props} />;
  }

  const { message, agent } = props;
  const isUser = message.type === 'user';

  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Enhanced Avatar with KIKI branding */}
      {!isUser && agent && (
        <div className="flex-shrink-0">
          <AgentAvatarWithTyping 
            agent={agent} 
            size="md"
            showPhase
            isTyping={message.isTyping}
          />
        </div>
      )}
      
      {/* Enhanced Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Agent intro with KIKI personality */}
        {!isUser && agent && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-black text-lg">
                {agent.name}
              </span>
              <span className={cn(
                "text-xs font-mono font-bold px-2 py-1",
                "bg-black text-white border-2 border-black rounded-none",
                "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              )}>
                FASE {agent.phase}
              </span>
            </div>
            <div className="text-xs font-mono text-gray-600 italic max-w-sm">
              {agent.description}
            </div>
          </div>
        )}
        
        {/* Enhanced Message Bubble - Perfect neobrutalism */}
        <div className={cn(
          "px-5 py-4 border-2 border-black font-base rounded-none",
          "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
          "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "transition-all duration-150",
          isUser 
            ? "bg-main text-main-foreground" 
            : "bg-background text-foreground",
          message.isTyping && "animate-pulse"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Enhanced typing indicator - Perfect neobrutalism */}
          {message.isTyping && !isUser && (
            <div className={cn(
              "flex items-center gap-3 mt-3 pt-3",
              "border-t-2 border-black border-dashed"
            )}>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-main rounded-none animate-bounce border border-black" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-main rounded-none animate-bounce border border-black" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-main rounded-none animate-bounce border border-black" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-mono font-bold text-gray-600">
                {agent?.name} está pensando como loco...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}