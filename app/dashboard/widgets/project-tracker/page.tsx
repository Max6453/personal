'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Project, ProjectStatus, ProjectPriority } from '@/types/project'
import { Plus, Trash2, Edit2, Check, X, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    status: ProjectStatus
    priority: ProjectPriority
    due_date: string
    progress: number
  }>({
    name: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    due_date: '',
    progress: 0
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      alert('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a project name')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description || null,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || null,
            progress: formData.progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
        setEditingId(null)
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{
            name: formData.name,
            description: formData.description || null,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || null,
            progress: formData.progress
          }])

        if (error) throw error
        setIsAdding(false)
      }

      await loadProjects()
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'not-started',
      priority: 'medium',
      due_date: '',
      progress: 0
    })
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'not-started',
      priority: project.priority || 'medium',
      due_date: project.due_date || '',
      progress: project.progress || 0
    })
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    resetForm()
  }

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      'not-started': 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: ProjectPriority) => {
    const colors: Record<ProjectPriority, string> = {
      'low': 'text-gray-500',
      'medium': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    }
    return colors[priority]
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue = (dueDate: string | null, status: ProjectStatus) => {
    if (!dueDate || status === 'completed') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Project Tracker</h1>
          <p className="text-gray-600">Manage and monitor your projects efficiently</p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="mb-6 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Add New Project
          </button>
        )}

        {(isAdding || editingId) && (
          <div className=" rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Project' : 'New Project'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress ({formData.progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Check size={18} />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'} Project
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className=" rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Clock size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">No projects yet. Create your first project to get started!</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="bg-neutral-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)} bg-gray-100`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                  </span>
                  {isOverdue(project.due_date, project.status) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Overdue
                    </span>
                  )}
                </div>

                {project.due_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar size={16} />
                    <span>Due: {formatDate(project.due_date)}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic';