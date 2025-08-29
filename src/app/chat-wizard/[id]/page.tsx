'use client';

/**
 * KIKI Chat Wizard - Main 5-Step Wizard Container
 * Reemplaza el sistema copy-paste con chat nativo integrado
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { agents, sampleChatSession } from '@/components/chat/mockData';
import { ChatSession, Agent } from '@/components/chat/types';

export default function ChatWizardPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize chat session
  useEffect(() => {
    const initializeChatSession = () => {
      const session: ChatSession = {
        ...sampleChatSession,
        id: `session-${projectId}`,
        projectId: projectId,
        currentAgent: agents[0], // Start with Peter (Step 1)
      };
      
      setChatSession(session);
      setIsLoading(false);
    };

    if (projectId) {
      initializeChatSession();
    }
  }, [projectId]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // Update current agent based on step
    if (chatSession) {
      const newAgent = agents.find(agent => agent.phase === step);
      if (newAgent) {
        setChatSession({
          ...chatSession,
          currentAgent: newAgent,
          projectProgress: {
            ...chatSession.projectProgress,
            currentPhase: step
          }
        });
      }
    }
  };

  const handleChatUpdate = (updatedSession: ChatSession) => {
    setChatSession(updatedSession);
  };

  if (isLoading || !chatSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Cargando tu asistente KIKI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <WizardContainer
        chatSession={chatSession}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onChatUpdate={handleChatUpdate}
      />
    </div>
  );
}