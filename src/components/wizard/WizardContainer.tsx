'use client';

/**
 * WizardContainer - Layout principal del wizard de 5 pasos con chat integrado
 * Neobrutalism design con navegación libre entre pasos
 */

import React, { useState } from 'react';
import { ChatSession } from '@/components/chat/types';
import { StepNavigation } from './StepNavigation';
import { ChatInterface } from './ChatInterface';
import { ProjectProgress } from '@/components/chat/ProjectProgress';
import { FileGenerationPanel } from './FileGenerationPanel';
import { AgentTransitionModal } from './AgentTransitionModal';

interface WizardContainerProps {
  chatSession: ChatSession;
  currentStep: number;
  onStepChange: (step: number) => void;
  onChatUpdate: (session: ChatSession) => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  chatSession,
  currentStep,
  onStepChange,
  onChatUpdate
}) => {
  const [showTransition, setShowTransition] = useState(false);
  const [transitionData, setTransitionData] = useState<any>(null);

  const handleStepChange = (newStep: number) => {
    if (newStep !== currentStep) {
      // Show transition modal if moving to next step
      if (newStep > currentStep) {
        setTransitionData({
          fromStep: currentStep,
          toStep: newStep,
          fromAgent: chatSession.currentAgent,
          toAgent: chatSession.currentAgent // Will be updated by parent
        });
        setShowTransition(true);
      }
      onStepChange(newStep);
    }
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setTransitionData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50">
      {/* Header with project progress - Optimized z-index for layering */}
      <div className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-2xl font-black text-black">KIKI WIZARD</h1>
              </div>
              <div className="hidden md:block">
                <ProjectProgress 
                  progress={chatSession.projectProgress}
                  compact={true}
                />
              </div>
            </div>
            
            {/* Current Agent Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-white font-black text-lg">
                  {chatSession.currentAgent.name.charAt(0)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="font-black text-lg">{chatSession.currentAgent.name}</p>
                <p className="text-sm text-gray-600">{chatSession.currentAgent.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <StepNavigation 
            currentStep={currentStep}
            totalSteps={5}
            completedSteps={chatSession.projectProgress.completedPhases}
            stepNames={chatSession.projectProgress.phaseNames}
            onStepChange={handleStepChange}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Interface - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <ChatInterface 
                chatSession={chatSession}
                onChatUpdate={onChatUpdate}
                currentStep={currentStep}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Agent Info Card */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
              <div className="text-center mb-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${getAgentColorGradient(chatSession.currentAgent.color)} border-4 border-black rounded-full mx-auto mb-3 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                  <span className="text-white font-black text-2xl">
                    {chatSession.currentAgent.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-black text-xl mb-1">{chatSession.currentAgent.name}</h3>
                <p className="text-sm font-bold text-gray-600">{chatSession.currentAgent.role}</p>
              </div>
              
              <div className="bg-white border-2 border-black p-4 rounded">
                <p className="text-sm font-medium italic">"{chatSession.currentAgent.description}"</p>
              </div>

              <div className="mt-4">
                <p className="font-bold text-sm mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {chatSession.currentAgent.expertise.map((skill, index) => (
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

            {/* File Generation Panel */}
            <FileGenerationPanel 
              fileGenerations={chatSession.fileGenerations}
              currentAgent={chatSession.currentAgent}
            />

            {/* Project Progress Panel */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
              <h3 className="font-black text-lg mb-4">Progreso del Proyecto</h3>
              <ProjectProgress 
                progress={chatSession.projectProgress}
                compact={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Transition Modal */}
      {showTransition && transitionData && (
        <AgentTransitionModal 
          transitionData={transitionData}
          onComplete={handleTransitionComplete}
          isOpen={showTransition}
        />
      )}
    </div>
  );
};

// Helper function to get agent color gradient
const getAgentColorGradient = (color: string): string => {
  const gradients: { [key: string]: string } = {
    'chart-1': 'from-yellow-400 to-yellow-600',
    'chart-2': 'from-blue-400 to-blue-600', 
    'chart-3': 'from-green-400 to-green-600',
    'chart-4': 'from-orange-400 to-orange-600',
    'chart-5': 'from-purple-400 to-purple-600',
  };
  
  return gradients[color] || 'from-gray-400 to-gray-600';
};