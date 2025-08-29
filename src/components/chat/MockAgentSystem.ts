/**
 * Mock Agent System - Intelligent Response Generation
 * Complete system for simulating realistic agent conversations with context handoff
 */

import { ChatMessage, Agent, ChatSession, FileGeneration } from './types';
import { agents, getAgentById, getRandomAgentResponse } from './mockData';

// Professional conversation patterns based on real System Prompts from 01-inicio-proyecto
const CONVERSATION_PATTERNS = {
  'consultor-virtual': {
    greetings: [
      "Hola, soy su Consultor Virtual especializado en el primer paso de convertir ideas en proyectos estructurados. Mi trabajo es entender profundamente su visión mediante una conversación estructurada.",
      "Bienvenido al proceso de consultoría. Soy el primer especialista en la cadena de desarrollo de proyectos. Mi función es extraer y clarificar su idea mediante conversación guiada.",
      "Mi misión es convertir su concepto inicial en un resumen estructurado que alimentará el resto del proceso de creación del proyecto. Empecemos con lo fundamental.",
    ],
    questionPrompts: [
      "¿Quiénes serán los usuarios principales de su aplicación? Describa sus características y necesidades específicas.",
      "¿Cuáles considera que son las 3-5 funcionalidades más importantes que debe tener su aplicación?",
      "¿Qué aspectos técnicos son importantes para usted: plataforma, escalabilidad, presupuesto?",
      "¿Cómo sería un día típico de uso de su aplicación? Describa el flujo principal.",
    ],
    transitions: [
      "Perfecto. He captado toda la información necesaria. Procederé a generar el conversation_summary.md con nuestra conversación estructurada.",
      "Excelente contexto. Tengo suficiente información para crear el resumen completo que alimentará el siguiente paso.",
      "He completado la extracción de requisitos. Ahora nuestro Business Analyst procesará esta información.",
    ]
  },
  
  'business-analyst': {
    greetings: [
      "Soy el Business Analyst, segundo paso en la cadena de inicio de proyecto. Mi función es descomponer su conversación en documentos estructurados de lógica de negocio.",
      "He recibido su conversation_summary.md y procederé a crear tres documentos: case_overview.md, logic_breakdown.md y meta_outline.md.",
      "Mi trabajo es transformar la conversación en artefactos estructurados sin tocar aspectos de implementación técnica.",
    ],
    questionPrompts: [
      "Basándome en su conversación, identifico estas entidades principales. ¿Está de acuerdo con esta clasificación?",
      "¿Hay relaciones entre estas entidades que no haya considerado? ¿Dependencias importantes?",
      "Para las operaciones CRUD, ¿qué restricciones de seguridad considera críticas?",
      "¿Existen reglas de negocio específicas que deba documentar?",
    ],
    transitions: [
      "He completado la descomposición de la lógica de negocio. Los tres documentos están listos para el Arquitecto Senior.",
      "Perfecto. El análisis de entidades y relaciones está completo. Transfiero al siguiente especialista.",
      "La documentación de negocio está estructurada. El Arquitecto Senior puede proceder con el master plan.",
    ]
  },
  
  'arquitecto-senior': {
    greetings: [
      "Soy su Arquitecto Senior y Planificador Estratégico, tercer paso en la cadena de desarrollo. Crearé un Master Plan completo basado en los documentos de negocio.",
      "He recibido los tres documentos de negocio. Mi función es generar la hoja de ruta técnica y estratégica para todo el desarrollo posterior.",
      "Mi experiencia abarca desde la selección de stack tecnológico hasta la planificación de escalabilidad. Procedo a crear su master plan.",
    ],
    questionPrompts: [
      "Basándome en su análisis de negocio, ¿tiene preferencias específicas de tecnología o confía en mis recomendaciones profesionales?",
      "¿Su prioridad es un desarrollo rápido para validación, o una arquitectura enterprise-ready desde el inicio?",
      "¿Qué consideraciones de escalabilidad son importantes: tráfico esperado, crecimiento proyectado?",
      "¿Hay restricciones de presupuesto, tiempo, o recursos técnicos que deba considerar en mis recomendaciones?",
    ],
    transitions: [
      "He completado el Master Plan con recomendaciones técnicas y roadmap estratégico. El Arquitecto de Estructura puede proceder.",
      "Perfecto. La hoja de ruta está completa con stack tecnológico, fases de desarrollo y consideraciones de escalabilidad.",
      "El master plan está listo. Incluye todas las recomendaciones técnicas y la planificación estratégica necesaria.",
    ]
  },
  
  'arquitecto-estructura': {
    greetings: [
      "Soy su Arquitecto de Estructura, especializado en crear andamiajes de proyecto completos y funcionales.",
      "He recibido el Master Plan. Mi función es transformarlo en estructura de proyecto lista para desarrollo.",
      "Procedo a crear el scaffolding completo: estructura de carpetas, archivos base, y documentación técnica inicial.",
    ],
    questionPrompts: [
      "¿Prefiere una estructura monorepo para máxima escalabilidad, o una arquitectura más simple?",
      "¿Su equipo está familiarizado con las mejores prácticas de organización de código que implementaré?",
      "¿Hay convenciones específicas de naming o estructura que prefiera para el proyecto?",
      "¿Necesita documentación técnica detallada, o prefiere un enfoque más pragmático?",
    ],
    transitions: [
      "He completado la estructura del proyecto con andamiaje técnico completo. El especialista en Operations puede finalizar la configuración.",
      "Perfecto. La arquitectura de archivos y carpetas está lista, con toda la documentación base implementada.",
      "La estructura está completa. Incluye scaffolding, documentación técnica y bases para desarrollo eficiente.",
    ]
  },
  
  'project-operations': {
    greetings: [
      "Soy el Project Operations Specialist, responsable de configurar el sistema operativo del proyecto para desarrollo eficiente.",
      "He recibido la estructura completa. Mi función es implementar todos los elementos operativos necesarios.",
      "Procedo a configurar: sistema de tracking, workflows de desarrollo, y documentación operativa completa.",
    ],
    questionPrompts: [
      "¿Prefiere metodología de sprints, kanban, o un enfoque híbrido para la gestión del proyecto?",
      "¿Su equipo necesita procedimientos detallados, o prefiere workflows más ágiles?",
      "¿Qué nivel de documentación operativa considera apropiado para su contexto?",
      "¿Hay herramientas específicas de gestión o tracking que prefiera integrar?",
    ],
    completions: [
      "He completado la configuración del sistema operativo del proyecto. Todo está listo para iniciar el desarrollo.",
      "Perfecto. El proyecto está completamente estructurado con todos los procedimientos operativos implementados.",
      "Configuración finalizada. Su proyecto cuenta ahora con sistema completo de tracking, workflows y documentación operativa.",
    ]
  }
};

// Context keywords for intelligent responses - updated for professional approach
const CONTEXT_KEYWORDS = {
  mvp: ['mínimo', 'viable', 'básico', 'empezar', 'inicial', 'mvp'],
  scaling: ['escalabilidad', 'crecimiento', 'usuarios', 'performance', 'volumen'],
  security: ['seguridad', 'protección', 'privacidad', 'datos', 'compliance'],
  budget: ['presupuesto', 'costos', 'inversión', 'recursos', 'financiero'],
  team: ['equipo', 'desarrolladores', 'recursos humanos', 'colaboración'],
  timeline: ['tiempo', 'cronograma', 'plazos', 'entrega', 'fases'],
  technical: ['técnico', 'tecnología', 'arquitectura', 'implementación', 'desarrollo'],
  business: ['negocio', 'comercial', 'mercado', 'usuarios', 'valor']
};

// File generation triggers based on conversation context - updated for professional agents
const FILE_GENERATION_TRIGGERS = {
  'consultor-virtual': {
    'conversación completada': ['conversation-summary.md', 'project-vision.md', 'initial-requirements.md'],
    'usuarios identificados': ['user-personas.md', 'stakeholder-analysis.md'],
    'problema definido': ['problem-statement.md', 'business-case.md']
  },
  'business-analyst': {
    'análisis completado': ['01_case_overview.md', '02_logic_breakdown.md', '03_meta_outline.md'],
    'entidades identificadas': ['entity-relationship-diagram.md', 'business-rules.md'],
    'lógica estructurada': ['crud-operations-matrix.md', 'business-process-map.md']
  },
  'arquitecto-senior': {
    'masterplan creado': ['masterplan.md', 'technical-roadmap.md', 'architecture-decisions.md'],
    'stack recomendado': ['technology-stack.md', 'scalability-plan.md'],
    'fases definidas': ['development-phases.md', 'risk-assessment.md']
  },
  'arquitecto-estructura': {
    'estructura creada': ['project-structure.md', 'scaffolding-guide.md', 'development-setup.md'],
    'andamiaje listo': ['folder-structure.md', 'coding-standards.md'],
    'documentación base': ['technical-foundation.md', 'development-guidelines.md']
  },
  'project-operations': {
    'sistema configurado': ['BACKLOG.md', 'STATUS_LOG.md', 'project-procedures.md'],
    'workflows definidos': ['development-workflow.md', 'quality-gates.md'],
    'proyecto listo': ['operational-manual.md', 'project-completion-report.md']
  }
};

export class MockAgentSystem {
  private currentContext: Map<string, any> = new Map();
  private conversationHistory: ChatMessage[] = [];
  private fileGenerationQueue: FileGeneration[] = [];

  constructor() {
    this.initializeContext();
  }

  private initializeContext() {
    this.currentContext.set('userPreferences', {});
    this.currentContext.set('projectType', 'unknown');
    this.currentContext.set('complexity', 'medium');
    this.currentContext.set('currentPhase', 1);
  }

  // Analyze user message for context and intent
  private analyzeMessage(message: string): {
    intent: string;
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'confused';
    complexity: 'simple' | 'medium' | 'complex';
  } {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(' ');
    
    // Detect keywords
    const keywords: string[] = [];
    Object.entries(CONTEXT_KEYWORDS).forEach(([category, categoryWords]) => {
      if (categoryWords.some(word => lowerMessage.includes(word))) {
        keywords.push(category);
      }
    });

    // Detect intent
    let intent = 'general';
    if (lowerMessage.includes('?')) intent = 'question';
    if (lowerMessage.includes('no sé') || lowerMessage.includes('no estoy seguro')) intent = 'confused';
    if (lowerMessage.includes('perfecto') || lowerMessage.includes('genial')) intent = 'agreement';
    if (lowerMessage.includes('problema') || lowerMessage.includes('dificultad')) intent = 'concern';

    // Detect sentiment
    let sentiment: 'positive' | 'neutral' | 'confused' = 'neutral';
    const positiveWords = ['genial', 'perfecto', 'excelente', 'me gusta', 'buena idea'];
    const confusedWords = ['no sé', 'no estoy seguro', 'no entiendo', 'ayuda', 'ejemplo'];
    
    if (positiveWords.some(word => lowerMessage.includes(word))) sentiment = 'positive';
    else if (confusedWords.some(word => lowerMessage.includes(word))) sentiment = 'confused';

    // Detect complexity
    const complexity: 'simple' | 'medium' | 'complex' = 
      words.length > 50 ? 'complex' :
      words.length > 20 ? 'medium' : 'simple';

    return { intent, keywords, sentiment, complexity };
  }

  // Generate contextual response based on agent and analysis
  generateAgentResponse(
    agent: Agent, 
    userMessage: string, 
    session: ChatSession
  ): {
    response: string;
    shouldTransition: boolean;
    filesToGenerate: FileGeneration[];
    nextAgent?: Agent;
  } {
    const analysis = this.analyzeMessage(userMessage);
    const agentPatterns = CONVERSATION_PATTERNS[agent.id as keyof typeof CONVERSATION_PATTERNS];
    
    // Update context
    this.currentContext.set('lastUserMessage', userMessage);
    this.currentContext.set('currentAgent', agent.id);
    this.currentContext.set('messageCount', session.messages.length);
    
    // Determine if this is first interaction with agent
    const isFirstInteraction = !this.conversationHistory.some(m => m.agentId === agent.id);
    
    let response = '';
    let shouldTransition = false;
    let filesToGenerate: FileGeneration[] = [];
    let nextAgent: Agent | undefined;

    // Generate response based on conversation flow
    if (isFirstInteraction) {
      // First interaction - use greeting
      response = this.selectFromArray(agentPatterns.greetings);
    } else {
      // Ongoing conversation
      const messageCount = session.messages.filter(m => m.agentId === agent.id).length;
      
      if (analysis.sentiment === 'confused') {
        response = this.generateHelpfulResponse(agent, userMessage);
      } else if (messageCount >= 3 && analysis.intent === 'agreement') {
        // User has provided enough information, ready to transition
        const transitionsArray = (agentPatterns as any).transitions || (agentPatterns as any).completions || agentPatterns.questionPrompts;
        response = this.selectFromArray(transitionsArray);
        shouldTransition = true;
        nextAgent = this.getNextAgent(agent);
        filesToGenerate = this.generateFilesForPhase(agent, analysis);
      } else {
        // Continue conversation with questions
        response = this.selectFromArray(agentPatterns.questionPrompts);
      }
    }

    // Add contextual enhancement to response
    response = this.enhanceResponseWithContext(response, analysis, agent);
    
    // Store in conversation history
    this.conversationHistory.push({
      id: `response-${Date.now()}`,
      content: response,
      type: 'agent',
      agentId: agent.id,
      timestamp: new Date()
    });

    return {
      response,
      shouldTransition,
      filesToGenerate,
      nextAgent
    };
  }

  // Enhanced response with context awareness
  private enhanceResponseWithContext(response: string, analysis: any, agent: Agent): string {
    let enhanced = response;

    // Add contextual insights based on keywords
    if (analysis.keywords.includes('mvp') && agent.id === 'peter') {
      enhanced += "\n\nPor cierto, me encanta que pienses en MVP - empezar simple es siempre la jugada inteligente.";
    }
    
    if (analysis.keywords.includes('budget') && agent.id === 'toni') {
      enhanced += "\n\nVeo que el presupuesto es importante. No te preocupes, conozco opciones que no van a quebrar el cochinito. 💰";
    }
    
    if (analysis.keywords.includes('security') && agent.id === 'toni') {
      enhanced += "\n\nExcelente que pienses en seguridad desde el inicio. Eso habla bien de tu mentalidad profesional.";
    }

    // Add personality flourishes
    if (analysis.sentiment === 'positive') {
      const flourishes = [
        "\n\n¡Me gusta tu actitud! 🎯",
        "\n\n¡Así se habla! 🚀",
        "\n\nVeo que estamos en la misma sintonía. 👌"
      ];
      enhanced += this.selectFromArray(flourishes);
    }

    return enhanced;
  }

  // Generate helpful response for confused users - updated for professional agents
  private generateHelpfulResponse(agent: Agent, userMessage: string): string {
    const helpResponses = {
      'consultor-virtual': [
        "Comprendo. Vayamos paso a paso. Empecemos con lo fundamental: ¿qué problema específico observa en su entorno que una aplicación podría resolver?",
        "Perfecto, la claridad es importante. ¿Puede describir una situación concreta donde esta aplicación sería útil?",
        "Entiendo. ¿Prefiere que le haga preguntas más específicas, o le muestro algunos ejemplos de casos similares?"
      ],
      'business-analyst': [
        "Comprendo la complejidad. Trabajemos con la información disponible. ¿Puede identificar las entidades principales de su sistema?",
        "Entiendo. Procedamos con un enfoque más estructurado. ¿Qué elementos interactúan en su aplicación?",
        "Perfecto. ¿Qué tal si empezamos identificando los usuarios y las acciones que realizarán?"
      ],
      'arquitecto-senior': [
        "Comprendo. Las decisiones técnicas requieren análisis cuidadoso. ¿Su prioridad es rapidez de desarrollo o robustez a largo plazo?",
        "Entiendo. ¿Prefiere que le recomiende el stack más apropiado basado en las mejores prácticas actuales?",
        "Perfecto. Procedamos con recomendaciones basadas en arquitecturas probadas para casos similares."
      ],
      'arquitecto-estructura': [
        "Comprendo. La estructura es fundamental. ¿Prefiere un enfoque monorepo para máxima escalabilidad, o algo más simple?",
        "Entiendo. ¿Su equipo tiene experiencia con estructuras de proyecto específicas que debiera considerar?",
        "Perfecto. Procederé con las mejores prácticas de organización de código para su contexto."
      ],
      'project-operations': [
        "Comprendo. Los aspectos operativos son críticos. ¿Su equipo prefiere metodología ágil, sprints, o un enfoque híbrido?",
        "Entiendo. ¿Qué nivel de documentación operativa considera apropiado para su organización?",
        "Perfecto. Implementaré el sistema operativo más adecuado basado en mejores prácticas probadas."
      ]
    };

    const responses = helpResponses[agent.id as keyof typeof helpResponses];
    return this.selectFromArray(responses);
  }

  // Get next agent in sequence - updated for professional agents
  private getNextAgent(currentAgent: Agent): Agent | undefined {
    const agentOrder = ['consultor-virtual', 'business-analyst', 'arquitecto-senior', 'arquitecto-estructura', 'project-operations'];
    const currentIndex = agentOrder.indexOf(currentAgent.id);
    if (currentIndex === -1 || currentIndex === agentOrder.length - 1) return undefined;
    return agents.find(agent => agent.id === agentOrder[currentIndex + 1]);
  }

  // Generate files for current phase
  public generateFilesForPhase(agent: Agent, analysis: any): FileGeneration[] {
    const triggers = FILE_GENERATION_TRIGGERS[agent.id as keyof typeof FILE_GENERATION_TRIGGERS];
    const files: FileGeneration[] = [];
    
    // Determine which files to generate based on conversation context
    const triggerKey = this.determineTriggerKey(agent, analysis);
    const fileNames = (triggers as any)[triggerKey] || [];

    fileNames.forEach((fileName: string, index: number) => {
      files.push({
        id: `file-${agent.id}-${Date.now()}-${index}`,
        fileName,
        type: this.getFileType(fileName),
        progress: 0,
        status: 'pending',
        agentId: agent.id
      });
    });

    return files;
  }

  // Determine which trigger key to use for file generation
  private determineTriggerKey(agent: Agent, analysis: any): string {
    const triggers = Object.keys(FILE_GENERATION_TRIGGERS[agent.id as keyof typeof FILE_GENERATION_TRIGGERS]);
    
    // Simple logic to pick trigger based on conversation progress
    const messageCount = this.conversationHistory.filter(m => m.agentId === agent.id).length;
    const triggerIndex = Math.min(messageCount - 1, triggers.length - 1);
    
    return triggers[triggerIndex] || triggers[0];
  }

  // Get file type from filename
  private getFileType(fileName: string): string {
    if (fileName.endsWith('.md')) return 'Documentation';
    if (fileName.endsWith('.json')) return 'Configuration';
    if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) return 'Configuration';
    if (fileName.endsWith('.sql')) return 'Database';
    if (fileName.includes('api')) return 'API';
    if (fileName.includes('user')) return 'Requirements';
    if (fileName.includes('research')) return 'Research';
    return 'Documentation';
  }

  // Utility to select random item from array
  private selectFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Simulate file generation progress
  simulateFileGeneration(fileId: string, callback: (progress: number, status: string) => void): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10; // Random progress between 10-30%
      
      if (progress >= 100) {
        progress = 100;
        callback(100, 'completed');
        clearInterval(interval);
      } else {
        callback(Math.min(progress, 100), 'generating');
      }
    }, 1500); // Update every 1.5 seconds
  }

  // Get conversation summary for context handoff
  getConversationSummary(agentId: string): string {
    const agentMessages = this.conversationHistory.filter(m => m.agentId === agentId);
    if (agentMessages.length === 0) return '';

    const summaries = {
      'consultor-virtual': "Análisis conversacional completado con visión del proyecto clarificada y documentada.",
      'business-analyst': "Lógica de negocio descompuesta en documentos estructurados y análisis de entidades completo.",
      'arquitecto-senior': "Master plan técnico creado con roadmap estratégico y recomendaciones de arquitectura.",
      'arquitecto-estructura': "Estructura de proyecto implementada con andamiaje técnico y documentación base.",
      'project-operations': "Sistema operativo del proyecto configurado con workflows y procedimientos completos."
    };

    return summaries[agentId as keyof typeof summaries] || "Fase completada exitosamente.";
  }

  // Get agent introduction message
  getAgentIntroduction(agent: Agent, currentStep: number): string {
    const agentPatterns = CONVERSATION_PATTERNS[agent.id as keyof typeof CONVERSATION_PATTERNS];
    return this.selectFromArray(agentPatterns.greetings);
  }

  // Generate response (wrapper for generateAgentResponse)
  async generateResponse(
    agent: Agent, 
    userMessage: string, 
    currentStep: number, 
    messages: ChatMessage[]
  ): Promise<string> {
    const session: ChatSession = {
      id: 'temp',
      projectId: 'temp',
      currentAgent: agent,
      messages,
      fileGenerations: [],
      projectProgress: {
        currentPhase: currentStep,
        completedPhases: [],
        totalPhases: 5,
        phaseNames: ['Concepto', 'Investigación', 'Arquitectura', 'Documentación', 'Deploy'],
        progress: (currentStep / 5) * 100
      },
      isActive: true
    };
    
    const result = this.generateAgentResponse(agent, userMessage, session);
    return result.response;
  }

  // Generate mock files for agent
  generateMockFiles(agent: Agent, currentStep: number): FileGeneration[] {
    return this.generateFilesForPhase(agent, { keywords: ['mock'] });
  }

  // Reset system for new conversation
  reset(): void {
    this.currentContext.clear();
    this.conversationHistory = [];
    this.fileGenerationQueue = [];
    this.initializeContext();
  }
}

// Export singleton instance
export const mockAgentSystem = new MockAgentSystem();

// Utility functions for external use
export const generateMockResponse = (agent: Agent, userMessage: string, session: ChatSession) => {
  return mockAgentSystem.generateAgentResponse(agent, userMessage, session);
};

export const simulateTypingDelay = (messageLength: number): Promise<void> => {
  const baseDelay = 1000;
  const wordsPerMinute = 180;
  const characters = messageLength;
  const estimatedTime = (characters / 5) * (60000 / wordsPerMinute);
  const finalDelay = Math.max(baseDelay, Math.min(estimatedTime, 4000));
  
  return new Promise(resolve => setTimeout(resolve, finalDelay));
};

export const generateContextualFiles = (agent: Agent, context: string[]): FileGeneration[] => {
  return mockAgentSystem.generateFilesForPhase(agent, { keywords: context });
};