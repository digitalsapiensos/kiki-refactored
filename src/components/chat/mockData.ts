/**
 * Mock data for KIKI Chat System Testing
 * Realistic data for the 5-phase wizard with neobrutalism styling
 */

import { Agent, ChatMessage, FileGeneration, ProjectProgress, ChatSession, AgentTransition } from './types';

// Professional Agent definitions based on the real System Prompts from 01-inicio-proyecto
export const agents: Agent[] = [
  {
    id: 'consultor-virtual',
    name: 'Consultor Virtual',
    role: 'Business Consultant & Requirements Analyst',
    phase: 1,
    description: 'Soy un consultor de negocio experto con amplia experiencia en convertir ideas iniciales en proyectos estructurados. Mi especialidad es extraer y clarificar la visión del usuario mediante conversación estructurada.',
    color: 'chart-1', // Blue
    personality: 'Professional, warm, and systematic approach to understanding business requirements',
    expertise: ['Business Consultation', 'Requirements Analysis', 'Problem Definition', 'User Story Creation', 'MVP Planning']
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    role: 'Business Logic Decomposer',
    phase: 2,
    description: 'Especialista en transformar conversaciones de negocio en documentos estructurados y analysis-ready. Mi función es descomponer la lógica empresarial sin tocar aspectos de implementación física.',
    color: 'chart-2', // Green
    personality: 'Systematic, detail-oriented professional focused on business logic clarity',
    expertise: ['Business Logic Analysis', 'Entity Relationship Modeling', 'Requirements Documentation', 'CRUD Operations Analysis', 'Business Process Mapping']
  },
  {
    id: 'arquitecto-senior',
    name: 'Arquitecto Senior',
    role: 'Technical Architecture & Strategic Planning',
    phase: 3,
    description: 'Arquitecto de software senior y planificador estratégico especializado en crear master plans técnicos completos. Mi experiencia abarca desde la selección de stack hasta la planificación de escalabilidad.',
    color: 'chart-3', // Orange
    personality: 'Senior-level technical expertise with strategic business understanding',
    expertise: ['Software Architecture', 'Technology Stack Selection', 'Scalability Planning', 'Technical Risk Assessment', 'Development Roadmapping']
  },
  {
    id: 'arquitecto-estructura',
    name: 'Arquitecto de Estructura',
    role: 'Project Structure & Technical Scaffolding',
    phase: 4,
    description: 'Arquitecto de software senior especializado en crear estructuras de proyecto completas y andamiajes técnicos. Transformo master plans en estructuras de proyecto funcionales y listas para desarrollo.',
    color: 'chart-4', // Purple
    personality: 'Methodical architect focused on clean, maintainable project structures',
    expertise: ['Project Architecture', 'Code Organization', 'Development Scaffolding', 'Best Practices Implementation', 'Technical Documentation']
  },
  {
    id: 'project-operations',
    name: 'Project Operations Specialist',
    role: 'Project Operations & System Configuration',
    phase: 5,
    description: 'Especialista en configurar sistemas operativos de proyectos de desarrollo. Mi misión es completar la configuración con todos los elementos operativos necesarios para un desarrollo eficiente.',
    color: 'chart-5', // Red
    personality: 'Operations-focused professional ensuring project delivery readiness',
    expertise: ['Project Operations', 'Development Workflows', 'Quality Assurance Setup', 'Documentation Systems', 'Team Coordination']
  }
];

// Professional sample chat messages demonstrating the correct agent workflow
export const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Bienvenido al sistema de consultoría para desarrollo de proyectos. Soy su Consultor Virtual especializado en el primer paso de convertir ideas en proyectos estructurados. Mi trabajo es entender profundamente su visión a través de una conversación estructurada.\n\nPara comenzar: ¿puede contarme con sus palabras cuál es la idea general de la aplicación que quiere construir?',
    type: 'agent',
    agentId: 'consultor-virtual',
    timestamp: new Date('2025-01-28T10:00:00')
  },
  {
    id: '2',
    content: 'Quiero crear una app para conectar a estudiantes con mentores en tecnología',
    type: 'user',
    timestamp: new Date('2025-01-28T10:02:15')
  },
  {
    id: '3',
    content: 'Entiendo que quiere crear una aplicación que conecte estudiantes con mentores en tecnología. ¿Es correcto? ¿Hay aspectos específicos de esta definición que ajustaría o ampliaría?',
    type: 'agent',
    agentId: 'consultor-virtual',
    timestamp: new Date('2025-01-28T10:02:45')
  },
  {
    id: '4',
    content: 'Principalmente estudiantes universitarios que están empezando en programación y se sienten overwhelmed',
    type: 'user',
    timestamp: new Date('2025-01-28T10:04:12')
  },
  {
    id: '5',
    content: 'Excelente contexto. Estudiantes universitarios principiantes representan un segmento claramente definido. Ahora, ¿cuáles considera que serían las 3-5 funcionalidades más importantes que debería tener su aplicación? Piense en qué herramientas necesitarían tanto estudiantes como mentores.',
    type: 'agent',
    agentId: 'consultor-virtual',
    timestamp: new Date('2025-01-28T10:04:58')
  },
  {
    id: '6',
    content: 'Creo que necesitaría perfiles de mentores, un sistema de reservas para sesiones, comunicación directa y quizá un sistema de valoraciones',
    type: 'user',
    timestamp: new Date('2025-01-28T10:06:23')
  },
  {
    id: '7',
    content: 'Perfecto enfoque. Ha identificado las funcionalidades core esenciales: perfiles, reservas, comunicación y valoraciones. Esto constituye una base sólida para el MVP. Procederé a generar el conversation_summary.md con toda nuestra conversación estructurada.',
    type: 'agent',
    agentId: 'consultor-virtual',
    timestamp: new Date('2025-01-28T10:07:02')
  },
  {
    id: '8',
    content: 'He completado la extracción de requisitos mediante conversación estructurada. El documento conversation_summary.md ha sido generado exitosamente.\n\nAhora transfiero su caso a nuestro Business Analyst, quien descompondrá la información en documentos estructurados de lógica de negocio: case_overview.md, logic_breakdown.md y meta_outline.md.',
    type: 'agent',
    agentId: 'business-analyst',
    timestamp: new Date('2025-01-28T10:08:15')
  }
];

// Professional conversation flows for each phase
export const enhancedConversationFlows = {
  mentorApp: {
    phase1: [
      {
        id: 'mentor-p1-1',
        content: 'Bienvenido al sistema de consultoría para desarrollo de proyectos. Soy su Consultor Virtual especializado en convertir ideas iniciales en proyectos estructurados mediante conversación guiada. Para comenzar: ¿puede contarme cuál es la idea general de la aplicación que quiere construir?',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:00:00')
      },
      {
        id: 'mentor-p1-2',
        content: 'Quiero crear una app para conectar estudiantes con mentores en tecnología',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T09:01:30')
      },
      {
        id: 'mentor-p1-3',
        content: 'Entiendo que quiere crear una aplicación que conecte estudiantes con mentores en tecnología. Es un concepto sólido. Para desarrollar los requisitos: ¿quiénes serán los usuarios principales de su aplicación? Describa sus características y necesidades específicas.',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:02:00')
      },
      {
        id: 'mentor-p1-4',
        content: 'Principalmente estudiantes universitarios de primeros años que están empezando en programación y no saben por dónde seguir',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T09:03:45')
      },
      {
        id: 'mentor-p1-5',
        content: 'Perfecto segmento objetivo. Estudiantes universitarios principiantes representan un mercado claramente definido. Ahora, ¿cuáles considera que serían las 3-5 funcionalidades más importantes que debería tener su aplicación? Piense en qué herramientas necesitarían tanto estudiantes como mentores.',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:04:20')
      },
      {
        id: 'mentor-p1-6',
        content: 'Creo que empezaría con perfiles simples de mentores y un sistema de booking para sesiones 1-a-1',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T09:06:10')
      },
      {
        id: 'mentor-p1-7',
        content: 'Excelente enfoque. Ha identificado las funcionalidades core esenciales: perfiles de mentores y sistema de reservas. Esto constituye una base sólida para el MVP. Procederé a generar el conversation_summary.md con toda nuestra conversación estructurada y transferir a nuestro Business Analyst para la siguiente fase.',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:07:30')
      }
    ],
    
    phase2: [
      {
        id: 'mentor-p2-1',
        content: 'Soy el Business Analyst, segundo especialista en la cadena de desarrollo. He recibido su conversation_summary.md del Consultor Virtual. Mi función es descomponer su información en documentos estructurados de lógica de negocio: case_overview.md, logic_breakdown.md y meta_outline.md.',
        type: 'agent' as const,
        agentId: 'business-analyst',
        timestamp: new Date('2025-01-28T10:30:00')
      },
      {
        id: 'mentor-p2-2',
        content: 'Perfecto. ¿Cómo procede con el análisis de la información que recibió del consultor?',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T10:31:45')
      },
      {
        id: 'mentor-p2-3',
        content: 'Basándome en su conversación, identifico estas entidades principales: Estudiantes (usuarios), Mentores (proveedores), Sesiones (interacciones), Perfiles (información), Sistema de Reservas (operaciones). ¿Está de acuerdo con esta clasificación de entidades?',
        type: 'agent' as const,
        agentId: 'business-analyst',
        timestamp: new Date('2025-01-28T10:32:30')
      },
      {
        id: 'mentor-p2-4',
        content: 'Sí, esas entidades cubren los elementos principales. ¿Hay relaciones entre ellas que deba considerar?',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T10:34:20')
      },
      {
        id: 'mentor-p2-5',
        content: 'Correcto. Las relaciones clave son: Estudiante-Mentor (many-to-many), Sesión-Estudiante (many-to-one), Sesión-Mentor (many-to-one), Perfil-Usuario (one-to-one). Para las operaciones CRUD, ¿qué restricciones de seguridad considera críticas?',
        type: 'agent' as const,
        agentId: 'business-analyst',
        timestamp: new Date('2025-01-28T10:35:10')
      },
      {
        id: 'mentor-p2-6',
        content: 'Principalmente autenticación segura, validación de perfiles de mentores, y protección de datos personales de estudiantes.',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T10:37:30')
      },
      {
        id: 'mentor-p2-7',
        content: 'Perfecto. He completado la descomposición de la lógica de negocio. Los tres documentos están listos: case_overview.md, logic_breakdown.md y meta_outline.md. Transfiero al Arquitecto Senior para el master plan técnico.',
        type: 'agent' as const,
        agentId: 'business-analyst',
        timestamp: new Date('2025-01-28T10:38:45')
      }
    ],

    phase3: [
      {
        id: 'mentor-p3-1',
        content: 'Soy su Arquitecto Senior y Planificador Estratégico, tercer especialista en la cadena. He recibido los documentos de lógica de negocio del Business Analyst. Mi función es generar un Master Plan técnico completo con roadmap estratégico y recomendaciones de arquitectura.',
        type: 'agent' as const,
        agentId: 'arquitecto-senior',
        timestamp: new Date('2025-01-28T11:15:00')
      },
      {
        id: 'mentor-p3-2',
        content: 'Perfecto. ¿Su prioridad es un desarrollo rápido para validación, o una arquitectura enterprise-ready desde el inicio?',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T11:17:20')
      },
      {
        id: 'mentor-p3-3',
        content: 'Recomiendo enfoque balanceado: arquitectura escalable con tecnologías que permitan iteración rápida. Stack sugerido: Next.js para frontend (React, SSR, optimización automática), Supabase para backend (PostgreSQL, autenticación, APIs), implementación en fases para validación progresiva.',
        type: 'agent' as const,
        agentId: 'arquitecto-senior',
        timestamp: new Date('2025-01-28T11:18:00')
      },
      {
        id: 'mentor-p3-4',
        content: 'Suena bien. ¿Y para funcionalidades específicas como sistema de reservas y comunicación?',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T11:20:15')
      },
      {
        id: 'mentor-p3-5',
        content: 'Para reservas: integración con Cal.com (calendario profesional) o implementación custom con Supabase. Para comunicación: Daily.co para videollamadas empresariales, Socket.io para chat en tiempo real. Enfoque de microservicios para escalabilidad futura.',
        type: 'agent' as const,
        agentId: 'arquitecto-senior',
        timestamp: new Date('2025-01-28T11:21:30')
      },
      {
        id: 'mentor-p3-6',
        content: 'Excelente. ¿Qué consideraciones de escalabilidad debo tener en cuenta desde el inicio?',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T11:23:45')
      },
      {
        id: 'mentor-p3-7',
        content: 'He completado el Master Plan con recomendaciones técnicas completas: arquitectura modular, base de datos optimizada, stack escalable, fases de desarrollo prioritizadas, y consideraciones de seguridad. El Arquitecto de Estructura puede proceder con el scaffolding técnico.',
        type: 'agent' as const,
        agentId: 'arquitecto-senior',
        timestamp: new Date('2025-01-28T11:25:00')
      }
    ]
  },

  ecommerceApp: {
    phase1: [
      {
        id: 'ecom-p1-1',
        content: 'Bienvenido al sistema de consultoría. Soy su Consultor Virtual para el desarrollo de proyectos de comercio electrónico. Mi función es entender profundamente su visión comercial. ¿Puede describir el tipo de productos o servicios que planea comercializar?',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:00:00')
      },
      {
        id: 'ecom-p1-2', 
        content: 'Quiero vender productos artesanales hechos por comunidades indígenas de mi región',
        type: 'user' as const,
        timestamp: new Date('2025-01-28T09:02:30')
      },
      {
        id: 'ecom-p1-3',
        content: 'Excelente propuesta de valor. Los productos artesanales con impacto social representan un segmento de mercado sólido. ¿Ya tiene establecidas las relaciones con estas comunidades productoras, o esto forma parte del desarrollo del proyecto?',
        type: 'agent' as const,
        agentId: 'consultor-virtual',
        timestamp: new Date('2025-01-28T09:03:15')
      }
    ]
  }
};

// Professional conversation data for different phases
export const phaseConversations = {
  phase1: [
    {
      id: 'p1-1',
      content: 'Bienvenido al sistema de consultoría para desarrollo de proyectos. Soy su Consultor Virtual especializado en convertir ideas iniciales en proyectos estructurados mediante conversación guiada.',
      type: 'agent' as const,
      agentId: 'consultor-virtual',
      timestamp: new Date('2025-01-28T09:00:00')
    },
    {
      id: 'p1-2', 
      content: 'Mi especialidad es extraer y clarificar la visión del usuario mediante conversación estructurada para crear un resumen completo que alimentará el resto del proceso.',
      type: 'agent' as const,
      agentId: 'consultor-virtual',
      timestamp: new Date('2025-01-28T09:00:30')
    }
  ],
  phase2: [
    {
      id: 'p2-1',
      content: 'Soy el Business Analyst, segundo especialista en la cadena de desarrollo. Mi función es descomponer la información del Consultor Virtual en documentos estructurados de lógica de negocio.',
      type: 'agent' as const,
      agentId: 'business-analyst', 
      timestamp: new Date('2025-01-28T10:30:00')
    },
    {
      id: 'p2-2',
      content: 'Transformo la conversación en tres artefactos estructurados: case_overview.md, logic_breakdown.md y meta_outline.md, sin tocar aspectos de implementación técnica.',
      type: 'agent' as const,
      agentId: 'business-analyst',
      timestamp: new Date('2025-01-28T10:30:45')
    }
  ],
  phase3: [
    {
      id: 'p3-1',
      content: 'Soy su Arquitecto Senior y Planificador Estratégico. He recibido los documentos de lógica de negocio. Ahora generaré un Master Plan técnico completo con roadmap estratégico.',
      type: 'agent' as const,
      agentId: 'arquitecto-senior',
      timestamp: new Date('2025-01-28T11:15:00')
    },
    {
      id: 'p3-2',
      content: 'Mi experiencia abarca desde la selección de stack tecnológico hasta la planificación de escalabilidad. Crearé recomendaciones técnicas basadas en mejores prácticas probadas.',
      type: 'agent' as const,
      agentId: 'arquitecto-senior',
      timestamp: new Date('2025-01-28T11:15:30')
    }
  ],
  phase4: [
    {
      id: 'p4-1',
      content: 'Soy el Arquitecto de Estructura, especializado en crear scaffolding de proyecto completo y funcional. He recibido el Master Plan del Arquitecto Senior.',
      type: 'agent' as const,
      agentId: 'arquitecto-estructura',
      timestamp: new Date('2025-01-28T12:00:00')
    },
    {
      id: 'p4-2',
      content: 'Transformaré el master plan en estructura de proyecto lista para desarrollo: carpetas, archivos base, y documentación técnica inicial.',
      type: 'agent' as const,
      agentId: 'arquitecto-estructura',
      timestamp: new Date('2025-01-28T12:00:25')
    }
  ],
  phase5: [
    {
      id: 'p5-1',
      content: 'Soy el Project Operations Specialist, responsable de configurar el sistema operativo del proyecto para desarrollo eficiente.',
      type: 'agent' as const,
      agentId: 'project-operations',
      timestamp: new Date('2025-01-28T12:45:00')
    },
    {
      id: 'p5-2',
      content: 'Implementaré todos los elementos operativos necesarios: sistema de tracking, workflows de desarrollo, y documentación operativa completa.',
      type: 'agent' as const,
      agentId: 'project-operations', 
      timestamp: new Date('2025-01-28T12:45:30')
    }
  ]
};

// Enhanced sample file generations with realistic progress and variety
export const sampleFileGenerations: FileGeneration[] = [
  {
    id: 'file-1',
    fileName: 'project-concept.md',
    type: 'Documentation',
    progress: 100,
    status: 'completed',
    agentId: 'consultor-virtual'
  },
  {
    id: 'file-2',
    fileName: 'user-stories.md',
    type: 'Requirements',
    progress: 85,
    status: 'generating',
    agentId: 'consultor-virtual'
  },
  {
    id: 'file-3',
    fileName: 'mvp-features.json',
    type: 'Configuration',
    progress: 100,
    status: 'completed',
    agentId: 'consultor-virtual'
  },
  {
    id: 'file-4',
    fileName: 'competitor-analysis.md',
    type: 'Research',
    progress: 15,
    status: 'generating',
    agentId: 'business-analyst'
  },
  {
    id: 'file-5',
    fileName: 'market-validation.md',
    type: 'Research',
    progress: 0,
    status: 'pending',
    agentId: 'business-analyst'
  },
  {
    id: 'file-6',
    fileName: 'tech-architecture.md',
    type: 'Architecture',
    progress: 0,
    status: 'pending',
    agentId: 'arquitecto-senior'
  },
  {
    id: 'file-7',
    fileName: 'database-schema.sql',
    type: 'Database',
    progress: 0,
    status: 'pending', 
    agentId: 'arquitecto-senior'
  },
  {
    id: 'file-8',
    fileName: 'api-endpoints.yaml',
    type: 'API',
    progress: 0,
    status: 'pending',
    agentId: 'arquitecto-senior'
  },
  {
    id: 'file-9',
    fileName: 'product-requirements.md',
    type: 'Documentation',
    progress: 0,
    status: 'pending',
    agentId: 'arquitecto-estructura'
  },
  {
    id: 'file-10',
    fileName: 'deployment-guide.md',
    type: 'DevOps',
    progress: 0,
    status: 'pending',
    agentId: 'project-operations'
  },
  {
    id: 'file-11',
    fileName: 'docker-compose.yml',
    type: 'Configuration',
    progress: 0,
    status: 'pending',
    agentId: 'project-operations'
  }
];

// Realistic file generation simulation data
export const fileGenerationStages = {
  'project-concept.md': [
    { stage: 'Analyzing requirements', progress: 20, duration: 2000 },
    { stage: 'Structuring concept', progress: 45, duration: 1500 },
    { stage: 'Writing introduction', progress: 65, duration: 2500 },
    { stage: 'Adding examples', progress: 85, duration: 1800 },
    { stage: 'Final review', progress: 100, duration: 1000 }
  ],
  'user-stories.md': [
    { stage: 'Identifying user personas', progress: 25, duration: 3000 },
    { stage: 'Mapping user journeys', progress: 50, duration: 2200 },
    { stage: 'Writing story templates', progress: 75, duration: 2800 },
    { stage: 'Adding acceptance criteria', progress: 100, duration: 1500 }
  ],
  'competitor-analysis.md': [
    { stage: 'Searching similar apps', progress: 15, duration: 4000 },
    { stage: 'Analyzing features', progress: 35, duration: 3500 },
    { stage: 'Identifying opportunities', progress: 60, duration: 3000 },
    { stage: 'Creating comparison matrix', progress: 85, duration: 2000 },
    { stage: 'Writing recommendations', progress: 100, duration: 1500 }
  ]
};

// Enhanced sample project progress with detailed phase information
export const sampleProjectProgress: ProjectProgress = {
  currentPhase: 1,
  completedPhases: [],
  totalPhases: 5,
  phaseNames: [
    'Conceptualización',
    'Investigación & Validación', 
    'Planificación Técnica',
    'Generación de Documentos',
    'Setup & Export'
  ],
  progress: 25 // 25% overall progress - more realistic
};

// Progress simulation for different phases
export const phaseProgressStages = {
  phase1: [
    { progress: 10, message: 'Definiendo problema principal...', duration: 2000 },
    { progress: 25, message: 'Identificando usuarios objetivo...', duration: 3000 },
    { progress: 50, message: 'Creando MVP concept...', duration: 2500 },
    { progress: 75, message: 'Refinando características...', duration: 2000 },
    { progress: 100, message: '¡Fase de conceptualización completada!', duration: 1000 }
  ],
  phase2: [
    { progress: 15, message: 'Buscando competidores...', duration: 4000 },
    { progress: 35, message: 'Analizando mercado objetivo...', duration: 3500 },
    { progress: 55, message: 'Identificando oportunidades...', duration: 3000 },
    { progress: 80, message: 'Validating approach...', duration: 2500 },
    { progress: 100, message: '¡Investigación completada!', duration: 1000 }
  ],
  phase3: [
    { progress: 20, message: 'Evaluating tech stack options...', duration: 3000 },
    { progress: 40, message: 'Designing system architecture...', duration: 3500 },
    { progress: 65, message: 'Planning database structure...', duration: 2800 },
    { progress: 85, message: 'Documenting technical decisions...', duration: 2000 },
    { progress: 100, message: '¡Planificación técnica lista!', duration: 1000 }
  ],
  phase4: [
    { progress: 25, message: 'Creating technical specifications...', duration: 3200 },
    { progress: 50, message: 'Writing user documentation...', duration: 2800 },
    { progress: 75, message: 'Generating API documentation...', duration: 2500 },
    { progress: 100, message: '¡Documentación completada!', duration: 1000 }
  ],
  phase5: [
    { progress: 30, message: 'Setting up deployment pipeline...', duration: 3500 },
    { progress: 60, message: 'Configuring production environment...', duration: 3000 },
    { progress: 85, message: 'Running final tests...', duration: 2200 },
    { progress: 100, message: '¡Proyecto listo para deploy!', duration: 1500 }
  ]
};

// Enhanced sample chat session with more realistic data
export const sampleChatSession: ChatSession = {
  id: 'session-1',
  projectId: 'project-123',
  currentAgent: agents[0], // Peter
  messages: sampleMessages,
  fileGenerations: sampleFileGenerations,
  projectProgress: sampleProjectProgress,
  isActive: true
};

// Multiple sample sessions for different scenarios
export const sampleSessions = {
  newProject: {
    ...sampleChatSession,
    id: 'session-new',
    messages: phaseConversations.phase1,
    fileGenerations: sampleFileGenerations.slice(0, 2),
    projectProgress: { ...sampleProjectProgress, progress: 10 }
  },
  
  researchPhase: {
    ...sampleChatSession,
    id: 'session-research',
    currentAgent: agents[1], // Sara
    messages: [...phaseConversations.phase1, ...phaseConversations.phase2],
    fileGenerations: sampleFileGenerations.slice(0, 5),
    projectProgress: { ...sampleProjectProgress, currentPhase: 2, progress: 35, completedPhases: [1] }
  },
  
  techPhase: {
    ...sampleChatSession,
    id: 'session-tech',
    currentAgent: agents[2], // Toni
    messages: [...phaseConversations.phase1, ...phaseConversations.phase2, ...phaseConversations.phase3],
    fileGenerations: sampleFileGenerations.slice(0, 8),
    projectProgress: { ...sampleProjectProgress, currentPhase: 3, progress: 60, completedPhases: [1, 2] }
  },
  
  docsPhase: {
    ...sampleChatSession,
    id: 'session-docs',
    currentAgent: agents[3], // Chris
    messages: [...phaseConversations.phase4],
    fileGenerations: sampleFileGenerations.slice(0, 9),
    projectProgress: { ...sampleProjectProgress, currentPhase: 4, progress: 80, completedPhases: [1, 2, 3] }
  },
  
  deployPhase: {
    ...sampleChatSession,
    id: 'session-deploy',
    currentAgent: agents[4], // Quentin
    messages: [...phaseConversations.phase5],
    fileGenerations: sampleFileGenerations,
    projectProgress: { ...sampleProjectProgress, currentPhase: 5, progress: 95, completedPhases: [1, 2, 3, 4] }
  }
};

// Enhanced sample agent transitions with personality
export const sampleAgentTransition: AgentTransition = {
  fromAgent: agents[0], // Peter
  toAgent: agents[1], // Sara
  reason: 'Conceptualization phase completed successfully',
  handoffMessage: 'Conceptualización completada exitosamente. Su visión está claramente definida y documentada. Transferencia al Business Analyst para análisis estructurado de la lógica de negocio.'
};

// Professional agent transitions
export const agentTransitions = {
  consultorToAnalyst: {
    fromAgent: agents[0],
    toAgent: agents[1], 
    reason: 'Conceptualización completada',
    handoffMessage: 'Análisis conversacional completado exitosamente. Su visión está claramente definida y documentada. Transferencia al Business Analyst para descomposición estructurada de la lógica de negocio.'
  },
  
  analystToArquitecto: {
    fromAgent: agents[1],
    toAgent: agents[2],
    reason: 'Análisis de negocio completado',
    handoffMessage: 'Lógica de negocio descompuesta en documentos estructurados. Case overview, logic breakdown y meta outline completados. Transferencia al Arquitecto Senior para master plan técnico.'
  },
  
  arquitectoToEstructura: {
    fromAgent: agents[2],
    toAgent: agents[3],
    reason: 'Master plan técnico completado',
    handoffMessage: 'Master Plan técnico creado con roadmap estratégico y recomendaciones completas. Transferencia al Arquitecto de Estructura para implementación de scaffolding del proyecto.'
  },
  
  estructuraToOperations: {
    fromAgent: agents[3],
    toAgent: agents[4],
    reason: 'Estructura del proyecto completada',
    handoffMessage: 'Estructura del proyecto implementada con andamiaje técnico completo. Transferencia al Project Operations Specialist para configuración del sistema operativo del proyecto.'
  },
  
  operationsToComplete: {
    fromAgent: agents[4],
    toAgent: agents[0], // Back to Consultor for completion
    reason: 'Proyecto completado exitosamente',
    handoffMessage: 'Sistema operativo del proyecto configurado completamente. Todos los procedimientos operativos implementados. Proyecto listo para inicio del desarrollo.'
  }
};

// Enhanced utility function to get agent by ID
export const getAgentById = (id: string): Agent | undefined => {
  return agents.find(agent => agent.id === id);
};

// Get next agent in sequence
export const getNextAgent = (currentAgentId: string): Agent | undefined => {
  const currentIndex = agents.findIndex(agent => agent.id === currentAgentId);
  if (currentIndex === -1 || currentIndex === agents.length - 1) return undefined;
  return agents[currentIndex + 1];
};

// Get previous agent in sequence
export const getPreviousAgent = (currentAgentId: string): Agent | undefined => {
  const currentIndex = agents.findIndex(agent => agent.id === currentAgentId);
  if (currentIndex <= 0) return undefined;
  return agents[currentIndex - 1];
};

// Check if agent transition is valid
export const isValidTransition = (fromAgentId: string, toAgentId: string): boolean => {
  const fromAgent = getAgentById(fromAgentId);
  const toAgent = getAgentById(toAgentId);
  
  if (!fromAgent || !toAgent) return false;
  
  // Sequential transitions are always valid
  if (toAgent.phase === fromAgent.phase + 1) return true;
  
  // Allow skipping phases in some cases
  if (toAgent.phase > fromAgent.phase && toAgent.phase <= 5) return true;
  
  return false;
};

// Utility function to get agent by phase
export const getAgentByPhase = (phase: number): Agent | undefined => {
  return agents.find(agent => agent.phase === phase);
};

// Enhanced utility functions for realistic chat simulation
export const getRandomAgentResponse = (agentId: string, context?: string): string => {
  const responses = {
    'consultor-virtual': [
      'Entiendo. Esa información me permite clarificar mejor los requisitos.',
      'Perfecto. Procedo a estructurar esa información en el análisis.',
      'Excelente contexto. Eso me ayuda a definir el scope del proyecto.',
      'Correcto. Con esos datos puedo generar un resumen más preciso.',
      'Comprendo. Esa perspectiva enriquece considerablemente el análisis.',
      'Muy bien. Procederé a documentar esos aspectos clave.',
    ],
    'business-analyst': [
      'Analizo esa información para identificar las entidades correspondientes.',
      'Interesante. Esos elementos impactan la estructura de datos.',
      'Correcto. Ese aspecto debe reflejarse en la lógica de negocio.',
      'Perfecto. Con esa información puedo estructurar las relaciones.',
      'Comprendo. Eso afecta las operaciones CRUD del sistema.',
      'Excelente. Esos requisitos se incorporarán al analysis.',
    ],
    'arquitecto-senior': [
      'Entiendo. Eso influye en las recomendaciones técnicas del master plan.',
      'Perfecto. Con esa información puedo optimizar la arquitectura.',
      'Correcto. Esos requisitos impactan la selección del stack.',
      'Excelente. Eso me permite ajustar las consideraciones de escalabilidad.',
      'Comprendo. Incorporaré esos aspectos en el roadmap técnico.',
      'Muy bien. Eso clarifica los requerimientos de la solución.',
    ],
    'arquitecto-estructura': [
      'Perfecto. Esa información mejora la organización del proyecto.',
      'Entiendo. Eso impacta la estructura de carpetas y archivos.',
      'Correcto. Incorporaré esos aspectos en el scaffolding.',
      'Excelente. Con eso puedo optimizar la documentación técnica.',
      'Comprendo. Esos elementos se reflejarán en la arquitectura base.',
      'Muy bien. Eso enriquece las mejores prácticas implementadas.',
    ],
    'project-operations': [
      'Perfecto. Esa información optimiza la configuración operativa.',
      'Entiendo. Eso mejora los workflows de desarrollo.',
      'Correcto. Incorporaré esos aspectos en los procedimientos.',
      'Excelente. Con eso puedo ajustar el sistema de tracking.',
      'Comprendo. Esos elementos enriquecen la documentación operativa.',
      'Muy bien. Eso optimiza la configuración final del proyecto.',
    ]
  };

  const agentResponses = responses[agentId as keyof typeof responses] || responses['consultor-virtual'];
  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
};

// Simulate realistic typing delays based on message length
export const getTypingDelay = (messageLength: number): number => {
  const baseDelay = 1000; // 1 second base
  const wordsPerMinute = 180; // Realistic typing speed
  const characters = messageLength;
  const estimatedTime = (characters / 5) * (60000 / wordsPerMinute); // Convert to milliseconds
  return Math.max(baseDelay, Math.min(estimatedTime, 4000)); // Cap at 4 seconds
};

// Generate contextual file names based on phase and conversation
export const generateContextualFileName = (phase: number, context: string): string => {
  const fileTypes = {
    1: ['concept', 'mvp-definition', 'user-personas', 'problem-statement'],
    2: ['market-research', 'competitor-analysis', 'validation-report', 'opportunity-matrix'],
    3: ['tech-stack', 'architecture-design', 'database-schema', 'api-specification'],
    4: ['prd', 'technical-docs', 'user-manual', 'deployment-guide'],
    5: ['docker-config', 'ci-cd-pipeline', 'production-setup', 'monitoring-config']
  };
  
  const extensions = {
    1: 'md',
    2: 'md', 
    3: ['md', 'json', 'sql', 'yaml'][Math.floor(Math.random() * 4)],
    4: 'md',
    5: ['yml', 'json', 'sh', 'dockerfile'][Math.floor(Math.random() * 4)]
  };
  
  const types = fileTypes[phase as keyof typeof fileTypes] || ['document'];
  const type = types[Math.floor(Math.random() * types.length)];
  const ext = extensions[phase as keyof typeof extensions] || 'md';
  
  return `${type}.${ext}`;
};