/**
 * ProjectProgress Component
 * Shows project progress with neobrutalism styling across the 5 phases
 */

import * as React from 'react';
import { cn } from '../../lib/utils';
import { ProjectProgress as ProjectProgressType } from './types';
import { AgentAvatar } from './AgentAvatar';
import { getAgentByPhase } from './mockData';

interface ProjectProgressProps {
  progress: ProjectProgressType;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showPercentage?: boolean;
  compact?: boolean; // For backward compatibility with wizard components
}

export function ProjectProgress({
  progress,
  className,
  variant = 'full',
  showPercentage = true
}: ProjectProgressProps) {
  if (variant === 'minimal') {
    return <ProjectProgressMinimal progress={progress} className={className} />;
  }

  if (variant === 'compact') {
    return <ProjectProgressCompact progress={progress} className={className} showPercentage={showPercentage} />;
  }

  return (
    <div className={cn(
      "w-full bg-background border-2 border-black p-6",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-bold text-xl text-black">
            Progreso del Proyecto
          </h3>
          <p className="text-sm font-mono text-gray-600 mt-1">
            Fase {progress.currentPhase} de {progress.totalPhases} • {Math.round(progress.progress)}% completado
          </p>
        </div>
        
        {showPercentage && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 border-2 border-black bg-main text-white flex items-center justify-center font-mono font-bold text-lg">
              {Math.round(progress.progress)}%
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-6 bg-gray-200 border-2 border-black">
          <div 
            className="h-full bg-main border-r-2 border-black transition-all duration-1000 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Phase Steps */}
      <div className="space-y-4">
        {progress.phaseNames.map((phaseName, index) => {
          const phaseNumber = index + 1;
          const agent = getAgentByPhase(phaseNumber);
          const isCompleted = progress.completedPhases.includes(phaseNumber);
          const isCurrent = progress.currentPhase === phaseNumber;
          const isUpcoming = phaseNumber > progress.currentPhase;

          return (
            <PhaseStep
              key={phaseNumber}
              phaseNumber={phaseNumber}
              phaseName={phaseName}
              agent={agent}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isUpcoming={isUpcoming}
            />
          );
        })}
      </div>

      {/* KIKI motivation */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="text-center text-sm font-mono text-gray-600 italic">
          {progress.progress < 20 && "🚀 KIKI dice: Todos los grandes proyectos empiezan con un solo paso"}
          {progress.progress >= 20 && progress.progress < 50 && "💪 KIKI dice: ¡Vas por buen camino! Esto es más fácil de lo que pensabas"}
          {progress.progress >= 50 && progress.progress < 80 && "🔥 KIKI dice: ¡Estás en racha! La meta está más cerca"}
          {progress.progress >= 80 && "⭐ KIKI dice: ¡Casi listo para conquistar el mundo tech!"}
        </div>
      </div>
    </div>
  );
}

// Individual phase step component
interface PhaseStepProps {
  phaseNumber: number;
  phaseName: string;
  agent?: any;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
}

function PhaseStep({
  phaseNumber,
  phaseName,
  agent,
  isCompleted,
  isCurrent,
  isUpcoming
}: PhaseStepProps) {
  const getStepStyling = () => {
    if (isCompleted) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        indicator: '✅',
        text: 'text-green-800'
      };
    }
    if (isCurrent) {
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
        indicator: '🔄',
        text: 'text-yellow-800'
      };
    }
    return {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      indicator: '⏳',
      text: 'text-gray-600'
    };
  };

  const styling = getStepStyling();

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 border-2 border-black",
      styling.bg,
      isCurrent && "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      isCurrent && "animate-pulse"
    )}>
      {/* Phase indicator */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 border-2 border-black flex items-center justify-center font-mono font-bold",
          styling.bg
        )}>
          {styling.indicator}
        </div>
        <div className="text-2xl font-mono font-bold text-black">
          {phaseNumber}
        </div>
      </div>

      {/* Phase info */}
      <div className="flex-1">
        <h4 className={cn("font-heading font-bold text-lg", styling.text)}>
          {phaseName}
        </h4>
        {agent && (
          <div className="flex items-center gap-2 mt-1">
            <AgentAvatar agent={agent} size="sm" />
            <span className="text-sm font-mono text-gray-600">
              {agent.name} - {agent.role}
            </span>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        <div className={cn(
          "px-3 py-1 border-2 border-black font-mono text-xs font-bold",
          styling.bg,
          styling.text
        )}>
          {isCompleted ? 'COMPLETADO' : isCurrent ? 'EN PROGRESO' : 'PENDIENTE'}
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar or small spaces
function ProjectProgressCompact({
  progress,
  className,
  showPercentage = true
}: {
  progress: ProjectProgressType;
  className?: string;
  showPercentage?: boolean;
}) {
  return (
    <div className={cn(
      "bg-background border-2 border-black p-4",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-heading font-bold text-sm">Progreso</h4>
        {showPercentage && (
          <span className="text-xs font-mono bg-main text-white px-2 py-1 border border-black">
            {Math.round(progress.progress)}%
          </span>
        )}
      </div>

      {/* Compact progress bar */}
      <div className="w-full h-3 bg-gray-200 border border-black mb-3">
        <div 
          className="h-full bg-main transition-all duration-500"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Phase dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: progress.totalPhases }, (_, index) => {
          const phaseNumber = index + 1;
          const isCompleted = progress.completedPhases.includes(phaseNumber);
          const isCurrent = progress.currentPhase === phaseNumber;

          return (
            <div
              key={phaseNumber}
              className={cn(
                "w-6 h-6 border-2 border-black flex items-center justify-center text-xs font-bold",
                isCompleted && "bg-green-400 text-white",
                isCurrent && "bg-yellow-400 text-black",
                !isCompleted && !isCurrent && "bg-gray-200 text-gray-600"
              )}
            >
              {phaseNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Minimal version for inline display
function ProjectProgressMinimal({
  progress,
  className
}: {
  progress: ProjectProgressType;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-24 h-2 bg-gray-200 border border-black">
        <div 
          className="h-full bg-main transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-600">
        {Math.round(progress.progress)}% • Fase {progress.currentPhase}/{progress.totalPhases}
      </span>
    </div>
  );
}