
import { apiRequest } from './api'

export interface DashboardStats {
  projects: number
  issues: number
  openIssues: number
  doneIssues: number
  unreadNotifications: number
}

export interface DashboardProject {
  id: string
  name: string
  description?: string
  status?: string
  progress: number
  tasksTotal: number
  tasksDone: number
  updated: string
  members?: Array<{
    _id?: string
    id?: string
    name: string
    email: string
  }>
  repository?: {
    fullName?: string
    url?: string
  } | null
}

export interface DashboardActivity {
  id: string
  action: string
  target: string
  type: string
  time: string
  actor?: {
    name?: string
    avatarUrl?: string
  } | null
}

export interface DashboardData {
  stats: DashboardStats
  projects: DashboardProject[]
  activity: DashboardActivity[]
}

interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardData
}

export function getDashboard() {
  return apiRequest<DashboardResponse>('/dashboard')
}
