export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  due_date: string | null
  progress: number
  created_at: string
  updated_at: string
}
