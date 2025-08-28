/**
 * Utility para gestionar proyectos del nuevo wizard en localStorage
 * Reemplaza la base de datos compleja con storage simple
 */

export interface KikiProject {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  currentStep: number
  completedSteps: number[]
  stepData: Record<number, {
    url?: string
    notes?: string
    completedAt?: string
  }>
  isCompleted: boolean
}

const STORAGE_KEY = 'kiki_projects'

/**
 * Obtener todos los proyectos del usuario
 */
export function getProjects(): KikiProject[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

/**
 * Crear nuevo proyecto
 */
export function createProject(name: string, description?: string): KikiProject {
  const project: KikiProject = {
    id: `project-${Date.now()}`,
    name: name.trim(),
    description: description?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    completedSteps: [],
    stepData: {},
    isCompleted: false
  }

  const projects = getProjects()
  projects.push(project)
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }

  return project
}

/**
 * Obtener proyecto por ID
 */
export function getProject(id: string): KikiProject | null {
  const projects = getProjects()
  return projects.find(p => p.id === id) || null
}

/**
 * Actualizar proyecto
 */
export function updateProject(id: string, updates: Partial<KikiProject>): void {
  const projects = getProjects()
  const index = projects.findIndex(p => p.id === id)
  
  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }
  }
}

/**
 * Completar un paso del proyecto
 */
export function completeProjectStep(
  projectId: string, 
  stepNumber: number, 
  url?: string, 
  notes?: string
): void {
  const project = getProject(projectId)
  if (!project) return

  const newStepData = {
    ...project.stepData,
    [stepNumber]: {
      url: url || 'IDE-WORK-COMPLETED',
      notes: notes || '',
      completedAt: new Date().toISOString()
    }
  }

  const newCompletedSteps = Array.from(new Set([...project.completedSteps, stepNumber]))
  const isCompleted = newCompletedSteps.length === 5

  updateProject(projectId, {
    stepData: newStepData,
    completedSteps: newCompletedSteps,
    currentStep: isCompleted ? 5 : Math.min(stepNumber + 1, 5),
    isCompleted
  })
}

/**
 * Eliminar proyecto
 */
export function deleteProject(id: string): void {
  const projects = getProjects()
  const filtered = projects.filter(p => p.id !== id)
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
}

/**
 * Obtener estadísticas del usuario
 */
export function getUserStats() {
  const projects = getProjects()
  const completed = projects.filter(p => p.isCompleted).length
  const inProgress = projects.filter(p => !p.isCompleted && p.completedSteps.length > 0).length
  const total = projects.length

  return {
    total,
    completed,
    inProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}