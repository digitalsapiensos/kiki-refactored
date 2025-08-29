'use client';

/**
 * FileGenerationPanel - Panel que muestra el progreso de generación de archivos
 * Mock simulation de creación de archivos con progress bars
 */

import React from 'react';
import { FileGeneration, Agent } from '@/components/chat/types';

interface FileGenerationPanelProps {
  fileGenerations: FileGeneration[];
  currentAgent: Agent;
}

export const FileGenerationPanel: React.FC<FileGenerationPanelProps> = ({
  fileGenerations,
  currentAgent
}) => {
  const currentAgentFiles = fileGenerations.filter(file => file.agentId === currentAgent.id);

  if (currentAgentFiles.length === 0) {
    return null;
  }

  const getStatusColor = (status: FileGeneration['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400 border-green-600';
      case 'generating':
        return 'bg-yellow-400 border-yellow-600';
      case 'error':
        return 'bg-red-400 border-red-600';
      default:
        return 'bg-gray-300 border-gray-500';
    }
  };

  const getStatusIcon = (status: FileGeneration['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'generating':
        return '⚡';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusText = (status: FileGeneration['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'generating':
        return 'Generando...';
      case 'error':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-400 border-2 border-black rounded-full flex items-center justify-center">
          <span className="text-white font-black text-sm">📁</span>
        </div>
        <h3 className="font-black text-lg">Archivos Generados</h3>
      </div>

      <div className="space-y-3">
        {currentAgentFiles.map((file) => (
          <div 
            key={file.id}
            className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-black p-3 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{getStatusIcon(file.status)}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{file.fileName}</p>
                <p className="text-xs text-gray-600">{file.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded border-2 ${getStatusColor(file.status)}`}>
                {getStatusText(file.status)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 border-2 border-black h-4 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div 
                className={`h-full rounded transition-all duration-500 ${
                  file.status === 'completed' 
                    ? 'bg-green-400' 
                    : file.status === 'generating'
                    ? 'bg-yellow-400'
                    : file.status === 'error'
                    ? 'bg-red-400'
                    : 'bg-gray-300'
                }`}
                style={{ width: `${file.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">
                {file.progress}% completado
              </span>
              {file.status === 'completed' && (
                <button className="text-xs bg-blue-200 border-2 border-black px-2 py-1 rounded font-bold hover:bg-blue-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Descargar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-black rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">
            Progreso total: {currentAgentFiles.filter(f => f.status === 'completed').length}/{currentAgentFiles.length}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 border border-black rounded-full"></div>
            <span className="text-xs">{currentAgentFiles.filter(f => f.status === 'completed').length} completados</span>
          </div>
        </div>
      </div>
    </div>
  );
};