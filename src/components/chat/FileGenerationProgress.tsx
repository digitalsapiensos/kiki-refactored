/**
 * FileGenerationProgress Component
 * Shows file generation progress with neobrutalism styling
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FileGeneration } from './types';
import { getAgentById } from './mockData';

interface FileGenerationProgressProps {
  files: FileGeneration[];
  className?: string;
  showCompleted?: boolean;
}

export function FileGenerationProgress({
  files,
  className,
  showCompleted = true
}: FileGenerationProgressProps) {
  const activeFiles = files.filter(file => 
    file.status === 'generating' || file.status === 'pending' || 
    (showCompleted && file.status === 'completed')
  );

  if (activeFiles.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "w-full bg-secondary-background border-2 border-black p-4 mb-4",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-main border-2 border-black flex items-center justify-center">
          <span className="text-white font-bold text-sm">📄</span>
        </div>
        <h3 className="font-heading font-bold text-black">
          Archivos siendo generados
        </h3>
        <span className="text-xs font-mono bg-black text-white px-2 py-1">
          {activeFiles.filter(f => f.status === 'generating').length} activos
        </span>
      </div>

      {/* File list */}
      <div className="space-y-3">
        {activeFiles.map((file) => (
          <FileGenerationItem key={file.id} file={file} />
        ))}
      </div>

      {/* KIKI personality footer */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <div className="text-xs font-mono text-gray-600 italic">
          💡 KIKI dice: Cada archivo generado es como una página de Wikipedia que realmente vas a usar
        </div>
      </div>
    </div>
  );
}

// Individual file generation item
interface FileGenerationItemProps {
  file: FileGeneration;
}

function FileGenerationItem({ file }: FileGenerationItemProps) {
  const agent = getAgentById(file.agentId);
  
  // Get file type icon
  const getFileIcon = (type: string, fileName: string) => {
    if (fileName.includes('.md')) return '📝';
    if (type === 'Documentation') return '📄';
    if (type === 'Requirements') return '📋';
    if (type === 'Research') return '🔍';
    if (type === 'Technical') return '⚙️';
    if (type === 'Configuration') return '🔧';
    return '📄';
  };

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-500',
          label: 'COMPLETADO'
        };
      case 'generating':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-500',
          label: 'GENERANDO'
        };
      case 'pending':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-500',
          label: 'PENDIENTE'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-500',
          label: 'ERROR'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-500',
          label: 'DESCONOCIDO'
        };
    }
  };

  const styling = getStatusStyling(file.status);
  const fileIcon = getFileIcon(file.type, file.fileName);

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border-2 border-black bg-background",
      "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200",
      file.status === 'generating' && "animate-pulse"
    )}>
      {/* File icon */}
      <div className="flex-shrink-0 text-lg">
        {fileIcon}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-sm truncate">
            {file.fileName}
          </span>
          <span className="text-xs bg-gray-200 border border-gray-400 px-2 py-0.5 font-mono">
            {file.type}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 border border-black h-3 mb-1">
          <div 
            className={cn(
              "h-full border-r border-black transition-all duration-500",
              styling.bg
            )}
            style={{ width: `${file.progress}%` }}
          />
        </div>

        {/* Agent and progress info */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-600">
            {agent ? `Por ${agent.name}` : 'Agente desconocido'}
          </span>
          <span className={styling.text}>
            {file.progress}% • {styling.label}
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        <div className={cn(
          "w-3 h-3 border-2 border-black",
          styling.bg,
          file.status === 'generating' && "animate-spin"
        )}>
          {file.status === 'generating' && (
            <div className="w-full h-full bg-black opacity-20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for chat messages
interface FileGenerationInlineProps {
  file: FileGeneration;
  className?: string;
}

export function FileGenerationInline({
  file,
  className
}: FileGenerationInlineProps) {
  const agent = getAgentById(file.agentId);
  const styling = getStatusStyling(file.status);

  function getStatusStyling(status: string) {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-400', label: '✅' };
      case 'generating':
        return { bg: 'bg-yellow-400', label: '⏳' };
      case 'pending':
        return { bg: 'bg-gray-400', label: '⏸️' };
      case 'error':
        return { bg: 'bg-red-400', label: '❌' };
      default:
        return { bg: 'bg-gray-400', label: '❓' };
    }
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-2 border-2 border-black bg-background font-mono text-xs",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      className
    )}>
      <span>{styling.label}</span>
      <span className="font-bold">{file.fileName}</span>
      <div className="w-16 bg-gray-200 border border-black h-2">
        <div 
          className={cn("h-full", styling.bg)}
          style={{ width: `${file.progress}%` }}
        />
      </div>
      <span className="text-gray-600">{file.progress}%</span>
    </div>
  );
}