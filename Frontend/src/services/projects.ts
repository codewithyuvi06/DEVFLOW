
import { apiRequest } from './api'

export interface BackendProject {
  _id?: string
  id: string
  name: string
  description?: string
  color?: string
  status?: string
  progress?: number
  tasksTotal?: number
  tasksDone?: number
  updated?: string
  updatedAt?: string
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

export interface BackendTeam {
  _id?: string
  id: string
  name: string
  slug?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getTeams() {
  const response = await apiRequest<ApiResponse<BackendTeam[]>>('/teams')
  return response.data
}

export async function getProjects(teamId?: string) {
  const endpoint = teamId
    ? `/projects?teamId=${encodeURIComponent(teamId)}`
    : '/projects'

  const response =
    await apiRequest<ApiResponse<BackendProject[]>>(endpoint)

  return response.data
}

export async function createProject(input: {
  name: string
  description: string
  teamId: string
  color: string
  status: 'Planning' | 'On track' | 'At risk'
}) {
  const response = await apiRequest<ApiResponse<BackendProject>>(
    '/projects',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return response.data
}
