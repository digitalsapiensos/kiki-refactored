/**
 * Hook para manejar la persistencia del progreso del wizard
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/hooks/use-wizard-persistence.ts
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSupabase } from './use-supabase'
import toast from 'react-hot-toast'

interface WizardState {
  projectId: string
  currentPhase: number
  phaseData: Record<number, any>
  lastSaved: string | null
}

interface UsWizardPersistenceOptions {
  projectId: string
  autoSaveInterval?: number // milliseconds
}

export function useWizardPersistence({ 
  projectId, 
  autoSaveInterval = 30000 // 30 seconds default
}: UsWizardPersistenceOptions) {
  const { supabase, session } = useSupabase()
  const [wizardState, setWizardState] = useState<WizardState>({
    projectId,
    currentPhase: 1,
    phaseData: {},
    lastSaved: null
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // Load wizard state from Supabase
  const loadWizardState = useCallback(async () => {
    if (!session || !projectId) return

    try {
      const { data: project, error } = await supabase
        .from('kiki_projects')
        .select('current_phase, phase_data, updated_at')
        .eq('id', projectId)
        .single()

      if (error) throw error

      if (project) {
        setWizardState(prev => ({
          ...prev,
          currentPhase: project.current_phase || 1,
          phaseData: project.phase_data || {},
          lastSaved: project.updated_at
        }))
      }

      // Also load from localStorage as backup
      const localState = localStorage.getItem(`wizard-state-${projectId}`)
      if (localState) {
        const parsed = JSON.parse(localState)
        // Use local state if it's more recent than database
        const localTime = new Date(parsed.lastSaved || 0).getTime()
        const dbTime = new Date(project?.updated_at || 0).getTime()
        
        if (localTime > dbTime) {
          setWizardState(prev => ({ ...prev, ...parsed }))
        }
      }
    } catch (error) {
      console.error('Error loading wizard state:', error)
      setLastError('Error cargando progreso')
      
      // Fallback to localStorage only
      const localState = localStorage.getItem(`wizard-state-${projectId}`)
      if (localState) {
        setWizardState(prev => ({ ...prev, ...JSON.parse(localState) }))
      }
    }
  }, [supabase, session, projectId])

  // Save wizard state to both Supabase and localStorage
  const saveWizardState = useCallback(async (immediate = false) => {
    if (!session || !projectId) return

    setIsSaving(true)
    setLastError(null)

    try {
      const now = new Date().toISOString()
      
      // Save to localStorage immediately (for offline resilience)
      const stateToSave = { ...wizardState, lastSaved: now }
      localStorage.setItem(`wizard-state-${projectId}`, JSON.stringify(stateToSave))
      
      // Save to Supabase
      const { error } = await supabase
        .from('kiki_projects')
        .update({
          current_phase: wizardState.currentPhase,
          phase_data: wizardState.phaseData,
          updated_at: now
        })
        .eq('id', projectId)

      if (error) throw error

      setWizardState(prev => ({ ...prev, lastSaved: now }))
      
      if (immediate) {
        toast.success('Progreso guardado', { 
          duration: 2000,
          style: { fontSize: '12px' }
        })
      }
    } catch (error) {
      console.error('Error saving wizard state:', error)
      setLastError('Error guardando progreso')
      
      if (immediate) {
        toast.error('Error guardando progreso')
      }
    } finally {
      setIsSaving(false)
    }
  }, [supabase, session, projectId, wizardState])

  // Update phase data
  const updatePhaseData = useCallback((phase: number, data: any) => {
    setWizardState(prev => ({
      ...prev,
      phaseData: {
        ...prev.phaseData,
        [phase]: { ...prev.phaseData[phase], ...data }
      }
    }))
  }, [])

  // Set current phase
  const setCurrentPhase = useCallback((phase: number) => {
    setWizardState(prev => ({ ...prev, currentPhase: phase }))
  }, [])

  // Load state on mount
  useEffect(() => {
    loadWizardState()
  }, [loadWizardState])

  // Auto-save interval
  useEffect(() => {
    if (!autoSaveInterval) return

    const interval = setInterval(() => {
      saveWizardState(false) // Silent auto-save
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [saveWizardState, autoSaveInterval])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronous save to localStorage
      const now = new Date().toISOString()
      const stateToSave = { ...wizardState, lastSaved: now }
      localStorage.setItem(`wizard-state-${projectId}`, JSON.stringify(stateToSave))
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [wizardState, projectId])

  return {
    // State
    wizardState,
    currentPhase: wizardState.currentPhase,
    phaseData: wizardState.phaseData,
    lastSaved: wizardState.lastSaved,
    
    // Actions
    updatePhaseData,
    setCurrentPhase,
    saveWizardState: () => saveWizardState(true), // Manual save with feedback
    loadWizardState,
    
    // Status
    isSaving,
    lastError,
    isReady: !!session && !!projectId
  }
}