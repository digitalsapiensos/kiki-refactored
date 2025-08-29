'use client';

/**
 * KIKI Chat System Demo Page
 * Complete demonstration of all chat components with live mock interactions
 */

import React, { useState, useEffect } from 'react';
import { ChatSession, Agent, ChatMessage } from '@/components/chat/types';
import { 
  agents, 
  sampleChatSession, 
  sampleSessions, 
  enhancedConversationFlows 
} from '@/components/chat/mockData';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KIKIInputField } from '@/components/chat/UserInputField';
import { KIKITypingIndicator } from '@/components/chat/TypingIndicator';
import { FileGenerationProgress } from '@/components/chat/FileGenerationProgress';
import { ProjectProgress } from '@/components/chat/ProjectProgress';
import { 
  mockAgentSystem, 
  generateMockResponse, 
  simulateTypingDelay 
} from '@/components/chat/MockAgentSystem';
import { 
  analyzeHandoffReadiness
} from '@/components/chat/ContextHandoffSystem';
import { 
  generateProjectZip,
  getProjectFiles,
  fileAccumulationSystem 
} from '@/components/chat/FileAccumulationSystem';

export default function ChatDemoPage() {
  const [currentSession, setCurrentSession] = useState<ChatSession>(sampleChatSession);
  const [selectedScenario, setSelectedScenario] = useState<'mentorApp' | 'ecommerce' | 'custom'>('mentorApp');
  const [isTyping, setIsTyping] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [componentDemo, setComponentDemo] = useState<string | null>(null);

  // Update session when scenario changes
  useEffect(() => {
    const sessionMap = {
      mentorApp: sampleSessions.newProject,
      ecommerce: sampleChatSession,
      custom: sampleSessions.techPhase
    };
    
    setCurrentSession(sessionMap[selectedScenario]);
  }, [selectedScenario]);

  // Handle sending messages with mock agent response
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message.trim(),
      type: 'user',
      timestamp: new Date()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    };
    setCurrentSession(updatedSession);

    // Start typing
    setIsTyping(true);

    try {
      // Generate response using mock system
      const response = generateMockResponse(
        currentSession.currentAgent,
        message,
        updatedSession
      );

      // Simulate typing delay
      await simulateTypingDelay(response.response.length);

      // Add agent response
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        content: response.response,
        type: 'agent',
        agentId: currentSession.currentAgent.id,
        timestamp: new Date()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, agentMessage]
      };

      // Add any generated files
      if (response.filesToGenerate.length > 0) {
        finalSession.fileGenerations = [
          ...finalSession.fileGenerations,
          ...response.filesToGenerate
        ];
      }

      setCurrentSession(finalSession);

      // Check for handoff if needed
      if (response.shouldTransition && response.nextAgent) {
        setTimeout(() => {
          handleAgentTransition(finalSession, response.nextAgent!);
        }, 2000);
      }

    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle agent transitions
  const handleAgentTransition = (session: ChatSession, nextAgent: Agent) => {
    const readiness = analyzeHandoffReadiness(session.messages, session.currentAgent, session);
    
    if (readiness.isReady) {
      const handoffContext = {
        fromAgent: session.currentAgent,
        toAgent: nextAgent,
        messages: session.messages,
        session: session
      };

      // Create transition message
      const transitionMessage: ChatMessage = {
        id: `transition-${Date.now()}`,
        content: `🎯 **TRANSICIÓN** 🎯\n\nPasando de ${handoffContext.fromAgent.name} a ${handoffContext.toAgent.name}`,
        type: 'system',
        timestamp: new Date()
      };

      // Welcome from new agent
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        content: `¡${nextAgent.name} aquí! ${nextAgent.description}`,
        type: 'agent',
        agentId: nextAgent.id,
        timestamp: new Date()
      };

      const transitionedSession = {
        ...session,
        currentAgent: nextAgent,
        messages: [...session.messages, transitionMessage, welcomeMessage],
        projectProgress: {
          ...session.projectProgress,
          currentPhase: nextAgent.phase,
          completedPhases: [...session.projectProgress.completedPhases, session.currentAgent.phase]
        }
      };

      setCurrentSession(transitionedSession);
    }
  };

  // Load conversation scenario
  const loadConversationScenario = (scenario: 'phase1' | 'phase2' | 'phase3') => {
    const conversationFlow = enhancedConversationFlows.mentorApp[scenario];
    if (conversationFlow) {
      const newSession = {
        ...currentSession,
        messages: conversationFlow,
        currentAgent: agents.find(a => a.phase === parseInt(scenario.replace('phase', ''))) || agents[0]
      };
      setCurrentSession(newSession);
    }
  };

  // Generate project ZIP
  const handleGenerateZip = () => {
    const zip = generateProjectZip(
      'kiki-demo-project.zip',
      [1, 2, 3, 4, 5],
      currentSession
    );
    
    alert(`Generated ZIP archive: ${zip.name}\nTotal files: ${zip.files.length}\nTotal size: ${Math.round(zip.totalSize / 1024)}KB\n\nMock download URL: ${zip.downloadUrl}`);
  };

  // Component demonstrations
  const demoComponents = {
    avatars: () => (
      <div className="grid grid-cols-5 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="text-center">
            <AgentAvatar 
              agent={agent} 
              size="lg" 
              showName={true}
              showPhase={true}
            />
          </div>
        ))}
      </div>
    ),

    typing: () => (
      <div className="space-y-4">
        {agents.slice(0, 3).map(agent => (
          <KIKITypingIndicator
            key={agent.id}
            agent={agent}
            isTyping={true}
            variant="bubble"
            showPersonalityMessage={true}
          />
        ))}
      </div>
    ),

    fileGeneration: () => (
      <FileGenerationProgress 
        files={currentSession.fileGenerations}
        showCompleted={true}
      />
    ),

    projectProgress: () => (
      <div className="space-y-4">
        <ProjectProgress 
          progress={currentSession.projectProgress}
          variant="full"
          showPercentage={true}
        />
        <ProjectProgress 
          progress={currentSession.projectProgress}
          variant="compact"
        />
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-black">KIKI CHAT SYSTEM</h1>
              <p className="text-lg font-mono text-gray-600">
                Complete Demo - Neobrutalism UI with Mock Agents
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowComponents(!showComponents)}
                className="px-4 py-2 bg-blue-400 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
              >
                {showComponents ? 'Hide Components' : 'Show Components'}
              </button>
              
              <button
                onClick={handleGenerateZip}
                className="px-4 py-2 bg-green-400 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
              >
                Generate ZIP
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Sidebar Controls */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            
            {/* Scenario Selection */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="font-black text-lg mb-4">Demo Scenarios</h3>
              
              <div className="space-y-2">
                {[
                  { id: 'mentorApp', label: 'Mentor App', desc: 'Student-mentor platform' },
                  { id: 'ecommerce', label: 'E-commerce', desc: 'Online store platform' },
                  { id: 'custom', label: 'Custom Project', desc: 'Generic project type' }
                ].map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id as any)}
                    className={`w-full text-left p-3 border-2 border-black font-mono text-sm transition-all duration-150 ${
                      selectedScenario === scenario.id
                        ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold">{scenario.label}</div>
                    <div className="text-gray-600">{scenario.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Presets */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="font-black text-lg mb-4">Load Conversation</h3>
              
              <div className="space-y-2">
                {[
                  { id: 'phase1', label: 'Phase 1 - Consultor Virtual', agent: 'consultor-virtual' },
                  { id: 'phase2', label: 'Phase 2 - Business Analyst', agent: 'business-analyst' },
                  { id: 'phase3', label: 'Phase 3 - Arquitecto Senior', agent: 'arquitecto-senior' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => loadConversationScenario(preset.id as any)}
                    className="w-full text-left p-2 border-2 border-black bg-white hover:bg-gray-100 font-mono text-sm transition-all duration-150"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Agent Info */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="font-black text-lg mb-4">Current Agent</h3>
              
              <div className="text-center">
                <AgentAvatar 
                  agent={currentSession.currentAgent}
                  size="xl"
                  showName={true}
                  showPhase={true}
                />
                
                <div className="mt-4 p-3 bg-white border-2 border-black">
                  <p className="text-sm font-mono text-gray-700 italic">
                    "{currentSession.currentAgent.description}"
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="font-black text-lg mb-4">Session Stats</h3>
              
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span className="font-bold">{currentSession.messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Files Generated:</span>
                  <span className="font-bold">{currentSession.fileGenerations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Phase:</span>
                  <span className="font-bold">{currentSession.currentAgent.phase}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-bold">{currentSession.projectProgress.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            
            {/* Component Demos */}
            {showComponents && (
              <div className="mb-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="font-black text-2xl mb-4">Component Showcase</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { id: 'avatars', label: 'Agent Avatars' },
                    { id: 'typing', label: 'Typing Indicators' },
                    { id: 'fileGeneration', label: 'File Generation' },
                    { id: 'projectProgress', label: 'Project Progress' }
                  ].map(demo => (
                    <button
                      key={demo.id}
                      onClick={() => setComponentDemo(demo.id)}
                      className={`px-3 py-1 border-2 border-black font-bold text-sm transition-all duration-150 ${
                        componentDemo === demo.id
                          ? 'bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
                
                <div className="p-4 border-2 border-gray-300 min-h-[200px]">
                  {componentDemo && demoComponents[componentDemo as keyof typeof demoComponents] ? 
                    demoComponents[componentDemo as keyof typeof demoComponents]() : 
                    <div className="text-center text-gray-500 font-mono">
                      Select a component to demo
                    </div>
                  }
                </div>
              </div>
            )}

            {/* Main Chat Interface */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-[600px] flex flex-col">
                
                {/* Chat Header */}
                <div className="flex-shrink-0 p-4 border-b-4 border-black bg-gradient-to-r from-yellow-100 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <AgentAvatar 
                        agent={currentSession.currentAgent}
                        size="md"
                        showPhase={true}
                      />
                      <div>
                        <h3 className="font-black text-xl">{currentSession.currentAgent.name}</h3>
                        <p className="font-mono text-gray-600">{currentSession.currentAgent.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 border border-black"></div>
                      <span className="text-sm font-bold">DEMO MODE</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentSession.messages.map((message) => {
                    const agent = message.agentId ? agents.find(a => a.id === message.agentId) : undefined;
                    
                    if (message.type === 'system') {
                      return (
                        <div key={message.id} className="text-center">
                          <div className="inline-block px-4 py-2 bg-blue-100 border-2 border-black font-mono text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {message.content}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {message.type === 'agent' && agent && (
                          <div className="flex-shrink-0">
                            <AgentAvatar agent={agent} size="sm" />
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                          
                          {message.type === 'agent' && agent && (
                            <div className="text-xs font-mono text-gray-600 mb-1">
                              {agent.name} • {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                          
                          <div className={`px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm ${
                            message.type === 'user' 
                              ? 'bg-blue-400 text-white' 
                              : 'bg-white text-black'
                          }`}>
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <AgentAvatar agent={currentSession.currentAgent} size="sm" />
                      </div>
                      <div className="flex-1">
                        <KIKITypingIndicator
                          agent={currentSession.currentAgent}
                          isTyping={true}
                          variant="bubble"
                          showPersonalityMessage={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t-4 border-black">
                  <KIKIInputField
                    onSendMessage={handleSendMessage}
                    disabled={isTyping}
                    agentName={currentSession.currentAgent.name}
                    isAgentTyping={isTyping}
                    showPersonalityTips={true}
                    currentPhase={currentSession.currentAgent.phase}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-4">KIKI Chat System Demo</h2>
          <p className="font-mono text-gray-400 mb-4">
            Complete neobrutalism UI with intelligent mock agents
          </p>
          <div className="flex justify-center gap-4">
            <div className="text-sm">
              <strong>Components:</strong> 15+ React components
            </div>
            <div className="text-sm">
              <strong>Agents:</strong> 5 specialized AI personalities
            </div>
            <div className="text-sm">
              <strong>Phases:</strong> Complete 5-step wizard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}