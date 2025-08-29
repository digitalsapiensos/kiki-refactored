/**
 * FileCard Component
 * Perfect neobrutalism file cards for KIKI generated files
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FileGeneration } from './types';

interface FileCardProps {
  file: FileGeneration;
  className?: string;
  variant?: 'compact' | 'detailed' | 'grid';
  showProgress?: boolean;
  showAgent?: boolean;
  onDownload?: (file: FileGeneration) => void;
  onPreview?: (file: FileGeneration) => void;
}

export function FileCard({
  file,
  className,
  variant = 'detailed',
  showProgress = true,
  showAgent = true,
  onDownload,
  onPreview
}: FileCardProps) {
  // Get file type icon and color
  const getFileTypeInfo = (fileName: string, type: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const typeMap = {
      'md': { icon: '📝', color: 'bg-blue-400', label: 'Markdown' },
      'json': { icon: '⚙️', color: 'bg-green-400', label: 'JSON' },
      'js': { icon: '🟨', color: 'bg-yellow-400', label: 'JavaScript' },
      'ts': { icon: '🔷', color: 'bg-blue-500', label: 'TypeScript' },
      'tsx': { icon: '⚛️', color: 'bg-blue-500', label: 'React' },
      'css': { icon: '🎨', color: 'bg-purple-400', label: 'CSS' },
      'html': { icon: '🌐', color: 'bg-orange-400', label: 'HTML' },
      'py': { icon: '🐍', color: 'bg-green-500', label: 'Python' },
      'sql': { icon: '🗃️', color: 'bg-gray-400', label: 'SQL' },
      'yml': { icon: '⚙️', color: 'bg-gray-500', label: 'YAML' },
      'yaml': { icon: '⚙️', color: 'bg-gray-500', label: 'YAML' },
      'txt': { icon: '📄', color: 'bg-gray-300', label: 'Text' },
    };

    return typeMap[extension as keyof typeof typeMap] || { 
      icon: '📄', 
      color: 'bg-gray-400', 
      label: type || 'File' 
    };
  };

  const fileTypeInfo = getFileTypeInfo(file.fileName, file.type);

  // Get status styling
  const getStatusStyling = (status: FileGeneration['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-400',
          text: 'text-green-800',
          border: 'border-green-600',
          label: 'COMPLETADO'
        };
      case 'generating':
        return {
          bg: 'bg-yellow-400',
          text: 'text-yellow-800',
          border: 'border-yellow-600',
          label: 'GENERANDO'
        };
      case 'error':
        return {
          bg: 'bg-red-400',
          text: 'text-red-800',
          border: 'border-red-600',
          label: 'ERROR'
        };
      default:
        return {
          bg: 'bg-gray-400',
          text: 'text-gray-800',
          border: 'border-gray-600',
          label: 'PENDIENTE'
        };
    }
  };

  const statusStyle = getStatusStyling(file.status);

  // Get agent color
  const getAgentColor = (agentId: string) => {
    const colors = {
      peter: 'bg-chart-1',
      sara: 'bg-chart-2', 
      toni: 'bg-chart-3',
      chris: 'bg-chart-4',
      quentin: 'bg-chart-5'
    };
    return colors[agentId as keyof typeof colors] || 'bg-main';
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-none",
        "bg-background border-2 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-1px] hover:translate-y-[-1px]",
        "hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
        "transition-all duration-150",
        className
      )}>
        {/* File type icon */}
        <div className={cn(
          "w-8 h-8 flex items-center justify-center",
          "border-2 border-black rounded-none text-sm",
          fileTypeInfo.color
        )}>
          {fileTypeInfo.icon}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-sm text-black truncate">
            {file.fileName}
          </div>
          {showProgress && (
            <div className="text-xs font-mono text-gray-600">
              {file.progress}% • {statusStyle.label}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className={cn(
          "w-3 h-3 border-2 border-black rounded-none",
          statusStyle.bg,
          file.status === 'generating' && "animate-pulse"
        )} />
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={cn(
        "p-4 rounded-none bg-background",
        "border-2 border-black",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        "transition-all duration-150 cursor-pointer",
        className
      )}
      onClick={() => onPreview?.(file)}
    >
      {/* File type icon - large */}
      <div className={cn(
        "w-12 h-12 flex items-center justify-center mx-auto mb-3",
        "border-2 border-black rounded-none text-2xl",
        fileTypeInfo.color
      )}>
        {fileTypeInfo.icon}
      </div>

      {/* File name */}
      <div className="font-mono font-bold text-sm text-black text-center mb-2 truncate">
        {file.fileName}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 border-2 border-black rounded-none mb-1">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                statusStyle.bg
              )}
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <div className="text-xs font-mono font-bold text-center text-gray-600">
            {file.progress}%
          </div>
        </div>
      )}

      {/* Status badge */}
      <div className={cn(
        "px-2 py-1 text-xs font-mono font-bold text-center rounded-none",
        "border-2 border-black",
        statusStyle.bg,
        statusStyle.text
      )}>
        {statusStyle.label}
      </div>
    </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={cn(
      "p-4 rounded-none bg-background",
      "border-2 border-black",
      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
      "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      "transition-all duration-150",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* File type icon */}
          <div className={cn(
            "w-10 h-10 flex items-center justify-center",
            "border-2 border-black rounded-none text-lg",
            fileTypeInfo.color
          )}>
            {fileTypeInfo.icon}
          </div>

          {/* File info */}
          <div>
            <div className="font-mono font-bold text-sm text-black">
              {file.fileName}
            </div>
            <div className="text-xs font-mono text-gray-600">
              {fileTypeInfo.label} • {file.type}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className={cn(
          "px-3 py-1 text-xs font-mono font-bold rounded-none",
          "border-2 border-black",
          statusStyle.bg,
          statusStyle.text,
          file.status === 'generating' && "animate-pulse"
        )}>
          {statusStyle.label}
        </div>
      </div>

      {/* Progress section */}
      {showProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-gray-700">
              Progreso
            </span>
            <span className="text-xs font-mono font-bold text-gray-700">
              {file.progress}%
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 border-2 border-black rounded-none">
            <div 
              className={cn(
                "h-full border-r-2 border-black transition-all duration-300",
                statusStyle.bg
              )}
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Agent attribution */}
      {showAgent && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-4 h-4 border-2 border-black rounded-none",
              getAgentColor(file.agentId)
            )} />
            <span className="text-xs font-mono font-bold text-gray-600">
              Generado por {file.agentId.toUpperCase()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {file.status === 'completed' && onPreview && (
              <button
                onClick={() => onPreview(file)}
                className={cn(
                  "px-3 py-1 text-xs font-mono font-bold rounded-none",
                  "bg-blue-400 text-blue-800 border-2 border-black",
                  "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                  "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "transition-all duration-150"
                )}
              >
                VER
              </button>
            )}
            
            {file.status === 'completed' && onDownload && (
              <button
                onClick={() => onDownload(file)}
                className={cn(
                  "px-3 py-1 text-xs font-mono font-bold rounded-none",
                  "bg-green-400 text-green-800 border-2 border-black",
                  "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                  "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "transition-all duration-150"
                )}
              >
                ⬇ DESCARGAR
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// File grid container
interface FileGridProps {
  files: FileGeneration[];
  className?: string;
  onDownload?: (file: FileGeneration) => void;
  onPreview?: (file: FileGeneration) => void;
}

export function FileGrid({
  files,
  className,
  onDownload,
  onPreview
}: FileGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
      className
    )}>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          variant="grid"
          onDownload={onDownload}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

// File list container
interface FileListProps {
  files: FileGeneration[];
  className?: string;
  variant?: 'compact' | 'detailed';
  onDownload?: (file: FileGeneration) => void;
  onPreview?: (file: FileGeneration) => void;
}

export function FileList({
  files,
  className,
  variant = 'detailed',
  onDownload,
  onPreview
}: FileListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          variant={variant}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}