/**
 * MockAgentSystem - Sistema de simulación de agentes KIKI
 * Genera respuestas realistas, timing y file generation mock
 */

import { Agent, ChatMessage, FileGeneration } from '../chat/types';

export class MockAgentSystem {
  
  /**
   * Genera introducción inicial del agente para cada paso
   */
  getAgentIntroduction(agent: Agent, step: number): string {
    const introductions = {
      1: `¡Hola! Soy ${agent.name}, tu compañero en esta aventura. ${agent.description} 

Vamos a convertir esa idea brillante en algo que suene súper profesional. Primero, cuéntame: ¿qué problema quieres resolver? Y por favor, no me digas "ser el próximo Uber de algo" 😄`,

      2: `¡Hola! Soy ${agent.name}. ${agent.description}

He revisado lo que discutiste con Peter y suena interesante. Ahora vamos a investigar si tu idea ya existe (spoiler: probablemente sí, pero la tuya será mejor porque... razones). ¿Listo para el reality check?`,

      3: `¡${agent.name} aquí! ${agent.description}

Sara me ha pasado toda la info de mercado. Ahora viene la parte divertida: elegir tu stack tecnológico. No te preocupes si no sabes qué es un "stack", yo tampoco al principio, pero entre los dos lo descubrimos.`,

      4: `Soy ${agent.name}. ${agent.description}

Toni me ha dado todos los detalles técnicos. Ahora toca crear documentación que nadie leerá, pero todos fingirán haber leído. Es tradición en tech. ¿Empezamos con el PRD?`,

      5: `${agent.name} al habla. ${agent.description}

Chris ya tiene toda la documentación lista. Ahora vamos a hacer que tu app funcione en internet. Es como mudarse, pero con más errores 500. ¿Preparado para el deployment?`
    };

    return introductions[step as keyof typeof introductions] || 
           `¡Hola! Soy ${agent.name} y estoy aquí para ayudarte en esta fase del proyecto.`;
  }

  /**
   * Genera respuesta contextual del agente
   */
  async generateResponse(
    agent: Agent, 
    userMessage: string, 
    step: number, 
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    // Respuestas por agente y contexto
    const responses = this.getAgentResponses(agent, step);
    
    // Buscar respuesta por palabras clave
    for (const [keywords, response] of responses) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return this.randomizeResponse(response);
      }
    }
    
    // Respuesta genérica si no hay match
    return this.getGenericResponse(agent, step);
  }

  /**
   * Obtiene respuestas específicas por agente
   */
  private getAgentResponses(agent: Agent, step: number): [string[], string][] {
    const responseMap: { [key: string]: [string[], string][] } = {
      'peter': [
        [['app', 'aplicación', 'idea'], 
         '¡Perfecto! Una app siempre es buena idea. Ahora, imaginemos que tu app ya existe y es súper exitosa. ¿Quién sería tu usuario ideal? ¿Alguien perdido buscando dirección, o más bien con objetivos específicos?'],
        [['no sé', 'no estoy seguro', 'ayuda'], 
         'Tranquilo, es normal no tener todo claro al principio. Vamos paso a paso. ¿Qué problema específico has notado que te gustaría solucionar? Piensa en algo que te moleste en tu día a día.'],
        [['estudiantes', 'aprendizaje', 'educación'], 
         'Excelente! El sector educativo siempre necesita innovación. Los estudiantes overwhelmed son nuestro target perfecto. ¿Cuál sería la feature principal para el MVP? ¿Matching automático, booking de sesiones, o algo más simple?'],
        [['negocio', 'empresa', 'startup'], 
         'Ah, el mundo empresarial. Donde las reuniones generan más reuniones y el café es un grupo alimenticio. ¿Tu solución va dirigida a pequeñas empresas o grandes corporaciones?']
      ],
      
      'sara': [
        [['competidores', 'mercado', 'análisis'], 
         'Perfecto, vamos a investigar. He encontrado algunos competidores interesantes. LinkedIn Learning, Coursera, y MentorCruise hacen algo similar, pero ninguno tiene exactamente tu enfoque. ¿Quieres que profundice en alguno específico?'],
        [['viable', 'validación', 'funciona'], 
         'La validación es clave. He visto 3 startups similares que levantaron funding en 2024. El mercado de mentoring tech está valorado en $2.1B y creciendo 15% anual. Las señales son buenas, pero necesitamos diferenciarnos.'],
        [['usuarios', 'target', 'audiencia'], 
         'Según mi research, tu target son estudiantes CS de 18-25 años, principalmente en universidades. El 68% reporta sentirse overwhelmed en los primeros 2 años. Tu timing es perfecto.'],
        [['precio', 'monetización', 'modelo'], 
         'He analizado los pricing models de la competencia. Freemium es popular: plan gratuito básico, premium $29/mes, enterprise $99/mes. ¿Te parece razonable para tu target?']
      ],
      
      'toni': [
        [['tecnología', 'stack', 'arquitectura'], 
         'Para tu plataforma de mentoring, recomiendo: Next.js + TypeScript para frontend, Node.js + Express para backend, PostgreSQL para datos, y Stripe para pagos. Stack sólido y escalable.'],
        [['base de datos', 'database', 'datos'], 
         'PostgreSQL es perfecto para tu caso. Necesitas relaciones complejas: users, mentors, sessions, reviews, payments. Supabase puede darte PostgreSQL + auth + realtime out of the box.'],
        [['escalabilidad', 'performance', 'usuarios'], 
         'Con Next.js + Vercel puedes empezar pequeño y escalar automáticamente. Para 1000+ usuarios concurrentes, considera Redis para caching y una CDN para assets. Pero eso viene después.'],
        [['seguridad', 'auth', 'autenticación'], 
         'Auth0 o Supabase Auth para authentication. Implementa OAuth con Google/GitHub, 2FA opcional, y JWT tokens. Para payments, Stripe maneja toda la seguridad PCI.']
      ],
      
      'chris': [
        [['documentación', 'prd', 'especificaciones'], 
         'Perfecto! Voy a crear el PRD (Product Requirements Document) completo. Incluiré user stories, wireframes básicos, API specs, y roadmap. ¿Quieres que empiece por las user stories?'],
        [['usuarios', 'historias', 'features'], 
         'Excelente. Voy a documentar las user stories principales: "Como estudiante quiero encontrar un mentor", "Como mentor quiero gestionar sesiones", "Como admin quiero analytics". ¿Alguna específica que quieras priorizar?'],
        [['api', 'endpoints', 'técnico'], 
         'Voy a crear la documentación técnica: API endpoints, database schema, authentication flow, y deployment guide. Será tu biblia de desarrollo.'],
        [['manual', 'guía', 'usuario'], 
         'Claro, crearemos guías para todos: onboarding de estudiantes, manual de mentores, y admin panel guide. Todo con screenshots y videos explicativos.']
      ],
      
      'quentin': [
        [['deploy', 'deployment', 'producción'], 
         'Deployment time! Vamos con Vercel para frontend (gratis, súper fácil) y Railway/Render para backend. Base de datos en Supabase. Todo conectado en 30 minutos máximo.'],
        [['dominio', 'dns', 'url'], 
         'Para dominio, recomiendo Namecheap o Porkbun (más baratos que GoDaddy). Un .com te cuesta $12/año. ¿Ya tienes nombre en mente? Podemos checar disponibilidad.'],
        [['ssl', 'https', 'certificado'], 
         'Vercel incluye SSL automático, no te preocupes. En cuanto conectes tu dominio custom, tendrás HTTPS funcionando. Es magia pura.'],
        [['monitoreo', 'analytics', 'métricas'], 
         'Para monitoreo: Vercel Analytics (gratis), Sentry para error tracking, y Google Analytics para user behavior. Lo básico que necesitas para empezar.']
      ]
    };

    return responseMap[agent.id] || [];
  }

  /**
   * Genera respuesta genérica cuando no hay match específico
   */
  private getGenericResponse(agent: Agent, step: number): string {
    const genericResponses = {
      1: [
        'Interesante perspectiva. Cuéntame más detalles sobre eso.',
        'Me gusta hacia donde va esto. ¿Puedes darme un ejemplo específico?',
        'Perfecto, eso suena como algo que podemos desarrollar. ¿Qué más tienes en mente?'
      ],
      2: [
        'Déjame investigar eso un poco más. ¿Has visto algo similar en el mercado?',
        'Buen punto. Voy a validar esa hipótesis con algunos datos.',
        'Interesante angle. ¿Cómo crees que los usuarios reaccionarían a eso?'
      ],
      3: [
        'Esa es una consideración técnica importante. Vamos a evaluarlo.',
        'Desde el punto de vista de arquitectura, eso tiene sentido.',
        'Buena pregunta. Voy a revisar las mejores prácticas para ese caso.'
      ],
      4: [
        'Perfecto, voy a documentar eso inmediatamente.',
        'Excelente punto. Eso definitivamente va en las especificaciones.',
        'Claro, voy a asegurarme de que quede bien explicado en la documentación.'
      ],
      5: [
        'Ese es un buen approach para deployment. Vamos a implementarlo.',
        'Perfecto, eso va a funcionar bien en producción.',
        'Buena consideración de DevOps. Lo incluimos en la configuración.'
      ]
    };

    const responses = genericResponses[step as keyof typeof genericResponses] || [
      'Entiendo tu punto. ¿Puedes darme más contexto?',
      'Interesante. Vamos a explorar esa idea.',
      'Me parece una buena dirección. Sigamos por ahí.'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Añade variación a las respuestas
   */
  private randomizeResponse(response: string): string {
    const variations = [
      '', 
      '🤔 ', 
      '💡 ', 
      '👍 ',
      '🚀 '
    ];
    
    const prefix = variations[Math.floor(Math.random() * variations.length)];
    return prefix + response;
  }

  /**
   * Genera archivos mock para el agente actual
   */
  generateMockFiles(agent: Agent, step: number): FileGeneration[] {
    const fileTemplates = {
      1: [
        { name: 'project-concept.md', type: 'Documentation' },
        { name: 'user-stories.md', type: 'Requirements' },
        { name: 'mvp-definition.md', type: 'Planning' }
      ],
      2: [
        { name: 'competitor-analysis.md', type: 'Research' },
        { name: 'market-validation.md', type: 'Research' },
        { name: 'target-audience.md', type: 'Analysis' }
      ],
      3: [
        { name: 'technical-architecture.md', type: 'Architecture' },
        { name: 'database-schema.sql', type: 'Database' },
        { name: 'api-endpoints.md', type: 'API' }
      ],
      4: [
        { name: 'product-requirements.md', type: 'Documentation' },
        { name: 'user-manual.md', type: 'Documentation' },
        { name: 'technical-specs.md', type: 'Specifications' }
      ],
      5: [
        { name: 'deployment-guide.md', type: 'DevOps' },
        { name: 'environment-config.yml', type: 'Configuration' },
        { name: 'project-final.zip', type: 'Archive' }
      ]
    };

    const templates = fileTemplates[step as keyof typeof fileTemplates] || [];
    
    return templates.map((template, index) => ({
      id: `file-${step}-${index}-${Date.now()}`,
      fileName: template.name,
      type: template.type,
      progress: 0,
      status: 'pending' as const,
      agentId: agent.id
    }));
  }

  /**
   * Simula progreso de generación de archivo
   */
  async simulateFileProgress(fileGeneration: FileGeneration): Promise<FileGeneration> {
    // Simular progreso gradual
    const intervals = [20, 40, 60, 80, 100];
    
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      fileGeneration.progress = progress;
      fileGeneration.status = progress === 100 ? 'completed' : 'generating';
    }
    
    return fileGeneration;
  }
}

// Export instance and utility functions
export const mockAgentSystem = new MockAgentSystem();

// Utility function to simulate typing delay
export const simulateTypingDelay = (messageLength: number): Promise<void> => {
  const baseDelay = 1000;
  const wordsPerMinute = 180;
  const characters = messageLength;
  const estimatedTime = (characters / 5) * (60000 / wordsPerMinute);
  const delay = Math.max(baseDelay, Math.min(estimatedTime, 4000));
  
  return new Promise(resolve => setTimeout(resolve, delay));
};