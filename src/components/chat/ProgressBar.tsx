/**
 * ProgressBar Component
 * Perfect neobrutalism progress bars for KIKI wizard phases
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Agent } from './types';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  variant?: 'default' | 'phase' | 'file' | 'mini';
  showPercentage?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  color?: string;
}

export function ProgressBar({
  progress,
  className,
  variant = 'default',
  showPercentage = true,
  showLabels = false,
  animated = true,
  color = 'bg-main'
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Mini variant - just a thin bar
  if (variant === 'mini') {
    return (
      <div className={cn(
        "h-1 bg-gray-200 border border-black rounded-none",
        className
      )}>
        <div 
          className={cn(
            "h-full border-r border-black transition-all",
            animated ? "duration-500 ease-out" : "duration-0",
            color
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    );
  }

  // File variant - for file generation progress
  if (variant === 'file') {
    return (
      <div className={cn("space-y-2", className)}>
        {showPercentage && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-700">
              Progreso
            </span>
            <span className="text-xs font-mono font-bold text-gray-700">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        )}
        
        <div className="h-2 bg-gray-200 border-2 border-black rounded-none">
          <div 
            className={cn(
              "h-full border-r-2 border-black transition-all",
              animated ? "duration-300 ease-out" : "duration-0",
              color
            )}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // Phase variant - for wizard progress
  if (variant === 'phase') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-black">
            Progreso del Proyecto
          </span>
          {showPercentage && (
            <span className="font-mono font-bold text-sm text-black">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>

        <div className="h-4 bg-gray-200 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div 
            className={cn(
              "h-full border-r-2 border-black transition-all relative",
              animated ? "duration-700 ease-out" : "duration-0",
              color
            )}
            style={{ width: `${clampedProgress}%` }}
          >
            {/* Progress bar pattern */}
            <div className="absolute inset-0 opacity-20 bg-black" 
                 style={{
                   backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
                 }} 
            />
          </div>
        </div>

        {showLabels && (
          <div className="text-xs font-mono text-gray-600">
            {clampedProgress < 20 && "🎯 Conceptualizando..."}
            {clampedProgress >= 20 && clampedProgress < 40 && "🔍 Investigando..."}
            {clampedProgress >= 40 && clampedProgress < 60 && "🛠️ Planificando..."}
            {clampedProgress >= 60 && clampedProgress < 80 && "📄 Documentando..."}
            {clampedProgress >= 80 && clampedProgress < 100 && "📦 Finalizando..."}
            {clampedProgress === 100 && "✅ ¡Completado!"}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-2", className)}>
      {showPercentage && (
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-sm text-black">
            Progreso
          </span>
          <span className="font-mono font-bold text-sm text-black">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      
      <div className="h-3 bg-gray-200 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div 
          className={cn(
            "h-full border-r-2 border-black transition-all",
            animated ? "duration-500 ease-out" : "duration-0",
            color
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

// Specialized progress bar for wizard phases
interface PhaseProgressProps {
  currentPhase: number;
  totalPhases?: number;
  phases?: string[];
  className?: string;
  showPhaseNames?: boolean;
  completedPhases?: number[];
}

export function PhaseProgress({
  currentPhase,
  totalPhases = 5,
  phases = ['Conceptualización', 'Investigación', 'Planificación', 'Documentación', 'Finalización'],
  className,
  showPhaseNames = true,
  completedPhases = []
}: PhaseProgressProps) {
  const progress = (completedPhases.length / totalPhases) * 100;
  
  const phaseColors = [
    'bg-chart-1', // Yellow
    'bg-chart-2', // Blue 
    'bg-chart-3', // Green
    'bg-chart-4', // Orange
    'bg-chart-5'  // Purple
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall progress */}
      <ProgressBar
        progress={progress}
        variant="phase"
        showPercentage
        showLabels
        color="bg-main"
      />

      {/* Individual phase indicators */}
      {showPhaseNames && (
        <div className="space-y-2">
          {phases.slice(0, totalPhases).map((phaseName, index) => {
            const phaseNumber = index + 1;
            const isCompleted = completedPhases.includes(phaseNumber);
            const isCurrent = phaseNumber === currentPhase;
            const isPending = phaseNumber > currentPhase && !isCompleted;

            return (
              <div key={index} className="flex items-center gap-3">
                {/* Phase indicator */}
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center",
                  "border-2 border-black rounded-none font-mono font-bold text-xs",
                  isCompleted && "bg-green-400 text-green-800",
                  isCurrent && cn(phaseColors[index] || 'bg-main', "text-black animate-pulse"),
                  isPending && "bg-gray-200 text-gray-600"
                )}>
                  {isCompleted ? '✓' : phaseNumber}
                </div>

                {/* Phase name */}
                <span className={cn(
                  "font-mono text-sm",
                  isCompleted && "font-bold text-green-700 line-through",
                  isCurrent && "font-bold text-black",
                  isPending && "text-gray-500"
                )}>
                  {phaseName}
                </span>

                {/* Phase status */}
                {isCurrent && (
                  <span className="ml-auto text-xs font-mono font-bold bg-yellow-400 text-yellow-800 px-2 py-1 border-2 border-black rounded-none">
                    EN PROGRESO
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Multi-step progress with custom steps
interface StepProgressProps {
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'current' | 'completed' | 'error';
    description?: string;
  }>;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export function StepProgress({
  steps,
  className,
  variant = 'vertical'
}: StepProgressProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  if (variant === 'horizontal') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Overall progress */}
        <ProgressBar progress={progress} showPercentage />

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center",
                  "border-2 border-black rounded-none font-mono font-bold text-xs",
                  step.status === 'completed' && "bg-green-400 text-green-800",
                  step.status === 'current' && "bg-main text-white animate-pulse",
                  step.status === 'error' && "bg-red-400 text-red-800",
                  step.status === 'pending' && "bg-gray-200 text-gray-600"
                )}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'error' ? '✗' : 
                   index + 1}
                </div>
                <span className="text-xs font-mono text-center mt-2 max-w-20">
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 border-b-2 border-black mx-2",
                  completedSteps > index ? "border-green-500" : "border-gray-300"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Vertical variant (default)
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          {/* Step indicator */}
          <div className={cn(
            "w-6 h-6 flex items-center justify-center flex-shrink-0",
            "border-2 border-black rounded-none font-mono font-bold text-xs",
            step.status === 'completed' && "bg-green-400 text-green-800",
            step.status === 'current' && "bg-main text-white animate-pulse",
            step.status === 'error' && "bg-red-400 text-red-800",
            step.status === 'pending' && "bg-gray-200 text-gray-600"
          )}>
            {step.status === 'completed' ? '✓' : 
             step.status === 'error' ? '✗' : 
             index + 1}
          </div>

          {/* Step content */}
          <div className="flex-1">
            <div className={cn(
              "font-mono text-sm",
              step.status === 'completed' && "font-bold text-green-700",
              step.status === 'current' && "font-bold text-black",
              step.status === 'error' && "font-bold text-red-700",
              step.status === 'pending' && "text-gray-600"
            )}>
              {step.label}
            </div>
            {step.description && (
              <div className="text-xs font-mono text-gray-500 mt-1">
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}