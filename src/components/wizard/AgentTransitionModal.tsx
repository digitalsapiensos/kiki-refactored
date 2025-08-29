'use client';

/**
 * AgentTransitionModal - Modal que muestra la transición entre agentes
 * Animación smooth de handoff entre pasos del wizard
 */

import React, { useEffect, useState } from 'react';
import { agents } from '@/components/chat/mockData';

interface AgentTransitionModalProps {
  transitionData: {
    fromStep: number;
    toStep: number;
    fromAgent: any;
    toAgent: any;
  };
  onComplete: () => void;
  isOpen: boolean;
}

export const AgentTransitionModal: React.FC<AgentTransitionModalProps> = ({
  transitionData,
  onComplete,
  isOpen
}) => {
  const [currentPhase, setCurrentPhase] = useState<'greeting' | 'transition' | 'introduction'>('greeting');
  const [showAnimation, setShowAnimation] = useState(false);

  const fromAgent = agents.find(a => a.phase === transitionData.fromStep);
  const toAgent = agents.find(a => a.phase === transitionData.toStep);

  useEffect(() => {
    if (isOpen && fromAgent && toAgent) {
      // Secuencia de transición
      const sequence = async () => {
        // Fase 1: Saludo de despedida (3s)
        setCurrentPhase('greeting');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Fase 2: Animación de transición (2s)
        setCurrentPhase('transition');
        setShowAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fase 3: Introducción del nuevo agente (3s)
        setCurrentPhase('introduction');
        setShowAnimation(false);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Completar transición
        onComplete();
      };
      
      sequence();
    }
  }, [isOpen, fromAgent, toAgent, onComplete]);

  if (!isOpen || !fromAgent || !toAgent) return null;

  const getHandoffMessage = () => {
    const handoffMessages = {
      1: '¡Perfecto! Ya tienes tu concepto súper claro. Ahora te paso con Sara, nuestra investigadora experta. Ella va a ver si tu idea ya existe (spoiler: probablemente sí, pero no te preocupes). ¡Que tengas suerte!',
      2: 'Excelente research! Tu idea está validada y el mercado se ve prometedor. Ahora viene Toni, nuestro arquitecto técnico. Él va a elegir todas las tecnologías mientras tú finges entender de qué habla. ¡A por ello!',
      3: '¡Stack seleccionado! Tienes una arquitectura sólida y escalable. Ahora te presento a Chris, nuestro documentador profesional. Él va a crear documentación que nadie leerá pero todos necesitan. ¡Es tradición!',
      4: '¡Documentación completa! Tienes todo lo que necesitas para empezar a desarrollar. Finalmente, Quentin va a configurar tu deployment. Es como mudarse, pero con más errores 500. ¡Último paso!',
      5: '¡Deployment configurado! Tu proyecto está listo para conquistar el mundo. O al menos para funcionar en internet. ¡Felicidades, lo lograste!'
    };
    
    return handoffMessages[transitionData.fromStep as keyof typeof handoffMessages] || 
           `¡Genial! Paso completado. Ahora te paso con ${toAgent.name}.`;
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8 max-w-lg w-full mx-4 relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-blue-50 opacity-50"></div>
        
        <div className="relative z-10">
          {currentPhase === 'greeting' && (
            <div className="text-center">
              <div className={`w-24 h-24 bg-gradient-to-br ${getAgentGradient(fromAgent.color)} border-6 border-black rounded-full mx-auto mb-4 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse`}>
                <span className="text-white font-black text-3xl">
                  {fromAgent.name.charAt(0)}
                </span>
              </div>
              <h2 className="font-black text-2xl mb-2">¡Paso {transitionData.fromStep} Completado!</h2>
              <h3 className="font-bold text-lg text-gray-700 mb-4">{fromAgent.name} dice...</h3>
              <div className="bg-gradient-to-r from-green-100 to-green-200 border-4 border-black p-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-medium italic">"{getHandoffMessage()}"</p>
              </div>
            </div>
          )}

          {currentPhase === 'transition' && (
            <div className="text-center">
              <h2 className="font-black text-2xl mb-6">Cambiando de agente...</h2>
              
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* From Agent */}
                <div className={`transform transition-all duration-1000 ${showAnimation ? 'translate-x-12 opacity-50 scale-75' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${getAgentGradient(fromAgent.color)} border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <span className="text-white font-black text-xl">
                      {fromAgent.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-2">{fromAgent.name}</p>
                </div>

                {/* Arrow */}
                <div className="text-4xl font-black animate-bounce">→</div>

                {/* To Agent */}
                <div className={`transform transition-all duration-1000 ${showAnimation ? '-translate-x-12 opacity-100 scale-110' : 'translate-x-12 opacity-50 scale-75'}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${getAgentGradient(toAgent.color)} border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <span className="text-white font-black text-xl">
                      {toAgent.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-2">{toAgent.name}</p>
                </div>
              </div>

              {/* Loading animation */}
              <div className="flex justify-center items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 border-2 border-black rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-yellow-400 border-2 border-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}

          {currentPhase === 'introduction' && (
            <div className="text-center">
              <div className={`w-24 h-24 bg-gradient-to-br ${getAgentGradient(toAgent.color)} border-6 border-black rounded-full mx-auto mb-4 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse`}>
                <span className="text-white font-black text-3xl">
                  {toAgent.name.charAt(0)}
                </span>
              </div>
              <h2 className="font-black text-2xl mb-2">¡Bienvenido al Paso {transitionData.toStep}!</h2>
              <h3 className="font-bold text-lg text-gray-700 mb-4">Conoce a {toAgent.name}</h3>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-black p-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                <p className="text-sm font-medium italic">"{toAgent.description}"</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600">Especialista en: {toAgent.role}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {toAgent.expertise.slice(0, 2).map((skill: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-yellow-200 border-2 border-black text-xs font-bold rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};