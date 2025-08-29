/**
 * AgentAvatar Component
 * Neobrutalism-styled avatar for KIKI agents with phase-specific colors
 */

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Agent } from './types';

interface AgentAvatarProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showPhase?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

// Professional agent display - Clean, professional avatars without emoji faces
const getAgentDisplay = (agent: Agent) => {
  const displays = {
    'consultor-virtual': { initials: 'CV', emoji: '💼', bgColor: 'bg-chart-1', textColor: 'text-black' }, // Blue
    'business-analyst': { initials: 'BA', emoji: '📊', bgColor: 'bg-chart-2', textColor: 'text-white' }, // Green  
    'arquitecto-senior': { initials: 'AS', emoji: '🏗️', bgColor: 'bg-chart-3', textColor: 'text-black' }, // Orange
    'arquitecto-estructura': { initials: 'AE', emoji: '📐', bgColor: 'bg-chart-4', textColor: 'text-black' }, // Purple
    'project-operations': { initials: 'PO', emoji: '⚙️', bgColor: 'bg-chart-5', textColor: 'text-white' } // Red
  };
  
  return displays[agent.id as keyof typeof displays] || {
    initials: agent.name.charAt(0),
    emoji: '🤖',
    bgColor: 'bg-gray-400',
    textColor: 'text-black'
  };
};

export function AgentAvatar({
  agent,
  size = 'md',
  showName = false,
  showPhase = false,
  className
}: AgentAvatarProps) {
  const display = getAgentDisplay(agent);
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Avatar Circle - Perfect neobrutalism styling */}
      <div className={cn(
        "relative flex items-center justify-center",
        "border-2 border-black rounded-none",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        "transition-all duration-150 cursor-pointer",
        "font-mono font-bold",
        display.bgColor,
        display.textColor,
        sizeClasses[size],
        textSizeClasses[size]
      )}>
        {/* Phase number badge - Enhanced neobrutalism */}
        {showPhase && (
          <div className={cn(
            "absolute -top-1 -right-1 w-5 h-5",
            "bg-black text-white text-xs font-mono font-bold",
            "flex items-center justify-center",
            "border-2 border-black rounded-none",
            "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          )}>
            {agent.phase}
          </div>
        )}
        
        {/* Agent emoji or initials */}
        <span className="select-none">
          {size === 'sm' ? display.initials : display.emoji}
        </span>
      </div>
      
      {/* Agent Info */}
      {(showName || showPhase) && (
        <div className="flex flex-col">
          {showName && (
            <span className="font-heading font-bold text-black">
              {agent.name}
            </span>
          )}
          {showPhase && (
            <span className="text-xs font-mono text-gray-600">
              Phase {agent.phase}: {agent.role}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Typing indicator version of AgentAvatar
interface AgentAvatarTypingProps extends AgentAvatarProps {
  isTyping?: boolean;
}

export function AgentAvatarWithTyping({
  isTyping = false,
  ...props
}: AgentAvatarTypingProps) {
  return (
    <div className="relative">
      <AgentAvatar {...props} />
      
      {/* Typing indicator - Perfect neobrutalism styling */}
      {isTyping && (
        <div className="absolute -bottom-2 -right-2">
          <div className={cn(
            "flex items-center gap-1 bg-black text-white px-2 py-1",
            "border-2 border-black rounded-none font-mono text-xs font-bold",
            "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
            "animate-pulse"
          )}>
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-white rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-white rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-white rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}