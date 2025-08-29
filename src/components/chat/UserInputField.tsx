/**
 * UserInputField Component
 * Neobrutalism-styled input field for chat messages
 */

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface UserInputFieldProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  agentName?: string;
  isAgentTyping?: boolean;
  value?: string;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export function UserInputField({
  onSendMessage,
  placeholder = "Escribe tu mensaje aquí...",
  disabled = false,
  maxLength = 1000,
  className,
  agentName,
  isAgentTyping = false
}: UserInputFieldProps) {
  const [message, setMessage] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Handle send message
  const handleSend = () => {
    if (message.trim() && !disabled && !isAgentTyping) {
      onSendMessage(message.trim());
      setMessage('');
      setIsExpanded(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Auto-resize logic
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
        setIsExpanded(scrollHeight > 48);
      }
    }
  };

  // Focus management
  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!message.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={cn(
      "w-full bg-background border-t-2 border-black p-4",
      "relative z-30",
      className
    )}>
      {/* Agent typing indicator */}
      {isAgentTyping && agentName && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-main rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-main rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-main rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm font-mono text-gray-600">
            {agentName} está escribiendo...
          </span>
        </div>
      )}

      {/* Input container - Perfect neobrutalism styling */}
      <div className={cn(
        "flex gap-3 items-end rounded-none",
        "border-2 border-black bg-background",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        "focus-within:translate-x-[-2px] focus-within:translate-y-[-2px]",
        "transition-all duration-150",
        isExpanded && "pb-2"
      )}>
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={disabled ? "Espera a que el agente termine..." : placeholder}
            disabled={disabled || isAgentTyping}
            rows={1}
            className={cn(
              "w-full px-4 py-3 resize-none border-none outline-none",
              "font-base text-sm bg-transparent",
              "placeholder:text-gray-500 placeholder:font-mono",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[48px] max-h-[120px]"
            )}
            style={{ 
              lineHeight: '1.5',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          />
          
          {/* Character counter - Neobrutalism styling */}
          {isExpanded && (
            <div className={cn(
              "absolute bottom-1 right-2 text-xs font-mono font-bold",
              "bg-background border border-black px-1 py-0.5 rounded-none",
              message.length > maxLength * 0.9 ? "text-danger" : "text-gray-400"
            )}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send button - Perfect neobrutalism styling */}
        <div className="flex-shrink-0 p-2">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isAgentTyping}
            variant="default"
            size="icon"
            className={cn(
              "w-12 h-12 p-0 rounded-none",
              "border-2 border-black",
              "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              "hover:translate-x-[-2px] hover:translate-y-[-2px]",
              "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
              "disabled:translate-x-0 disabled:translate-y-0",
              "disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              "disabled:opacity-50",
              "transition-all duration-150"
            )}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <polygon points="22,2 15,22 11,13 2,9" />
            </svg>
          </Button>
        </div>
      </div>

      {/* KIKI personality tip */}
      {isExpanded && !message.trim() && (
        <div className="mt-3 text-xs font-mono text-gray-500 italic">
          💡 Tip de KIKI: No hay preguntas tontas, solo respuestas que aún no hemos googled juntos
        </div>
      )}
    </div>
  );
}

// Enhanced version with more KIKI personality features
interface KIKIInputFieldProps extends UserInputFieldProps {
  showPersonalityTips?: boolean;
  currentPhase?: number;
}

export function KIKIInputField({
  showPersonalityTips = true,
  currentPhase = 1,
  ...props
}: KIKIInputFieldProps) {
  const [showTip, setShowTip] = React.useState(false);

  // KIKI personality tips based on phase
  const getTipByPhase = (phase: number) => {
    const tips = {
      1: "🎯 Peter dice: Cuéntame tu idea como si fuera tu mamá quien pregunta en la cena",
      2: "🔍 Sara dice: No te preocupes si tu idea ya existe, hasta Netflix era 'Blockbuster online'",
      3: "🛠️ Toni dice: El stack tecnológico es como elegir ropa: lo importante es que funcione",
      4: "📄 Chris dice: La documentación es como el manual de IKEA: nadie la lee, pero todos la necesitan",
      5: "📦 Quentin dice: Deploy es como mudarse: siempre algo se rompe, pero vale la pena"
    };
    return tips[phase as keyof typeof tips] || "🤖 KIKI dice: ¡Tú puedes! Todos empezamos googleando 'Hola Mundo'";
  };

  const tip = getTipByPhase(currentPhase);

  return (
    <div className="relative">
      <UserInputField {...props} />
      
      {/* KIKI personality tip overlay - Perfect neobrutalism */}
      {showPersonalityTips && showTip && (
        <div className={cn(
          "absolute bottom-full left-4 right-4 mb-2 p-3",
          "bg-yellow-400 border-2 border-black rounded-none",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "font-mono text-xs font-bold text-black"
        )}>
          <div className="flex items-start gap-2">
            <span className="flex-1">{tip}</span>
            <button
              onClick={() => setShowTip(false)}
              className={cn(
                "flex-shrink-0 w-5 h-5 bg-black text-white text-xs font-bold",
                "flex items-center justify-center rounded-none border border-black",
                "hover:bg-gray-800 hover:translate-x-[-1px] hover:translate-y-[-1px]",
                "transition-all duration-150"
              )}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Tip trigger button - Perfect neobrutalism */}
      {showPersonalityTips && !showTip && (
        <button
          onClick={() => setShowTip(true)}
          className={cn(
            "absolute bottom-4 right-20 w-8 h-8 rounded-none",
            "bg-yellow-400 border-2 border-black text-black text-xs font-bold",
            "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[-1px] hover:translate-y-[-1px]",
            "hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            "transition-all duration-150"
          )}
        >
          💡
        </button>
      )}
    </div>
  );
}