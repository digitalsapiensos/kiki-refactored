# KIKI Chat System - Neobrutalism UI Components

Complete chat interface system for the KIKI 5-phase wizard with neobrutalism styling inspired by neobrutalism.dev.

## 📋 Components Overview

### Core Components

#### `ChatContainer`
Main layout component that orchestrates the entire chat experience.

**Features:**
- Full-screen chat interface with optional sidebar
- Real-time message display
- Agent status and transitions
- File generation progress tracking
- Auto-scrolling to new messages

**Usage:**
```tsx
import { ChatContainer, sampleChatSession } from '@/components/chat';

<ChatContainer
  session={sampleChatSession}
  onSendMessage={handleMessage}
  onAgentTransition={handleTransition}
  showSidebar={true}
  autoScroll={true}
/>
```

#### `AgentChatBubble` & `KIKIMessageBubble`
Message display components with agent-specific styling.

**Features:**
- Agent vs user message differentiation
- KIKI personality integration
- Typing indicators
- Timestamp display
- Neobrutalism shadows and borders

**Usage:**
```tsx
import { KIKIMessageBubble, getAgentById } from '@/components/chat';

<KIKIMessageBubble
  message={message}
  agent={getAgentById('peter')}
  showTimestamp
  isKIKIPersonality
/>
```

#### `UserInputField` & `KIKIInputField`
Input components with neobrutalism styling and KIKI personality tips.

**Features:**
- Auto-resizing textarea
- Character counter
- Phase-specific personality tips
- Typing state management
- Send button with hover effects

**Usage:**
```tsx
import { KIKIInputField } from '@/components/chat';

<KIKIInputField
  onSendMessage={handleSend}
  showPersonalityTips
  currentPhase={1}
  maxLength={1000}
/>
```

#### `AgentAvatar`
Agent representation with phase-specific colors and emojis.

**Features:**
- Size variants (sm, md, lg, xl)
- Phase badges
- Agent-specific styling
- Typing indicator integration

**Agent Mappings:**
- Peter (Phase 1): 🎯 Yellow - Project Mentor
- Sara (Phase 2): 🔍 Blue - Market Researcher  
- Toni (Phase 3): 🛠️ Green - Technical Architect
- Chris (Phase 4): 📄 Orange - Technical Writer
- Quentin (Phase 5): 📦 Purple - DevOps Coach

#### `FileGenerationProgress`
Progress tracking for generated project files.

**Features:**
- Real-time progress updates
- Agent attribution
- File type categorization
- Status indicators (pending, generating, completed, error)
- Inline and full display modes

#### `ProjectProgress`
Overall project progress across the 5 phases.

**Features:**
- Phase completion tracking
- Visual progress indicators
- Agent handoff visualization
- Multiple display variants (full, compact, minimal)
- KIKI motivational messages

#### `AgentTransition`
Visual handoff between agents with animation.

**Features:**
- Smooth transition animations
- Agent introduction sequences
- Handoff messages with KIKI personality
- Auto-transition options
- Previous agent context

## 🎨 Design System

### Neobrutalism Principles
- **Sharp corners**: `border-radius: 0px`
- **Bold borders**: `border-2 border-black`
- **Strong shadows**: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- **High contrast**: Black borders on colored backgrounds
- **Monospace fonts**: Space Mono for headings, Inter for body

### Color Palette
Based on the 5-phase wizard colors:
- **Phase 1**: `bg-yellow-400` (chart-1) - Conceptualization
- **Phase 2**: `bg-blue-400` (chart-2) - Research & Validation
- **Phase 3**: `bg-green-400` (chart-3) - Technical Planning
- **Phase 4**: `bg-orange-400` (chart-4) - Document Generation
- **Phase 5**: `bg-purple-400` (chart-5) - Setup & Export

### Typography
- **Headings**: Space Mono (font-heading)
- **Body**: Inter (font-base)
- **Code**: Space Mono (font-mono)
- **Weights**: 400 (base), 700 (heading)

## 🤖 KIKI Personality Integration

### Agent Personalities
Each agent has distinct personality traits reflected in their messages:

**Peter (Phase 1)**
- Role: Project Mentor
- Personality: "Traductor de borracho a corporativo"
- Focus: Making ideas sound professional
- Tone: Enthusiastic, encouraging

**Sara (Phase 2)**
- Role: Market Researcher
- Personality: Realistic with humor about market validation
- Focus: Competitor analysis and validation
- Tone: Pragmatic, slightly sarcastic

**Toni (Phase 3)**
- Role: Technical Architect
- Personality: Demystifies technical concepts
- Focus: Technology stack selection
- Tone: Confident, reassuring

**Chris (Phase 4)**
- Role: Technical Writer
- Personality: Documentation expert with realistic expectations
- Focus: Writing documentation that people actually read
- Tone: Practical, slightly self-deprecating

**Quentin (Phase 5)**
- Role: DevOps Coach
- Personality: Makes deployment less scary
- Focus: Production readiness
- Tone: Experienced, calming

### Personality Tips
Phase-specific tips that appear in input fields:
- Phase 1: "Cuéntame tu idea como si fuera tu mamá quien pregunta en la cena"
- Phase 2: "No te preocupes si tu idea ya existe, hasta Netflix era 'Blockbuster online'"
- Phase 3: "El stack tecnológico es como elegir ropa: lo importante es que funcione"
- Phase 4: "La documentación es como el manual de IKEA: nadie la lee, pero todos la necesitan"
- Phase 5: "Deploy es como mudarse: siempre algo se rompe, pero vale la pena"

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px - Single column, compact sidebar
- **Tablet**: 768px - 1024px - Condensed layout
- **Desktop**: > 1024px - Full sidebar experience

### Mobile Optimizations
- Touch-friendly button sizes (min 44px)
- Swipe gestures for agent transitions
- Collapsible sidebar
- Optimized message bubble sizing
- Larger input area on mobile

## 🚀 Usage Examples

### Basic Chat Setup
```tsx
'use client';

import { useState } from 'react';
import { ChatContainer, sampleChatSession, ChatSession } from '@/components/chat';

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession>(sampleChatSession);

  const handleSendMessage = (message: string) => {
    // Add user message to session
    const userMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      type: 'user' as const,
      timestamp: new Date()
    };
    
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
  };

  return (
    <div className="h-screen">
      <ChatContainer
        session={session}
        onSendMessage={handleSendMessage}
        showSidebar={true}
      />
    </div>
  );
}
```

### Custom Agent Response
```tsx
const generateAgentResponse = (userMessage: string, agentId: string): string => {
  const responses = {
    peter: [
      "¡Interesante! Eso me da una idea...",
      "Perfecto, veo que tienes claridad...",
      "Me gusta como piensas..."
    ],
    sara: [
      "Hmm, déjame investigar eso...",
      "Interesante punto. He visto esto antes...",
      "Esto me recuerda a un caso..."
    ]
    // ... more agents
  };

  const agentResponses = responses[agentId] || responses.peter;
  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
};
```

### File Generation Simulation
```tsx
const simulateFileGeneration = () => {
  setSession(prev => ({
    ...prev,
    fileGenerations: prev.fileGenerations.map(file => ({
      ...file,
      progress: Math.min(file.progress + 25, 100),
      status: file.progress >= 75 ? 'completed' : 'generating'
    }))
  }));
};
```

## 🔧 Development Notes

### TypeScript Support
All components are fully typed with TypeScript interfaces:
- `Agent` - Agent configuration and metadata
- `ChatMessage` - Message structure and content
- `ChatSession` - Complete chat session state
- `FileGeneration` - File generation progress tracking
- `ProjectProgress` - Project phase progress

### Performance Considerations
- Lazy loading for large chat histories
- Virtualization for message lists (implement if > 500 messages)
- Debounced typing indicators
- Memoized agent responses for repeated patterns

### Accessibility
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modal states

### Testing
Demo page available at `/chat-demo` with:
- Interactive agent switching
- Message simulation
- File generation testing
- Responsive design validation

## 🌟 Future Enhancements

### Planned Features
- Voice input integration
- Message reactions and threading
- File upload and preview
- Chat export functionality
- Multi-language support
- Advanced animation system
- WebSocket integration for real-time updates

### Integration Points
- Backend API integration for real chat
- Authentication system integration
- Project persistence
- Analytics and metrics tracking
- A/B testing framework integration

## 📝 Component Files

```
src/components/chat/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript definitions
├── mockData.ts                 # Sample data for testing
├── AgentAvatar.tsx            # Agent representation
├── AgentChatBubble.tsx        # Message display
├── UserInputField.tsx         # User input interface
├── FileGenerationProgress.tsx # File progress tracking
├── ProjectProgress.tsx        # Phase progress display
├── AgentTransition.tsx        # Agent handoff animations
├── ChatContainer.tsx          # Main chat interface
└── README.md                  # This documentation
```

## 🎯 Implementation Status

✅ **Completed Components:**
- All core chat components
- Neobrutalism styling system
- KIKI personality integration
- Mock data and types
- Demo page functionality
- Responsive design basics
- TypeScript definitions

🔄 **In Progress:**
- Advanced responsive optimizations
- Accessibility improvements
- Performance optimizations

📋 **Todo:**
- Backend integration
- Real-time WebSocket support
- Advanced animations
- Voice input system
- Multi-language support

---

**Built with ❤️ for the KIKI Educational Platform**  
*Making software development accessible to everyone, one chat at a time.*