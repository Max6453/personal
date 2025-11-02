'use client';

import { useState, useEffect } from 'react';
import { Plus, FolderKanban, Calendar, CheckCircle, Clock, AlertCircle, Trash2, Edit, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useTokens } from '@/lib/token-context';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string | null;  // Changed
  end_date: string | null;    // Changed
  progress: number;
  created_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  due_date: string | null;  // Changed
  created_at: string;
}

export default function ProjectTracker() {
  const { supabaseToken } = useTokens();
  const [projectUrl, setProjectUrl] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    progress: 0,
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    due_date: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('supabase_project_url');
      if (savedUrl) {
        setProjectUrl(savedUrl);
      }
    }
  }, []);

  useEffect(() => {
    if (supabaseToken && projectUrl) {
      fetchProjects();
    }
  }, [supabaseToken, projectUrl]);

  useEffect(() => {
    if (selectedProject && supabaseToken && projectUrl) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject, supabaseToken, projectUrl]);

  const getSupabaseClient = () => {
    if (!projectUrl || !supabaseToken) return null;
    return createClient(projectUrl, supabaseToken);
  };

  const fetchProjects = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
    }
  };

    const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    setError('');
    
    // Prepare data with snake_case column names
    const projectData: any = {
      name: projectForm.name,
      description: projectForm.description,
      status: projectForm.status,
      priority: projectForm.priority,
      progress: projectForm.progress,
    };

    // Only add dates if they're not empty strings
    if (projectForm.start_date) {
      projectData.start_date = projectForm.start_date;  // snake_case
    }
    if (projectForm.end_date) {
      projectData.end_date = projectForm.end_date;      // snake_case
    }

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert([projectData])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    setShowProjectModal(false);
    setProjectForm({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      progress: 0,
    });
    await fetchProjects();
  } catch (err: any) {
    console.error('Error creating project:', err);
    setError(`Failed to create project: ${err.message || 'Unknown error'}`);
  }
};

  const handleCreateTask = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedProject) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    setError('');
    
    const taskData: any = {
      project_id: selectedProject,  // snake_case
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
    };

    // Only add optional fields if they exist
    if (taskForm.assignee) {
      taskData.assignee = taskForm.assignee;
    }
    if (taskForm.due_date) {
      taskData.due_date = taskForm.due_date;  // snake_case
    }

    const { error: insertError } = await supabase
      .from('tasks')
      .insert([taskData]);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    setShowTaskModal(false);
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      due_date: '',
    });
    await fetchTasks(selectedProject);
  } catch (err: any) {
    console.error('Error creating task:', err);
    setError(`Failed to create task: ${err.message || 'Unknown error'}`);
  }
};

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure? This will also delete all tasks in this project.')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
      
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;
      
      if (selectedProject) {
        await fetchTasks(selectedProject);
      }
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;
      
      if (selectedProject) {
        await fetchTasks(selectedProject);
      }
    } catch (err: any) {
      console.error('Error updating task:', err);
    }
  };

  const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    todo: 'bg-gray-100 text-gray-800',
    'in progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
  };   return colors[status] || 'bg-gray-100 text-gray'
 };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (!supabaseToken || !projectUrl) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Supabase Connection</p>
        <p className="text-gray-400 text-sm mt-2">Connect Supabase in Settings to use project tracker</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Project Tracker</h2>
            <p className="text-purple-100">Manage your projects and tasks</p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
                selectedProject === project.id
                  ? 'border-purple-600 shadow-lg'
                  : 'border-gray-100 hover:border-purple-300'
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {project.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{project.progress}% Complete</div>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first project to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Tasks Section */}
      {selectedProject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          <div className="p-6">
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {task.assignee && (
                            <span>Assigned to: {task.assignee}</span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks yet</p>
                <p className="text-gray-400 text-sm mt-1">Add tasks to track your work</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="planning">Planning</option>
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
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress: {projectForm.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={taskForm.assignee}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter assignee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}