/**
 * AgentHeader Component
 * Perfect neobrutalism agent header with status and phase info
 */

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Agent } from './types';
import { AgentAvatar, AgentAvatarWithTyping } from './AgentAvatar';

interface AgentHeaderProps {
  agent: Agent;
  isActive?: boolean;
  isTyping?: boolean;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showDescription?: boolean;
  showStatus?: boolean;
  showExpertise?: boolean;
  onAgentClick?: (agent: Agent) => void;
}

export function AgentHeader({
  agent,
  isActive = true,
  isTyping = false,
  className,
  variant = 'full',
  showDescription = true,
  showStatus = true,
  showExpertise = false,
  onAgentClick
}: AgentHeaderProps) {
  
  // Get agent phase color
  const getPhaseColor = (phase: number) => {
    const colors = [
      'bg-chart-1', // Phase 1 - Yellow
      'bg-chart-2', // Phase 2 - Blue
      'bg-chart-3', // Phase 3 - Green
      'bg-chart-4', // Phase 4 - Orange
      'bg-chart-5'  // Phase 5 - Purple
    ];
    return colors[phase - 1] || 'bg-main';
  };

  // Minimal variant - just name and status
  if (variant === 'minimal') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-none",
        "bg-background border-2 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        className
      )}>
        <AgentAvatar 
          agent={agent} 
          size="sm" 
          showPhase={false}
        />
        <div className="flex-1">
          <div className="font-heading font-bold text-sm text-black">
            {agent.name}
          </div>
        </div>
        {showStatus && (
          <div className={cn(
            "px-2 py-1 text-xs font-mono font-bold rounded-none border-2 border-black",
            isActive ? "bg-green-400 text-green-800" : "bg-gray-400 text-gray-800"
          )}>
            {isActive ? 'ACTIVO' : 'INACTIVO'}
          </div>
        )}
      </div>
    );
  }

  // Compact variant - name, role, and status
  if (variant === 'compact') {
    return (
      <div className={cn(
        "p-4 rounded-none bg-background",
        "border-2 border-black",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        "transition-all duration-150",
        onAgentClick && "cursor-pointer",
        className
      )}
      onClick={() => onAgentClick?.(agent)}
    >
      <div className="flex items-center justify-between">
        {/* Agent info */}
        <div className="flex items-center gap-4">
          <AgentAvatarWithTyping 
            agent={agent} 
            size="md" 
            showPhase
            isTyping={isTyping}
          />
          <div>
            <div className="font-heading font-bold text-lg text-black">
              {agent.name}
            </div>
            <div className="text-sm font-mono text-gray-600">
              {agent.role} • Fase {agent.phase}
            </div>
          </div>
        </div>

        {/* Status indicators */}
        {showStatus && (
          <div className="flex items-center gap-2">
            {isTyping && (
              <div className="px-3 py-1 bg-yellow-400 text-yellow-800 border-2 border-black rounded-none font-mono text-xs font-bold animate-pulse">
                ESCRIBIENDO
              </div>
            )}
            <div className={cn(
              "px-3 py-1 text-xs font-mono font-bold rounded-none border-2 border-black",
              isActive ? "bg-green-400 text-green-800" : "bg-gray-400 text-gray-800"
            )}>
              {isActive ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  // Full variant (default) - complete information
  return (
    <div className={cn(
      "p-6 rounded-none bg-background",
      "border-2 border-black",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
      "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      "transition-all duration-150",
      onAgentClick && "cursor-pointer",
      className
    )}
    onClick={() => onAgentClick?.(agent)}
  >
    {/* Header section */}
    <div className="flex items-start justify-between mb-4">
      {/* Agent info */}
      <div className="flex items-center gap-4">
        <AgentAvatarWithTyping 
          agent={agent} 
          size="lg" 
          showPhase
          isTyping={isTyping}
        />
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-heading font-bold text-2xl text-black">
              {agent.name}
            </h2>
            <div className={cn(
              "px-3 py-1 text-xs font-mono font-bold rounded-none border-2 border-black",
              getPhaseColor(agent.phase),
              "text-black"
            )}>
              FASE {agent.phase}
            </div>
          </div>
          <p className="text-lg font-mono font-bold text-gray-700">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Status indicators */}
      {showStatus && (
        <div className="flex flex-col gap-2 items-end">
          {isTyping && (
            <div className="px-3 py-1 bg-yellow-400 text-yellow-800 border-2 border-black rounded-none font-mono text-xs font-bold animate-pulse">
              ESCRIBIENDO
            </div>
          )}
          <div className={cn(
            "px-4 py-2 text-sm font-mono font-bold rounded-none border-2 border-black",
            isActive ? "bg-green-400 text-green-800" : "bg-gray-400 text-gray-800"
          )}>
            {isActive ? 'ACTIVO' : 'INACTIVO'}
          </div>
        </div>
      )}
    </div>

    {/* Description */}
    {showDescription && (
      <div className="mb-4">
        <p className="text-sm font-mono italic text-gray-700 leading-relaxed">
          {agent.description}
        </p>
      </div>
    )}

    {/* Expertise tags */}
    {showExpertise && agent.expertise && agent.expertise.length > 0 && (
      <div>
        <h4 className="font-heading font-bold text-sm text-black mb-2">
          Especialidades:
        </h4>
        <div className="flex flex-wrap gap-2">
          {agent.expertise.map((skill, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 text-xs font-mono font-bold rounded-none",
                "bg-gray-100 text-gray-800 border-2 border-black",
                "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
  );
}

// Specialized agent header for the wizard flow
interface WizardAgentHeaderProps extends Omit<AgentHeaderProps, 'variant'> {
  currentPhase: number;
  totalPhases?: number;
  phaseProgress?: number; // 0-100
  showPhaseProgress?: boolean;
}

export function WizardAgentHeader({
  agent,
  currentPhase,
  totalPhases = 5,
  phaseProgress = 0,
  showPhaseProgress = true,
  ...props
}: WizardAgentHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Agent header */}
      <AgentHeader
        agent={agent}
        variant="full"
        showExpertise
        {...props}
      />

      {/* Phase progress indicator */}
      {showPhaseProgress && (
        <div className={cn(
          "p-4 rounded-none bg-secondary-background",
          "border-2 border-black",
          "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-bold text-sm text-black">
              Progreso - Fase {currentPhase} de {totalPhases}
            </span>
            <span className="font-mono font-bold text-sm text-black">
              {Math.round(phaseProgress)}%
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 border-2 border-black rounded-none">
            <div 
              className={cn(
                "h-full border-r-2 border-black transition-all duration-300",
                agent.phase === 1 ? 'bg-chart-1' :
                agent.phase === 2 ? 'bg-chart-2' :
                agent.phase === 3 ? 'bg-chart-3' :
                agent.phase === 4 ? 'bg-chart-4' :
                'bg-chart-5'
              )}
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
          
          <div className="mt-2 text-xs font-mono text-gray-600">
            {phaseProgress < 25 && "🎯 Empezando fase..."}
            {phaseProgress >= 25 && phaseProgress < 50 && "⚡ Avanzando..."}
            {phaseProgress >= 50 && phaseProgress < 75 && "🚀 Casi terminando..."}
            {phaseProgress >= 75 && phaseProgress < 100 && "🏁 Finalizando fase..."}
            {phaseProgress === 100 && "✅ ¡Fase completada!"}
          </div>
        </div>
      )}
    </div>
  );
}

// Agent transition header - shows handoff between agents
interface AgentTransitionHeaderProps {
  fromAgent: Agent;
  toAgent: Agent;
  message?: string;
  className?: string;
  onContinue?: () => void;
}

export function AgentTransitionHeader({
  fromAgent,
  toAgent,
  message = "Transfiriendo control...",
  className,
  onContinue
}: AgentTransitionHeaderProps) {
  return (
    <div className={cn(
      "p-6 rounded-none bg-yellow-100",
      "border-2 border-black",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      {/* Transition indicator */}
      <div className="text-center mb-4">
        <h3 className="font-heading font-bold text-lg text-black mb-2">
          🔄 Cambio de Agente
        </h3>
        <p className="font-mono text-sm text-gray-700">
          {message}
        </p>
      </div>

      {/* Agent handoff visualization */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {/* From agent */}
        <div className="text-center">
          <AgentAvatar 
            agent={fromAgent} 
            size="lg" 
            showPhase
          />
          <div className="mt-2">
            <div className="font-heading font-bold text-sm text-black">
              {fromAgent.name}
            </div>
            <div className="text-xs font-mono text-gray-600">
              Fase {fromAgent.phase}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-3xl animate-pulse">
          →
        </div>

        {/* To agent */}
        <div className="text-center">
          <AgentAvatar 
            agent={toAgent} 
            size="lg" 
            showPhase
          />
          <div className="mt-2">
            <div className="font-heading font-bold text-sm text-black">
              {toAgent.name}
            </div>
            <div className="text-xs font-mono text-gray-600">
              Fase {toAgent.phase}
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      {onContinue && (
        <div className="text-center">
          <button
            onClick={onContinue}
            className={cn(
              "px-6 py-3 font-mono font-bold text-sm rounded-none",
              "bg-main text-main-foreground border-2 border-black",
              "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              "hover:translate-x-[-2px] hover:translate-y-[-2px]",
              "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
              "transition-all duration-150"
            )}
          >
            CONTINUAR CON {toAgent.name.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}