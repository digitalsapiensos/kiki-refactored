/**
 * Admin System Prompts Management Page
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/admin/prompts/page.tsx
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Edit, Eye, FileText, History, Plus, RefreshCw, Upload } from 'lucide-react'

interface SystemPrompt {
  id: string
  prompt_key: string
  title: string
  content: string
  version: number
  is_active: boolean
  category: string
  subcategory: string | null
  created_at: string
  updated_at: string
}

interface PromptVersion {
  id: string
  version: number
  content: string
  change_notes: string | null
  created_at: string
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null)
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [changeNotes, setChangeNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-prompts')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load prompts')
      }
      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (err) {
      setError(`Failed to load prompts: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadPromptDetails = async (prompt: SystemPrompt) => {
    try {
      const response = await fetch(`/api/admin/system-prompts/${prompt.id}`)
      if (!response.ok) {
        throw new Error('Failed to load prompt details')
      }
      const data = await response.json()
      setSelectedPrompt(data.prompt)
      setPromptVersions(data.versions || [])
      setEditContent(data.prompt.content)
      setEditTitle(data.prompt.title)
    } catch (err) {
      setError(`Failed to load prompt details: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const savePrompt = async () => {
    if (!selectedPrompt) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/system-prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          change_notes: changeNotes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save prompt')
      }

      const data = await response.json()
      setSuccess('Prompt updated successfully!')
      setEditMode(false)
      setChangeNotes('')
      
      // Reload prompts and prompt details
      await loadPrompts()
      await loadPromptDetails(data.prompt)
      
    } catch (err) {
      setError(`Failed to save prompt: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemPrompts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-prompts/load', {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load system prompts')
      }

      const data = await response.json()
      setSuccess(`Loaded ${data.loaded.length} prompts from filesystem`)
      await loadPrompts()
    } catch (err) {
      setError(`Failed to load system prompts: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const groupedPrompts = prompts.reduce((acc, prompt) => {
    const key = `${prompt.category}-${prompt.subcategory || 'general'}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(prompt)
    return acc
  }, {} as Record<string, SystemPrompt[]>)

  if (loading && prompts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading prompts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">System Prompts Management</h1>
          <p className="text-gray-600 mt-2">
            Manage AI agent system prompts with live updates
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadSystemPrompts} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Load from Filesystem
          </Button>
          <Button onClick={loadPrompts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Prompts ({prompts.length})</h2>
          
          {Object.entries(groupedPrompts).map(([group, groupPrompts]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {group.replace('-', ' • ')}
              </h3>
              {groupPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedPrompt?.id === prompt.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => loadPromptDetails(prompt)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{prompt.title}</CardTitle>
                      <div className="flex gap-1">
                        <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                          v{prompt.version}
                        </Badge>
                        <Badge variant="outline">
                          {prompt.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {prompt.prompt_key}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prompt.content.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Updated: {new Date(prompt.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>

        {/* Prompt Editor */}
        <div className="space-y-4">
          {selectedPrompt ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedPrompt.title}</h2>
                  <p className="text-sm text-gray-600">{selectedPrompt.prompt_key}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {editMode ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Prompt</CardTitle>
                    <CardDescription>
                      Make changes to the system prompt. Changes will be versioned and logged.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Prompt title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="System prompt content..."
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="change_notes">Change Notes</Label>
                      <Input
                        id="change_notes"
                        value={changeNotes}
                        onChange={(e) => setChangeNotes(e.target.value)}
                        placeholder="Describe what you changed..."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setEditMode(false)
                          setEditContent(selectedPrompt.content)
                          setEditTitle(selectedPrompt.title)
                          setChangeNotes('')
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button onClick={savePrompt} disabled={loading}>
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="content">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="versions">Version History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content">
                    <Card>
                      <CardContent className="pt-6">
                        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                          {selectedPrompt.content}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="versions">
                    <div className="space-y-2">
                      {promptVersions.map((version) => (
                        <Card key={version.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm">Version {version.version}</CardTitle>
                              <Badge variant="outline">
                                {new Date(version.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                            {version.change_notes && (
                              <CardDescription>
                                {version.change_notes}
                              </CardDescription>
                            )}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a prompt to view and edit</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}