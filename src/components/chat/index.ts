/**
 * KIKI Chat System - Component Exports
 * Neobrutalism-styled chat interface for the 5-phase wizard
 */

// Types and utilities
export * from './types';
export * from './mockData';

// Core chat components
export { AgentAvatar, AgentAvatarWithTyping } from './AgentAvatar';
export { AgentChatBubble, KIKIMessageBubble } from './AgentChatBubble';
export { UserInputField, KIKIInputField } from './UserInputField';
export { ChatContainer } from './ChatContainer';

// Progress and status components
export { FileGenerationProgress, FileGenerationInline } from './FileGenerationProgress';
export { ProjectProgress } from './ProjectProgress';
export { AgentTransition, InlineAgentTransition } from './AgentTransition';

// Re-export common utilities
export { getAgentById, getAgentByPhase } from './mockData';