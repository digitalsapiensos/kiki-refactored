/**
 * AgentTransition Component
 * Visual handoff between agents with neobrutalism styling
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AgentTransition as AgentTransitionType } from './types';
import { AgentAvatar } from './AgentAvatar';
import { Button } from '@/components/ui/button';

interface AgentTransitionProps {
  transition: AgentTransitionType;
  onContinue: () => void;
  onGoBack?: () => void;
  className?: string;
  autoTransition?: boolean;
  transitionDelay?: number;
}

export function AgentTransition({
  transition,
  onContinue,
  onGoBack,
  className,
  autoTransition = false,
  transitionDelay = 3000
}: AgentTransitionProps) {
  const [isAnimating, setIsAnimating] = React.useState(true);
  const [showHandoff, setShowHandoff] = React.useState(false);

  React.useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => {
      setShowHandoff(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);

    // Auto transition if enabled
    let autoTimer: NodeJS.Timeout;
    if (autoTransition) {
      autoTimer = setTimeout(() => {
        onContinue();
      }, transitionDelay);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [autoTransition, transitionDelay, onContinue]);

  return (
    <div className={cn(
      "w-full py-8 px-4 bg-secondary-background border-2 border-black",
      "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      "my-6",
      className
    )}>
      {/* Phase completion indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-mono font-bold">
          <span>✅</span>
          <span>FASE {transition.fromAgent.phase} COMPLETADA</span>
        </div>
      </div>

      {/* Agent handoff visualization */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* From Agent */}
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all duration-1000",
          showHandoff && "opacity-50 scale-95"
        )}>
          <AgentAvatar 
            agent={transition.fromAgent} 
            size="lg" 
            showPhase 
          />
          <div className="text-center">
            <div className="font-heading font-bold text-sm">
              {transition.fromAgent.name}
            </div>
            <div className="text-xs font-mono text-gray-600">
              Completado
            </div>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "w-12 h-8 bg-main border-2 border-black flex items-center justify-center",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            "transition-all duration-500",
            isAnimating && "animate-bounce"
          )}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>
          <div className="text-xs font-mono text-gray-600">
            HANDOFF
          </div>
        </div>

        {/* To Agent */}
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all duration-1000 delay-500",
          !showHandoff && "opacity-30 scale-90",
          showHandoff && "opacity-100 scale-100"
        )}>
          <AgentAvatar 
            agent={transition.toAgent} 
            size="lg" 
            showPhase 
          />
          <div className="text-center">
            <div className="font-heading font-bold text-sm">
              {transition.toAgent.name}
            </div>
            <div className="text-xs font-mono text-gray-600">
              Siguiente
            </div>
          </div>
        </div>
      </div>

      {/* Handoff message */}
      <div className={cn(
        "max-w-2xl mx-auto p-4 bg-background border-2 border-black",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "transition-all duration-500 delay-1000",
        showHandoff ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <AgentAvatar agent={transition.fromAgent} size="sm" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-sm leading-relaxed">
              {transition.handoffMessage}
            </div>
            <div className="mt-3 text-xs font-mono text-gray-500 italic">
              Razón del handoff: {transition.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Next agent introduction */}
      {showHandoff && (
        <div className={cn(
          "max-w-2xl mx-auto mt-4 p-4 bg-yellow-100 border-2 border-black",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "animate-fade-in"
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <AgentAvatar agent={transition.toAgent} size="sm" />
            </div>
            <div className="flex-1">
              <div className="font-heading font-bold text-sm mb-1">
                ¡Hola! Soy {transition.toAgent.name}
              </div>
              <div className="font-mono text-sm text-gray-700 mb-2">
                {transition.toAgent.description}
              </div>
              <div className="text-xs font-mono text-gray-600">
                Especialidades: {transition.toAgent.expertise.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isAnimating && showHandoff && (
        <div className={cn(
          "flex items-center justify-center gap-4 mt-6",
          "animate-fade-in-up"
        )}>
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              className="px-6 py-2"
            >
              ← Volver a {transition.fromAgent.name}
            </Button>
          )}
          
          <Button
            onClick={onContinue}
            variant="default"
            className="px-8 py-2 font-bold"
          >
            Continuar con {transition.toAgent.name} →
          </Button>
        </div>
      )}

      {/* Auto transition countdown */}
      {autoTransition && !isAnimating && showHandoff && (
        <div className="text-center mt-4">
          <div className="text-xs font-mono text-gray-500">
            Transición automática en {Math.ceil(transitionDelay / 1000)}s
          </div>
        </div>
      )}

      {/* KIKI personality footer */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <div className="text-xs font-mono text-gray-600 italic">
          🤖 KIKI dice: Los handoffs son como posta de relevos, pero con menos sudor y más café
        </div>
      </div>
    </div>
  );
}

// Simplified version for inline transitions
interface InlineAgentTransitionProps {
  fromAgent: AgentTransitionType['fromAgent'];
  toAgent: AgentTransitionType['toAgent'];
  className?: string;
}

export function InlineAgentTransition({
  fromAgent,
  toAgent,
  className
}: InlineAgentTransitionProps) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-4 py-4 my-4",
      "bg-secondary-background border-2 border-black",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      <AgentAvatar agent={fromAgent} size="sm" />
      
      <div className="flex items-center gap-2">
        <div className="w-6 h-0.5 bg-black" />
        <div className="w-4 h-4 bg-main border-2 border-black flex items-center justify-center">
          <div className="w-1 h-1 bg-white" />
        </div>
        <div className="w-6 h-0.5 bg-black" />
      </div>
      
      <AgentAvatar agent={toAgent} size="sm" />
      
      <div className="text-xs font-mono font-bold">
        FASE {toAgent.phase}
      </div>
    </div>
  );
}