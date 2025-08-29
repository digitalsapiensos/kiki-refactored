/**
 * TypingIndicator Component
 * Perfect neobrutalism typing indicator for KIKI agents
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Agent } from './types';

interface TypingIndicatorProps {
  agent?: Agent;
  isTyping?: boolean;
  message?: string;
  className?: string;
  variant?: 'inline' | 'standalone' | 'bubble';
}

export function TypingIndicator({
  agent,
  isTyping = false,
  message = "está escribiendo...",
  className,
  variant = 'inline'
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  const getAgentColor = (agentId?: string) => {
    const colors = {
      peter: 'bg-chart-1', // Yellow
      sara: 'bg-chart-2', // Blue
      toni: 'bg-chart-3', // Green
      chris: 'bg-chart-4', // Orange
      quentin: 'bg-chart-5' // Purple
    };
    return colors[agentId as keyof typeof colors] || 'bg-main';
  };

  // Inline variant (for within messages)
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex gap-1">
          <div className={cn(
            "w-2 h-2 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            "w-2 h-2 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            "w-2 h-2 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm font-mono font-bold text-gray-600">
          {agent?.name} {message}
        </span>
      </div>
    );
  }

  // Standalone variant (for chat input area)
  if (variant === 'standalone') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex gap-1">
          <div className={cn(
            "w-3 h-3 rounded-none border-2 border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            "w-3 h-3 rounded-none border-2 border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            "w-3 h-3 rounded-none border-2 border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm font-mono font-bold text-gray-700">
          {agent?.name} {message}
        </span>
      </div>
    );
  }

  // Bubble variant (floating bubble)
  if (variant === 'bubble') {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-none",
        "bg-background border-2 border-black",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "font-mono text-sm",
        className
      )}>
        <div className="flex gap-1">
          <div className={cn(
            "w-2.5 h-2.5 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            "w-2.5 h-2.5 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            "w-2.5 h-2.5 rounded-none border border-black animate-bounce",
            getAgentColor(agent?.id)
          )} style={{ animationDelay: '300ms' }} />
        </div>
        <span className="font-bold text-gray-700">
          {agent?.name} {message}
        </span>
      </div>
    );
  }

  return null;
}

// Specialized KIKI typing indicator with personality
interface KIKITypingIndicatorProps extends TypingIndicatorProps {
  showPersonalityMessage?: boolean;
}

export function KIKITypingIndicator({
  agent,
  showPersonalityMessage = true,
  ...props
}: KIKITypingIndicatorProps) {
  const getPersonalityMessage = (agentId?: string) => {
    const messages = {
      peter: "está convirtiendo tu idea en oro puro...",
      sara: "está investigando como detective privado...",
      toni: "está eligiendo el stack perfecto...",
      chris: "está escribiendo docs que sí vas a leer...",
      quentin: "está preparando el deploy del siglo..."
    };
    return messages[agentId as keyof typeof messages] || "está pensando como loco...";
  };

  const message = showPersonalityMessage && agent 
    ? getPersonalityMessage(agent.id)
    : "está escribiendo...";

  return (
    <TypingIndicator
      {...props}
      agent={agent}
      message={message}
    />
  );
}

// Advanced typing indicator with progress
interface AdvancedTypingIndicatorProps extends TypingIndicatorProps {
  progress?: number; // 0-100
  stage?: string;
}

export function AdvancedTypingIndicator({
  progress = 0,
  stage = "Escribiendo",
  agent,
  className,
  ...props
}: AdvancedTypingIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-3 rounded-none",
      "bg-background border-2 border-black",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      {/* Typing dots */}
      <div className="flex gap-1">
        <div className={cn(
          "w-3 h-3 rounded-none border-2 border-black animate-bounce",
          agent?.id === 'peter' ? 'bg-chart-1' :
          agent?.id === 'sara' ? 'bg-chart-2' :
          agent?.id === 'toni' ? 'bg-chart-3' :
          agent?.id === 'chris' ? 'bg-chart-4' :
          agent?.id === 'quentin' ? 'bg-chart-5' : 'bg-main'
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          "w-3 h-3 rounded-none border-2 border-black animate-bounce",
          agent?.id === 'peter' ? 'bg-chart-1' :
          agent?.id === 'sara' ? 'bg-chart-2' :
          agent?.id === 'toni' ? 'bg-chart-3' :
          agent?.id === 'chris' ? 'bg-chart-4' :
          agent?.id === 'quentin' ? 'bg-chart-5' : 'bg-main'
        )} style={{ animationDelay: '150ms' }} />
        <div className={cn(
          "w-3 h-3 rounded-none border-2 border-black animate-bounce",
          agent?.id === 'peter' ? 'bg-chart-1' :
          agent?.id === 'sara' ? 'bg-chart-2' :
          agent?.id === 'toni' ? 'bg-chart-3' :
          agent?.id === 'chris' ? 'bg-chart-4' :
          agent?.id === 'quentin' ? 'bg-chart-5' : 'bg-main'
        )} style={{ animationDelay: '300ms' }} />
      </div>

      {/* Agent info and progress */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono font-bold text-sm text-black">
            {agent?.name} - {stage}
          </span>
          <span className="font-mono font-bold text-xs text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 border-2 border-black rounded-none">
          <div 
            className={cn(
              "h-full border-r-2 border-black transition-all duration-300",
              agent?.id === 'peter' ? 'bg-chart-1' :
              agent?.id === 'sara' ? 'bg-chart-2' :
              agent?.id === 'toni' ? 'bg-chart-3' :
              agent?.id === 'chris' ? 'bg-chart-4' :
              agent?.id === 'quentin' ? 'bg-chart-5' : 'bg-main'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}