'use client';

/**
 * StepNavigation - Progress bar y navegación libre entre los 5 pasos del wizard
 * Neobrutalism design con indicadores visuales de progreso
 */

import React from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepNames: string[];
  onStepChange: (step: number) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  stepNames,
  onStepChange
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'available';
    return 'locked';
  };

  const getStepStyles = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    const baseStyles = 'relative flex items-center justify-center w-12 h-12 border-4 border-black font-black text-lg cursor-pointer transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-400 text-white hover:bg-green-500`;
      case 'current':
        return `${baseStyles} bg-yellow-400 text-black hover:bg-yellow-500 ring-4 ring-blue-400`;
      case 'available':
        return `${baseStyles} bg-white text-black hover:bg-gray-100`;
      case 'locked':
        return `${baseStyles} bg-gray-300 text-gray-500 cursor-not-allowed`;
      default:
        return baseStyles;
    }
  };

  const getConnectorStyles = (stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber) || completedSteps.includes(stepNumber + 1);
    const isCurrent = stepNumber === currentStep - 1;
    
    if (isCompleted) {
      return 'bg-green-400 border-green-400';
    } else if (isCurrent) {
      return 'bg-yellow-400 border-yellow-400';
    } else {
      return 'bg-gray-300 border-gray-300';
    }
  };

  const handleStepClick = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    if (status !== 'locked') {
      onStepChange(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isLast = stepNumber === totalSteps;
          
          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={getStepStyles(stepNumber)}
                  onClick={() => handleStepClick(stepNumber)}
                >
                  {completedSteps.includes(stepNumber) ? (
                    <span>✓</span>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Name */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-bold text-black max-w-24">
                    {stepNames[index] || `Paso ${stepNumber}`}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div className={`h-2 border-2 ${getConnectorStyles(stepNumber)} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    <div 
                      className="h-full bg-current transition-all duration-300"
                      style={{
                        width: stepNumber < currentStep ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              return (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-black cursor-pointer ${
                    stepNumber === currentStep
                      ? 'bg-yellow-400 text-black'
                      : completedSteps.includes(stepNumber)
                      ? 'bg-green-400 text-white'
                      : stepNumber < currentStep
                      ? 'bg-white text-black'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={() => handleStepClick(stepNumber)}
                >
                  {completedSteps.includes(stepNumber) ? '✓' : stepNumber}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Current Step Info */}
        <div className="text-center">
          <h3 className="font-black text-lg">
            Paso {currentStep}: {stepNames[currentStep - 1]}
          </h3>
          <div className="mt-2">
            <div className="bg-gray-200 h-2 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div 
                className="bg-yellow-400 h-full rounded transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((currentStep / totalSteps) * 100)}% completado
            </p>
          </div>
        </div>
      </div>

      {/* Step Instructions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-400 border-2 border-black rounded-full flex items-center justify-center">
            <span className="text-white font-black text-sm">i</span>
          </div>
          <div>
            <p className="font-bold text-sm">
              {getStepInstructions(currentStep)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get step-specific instructions
const getStepInstructions = (step: number): string => {
  const instructions = [
    'Comparte tu idea y trabajemos juntos para definir el concepto del proyecto.',
    'Investigaremos el mercado y validaremos tu idea con análisis de competencia.',
    'Planificaremos la arquitectura técnica y seleccionaremos las tecnologías.',
    'Crearemos toda la documentación técnica y especificaciones del proyecto.',
    'Configuraremos el entorno y generaremos los archivos finales del proyecto.'
  ];
  
  return instructions[step - 1] || 'Instrucciones del paso';
};