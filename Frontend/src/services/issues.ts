
import { apiRequest } from './api'

export interface BackendIssue {
  _id?: string
  id: string
  number?: number
  title: string
  description?: string
  status: 'Todo' | 'In progress' | 'In review' | 'Done'
  priority: 'Urgent' | 'High' | 'Medium' | 'Low'
  project: {
    _id?: string
    id?: string
    name: string
    color?: string
  } | string
  assignee?: {
    _id?: string
    id?: string
    name: string
    email?: string
    avatarUrl?: string
  } | null
  reporter?: {
    _id?: string
    id?: string
    name: string
    email?: string
  } | null
  dueDate?: string
  due?: string
  initials?: string
  labels?: string[]
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getIssues() {
  const response = await apiRequest<ApiResponse<BackendIssue[]>>(
    '/issues',
  )

  return response.data
}

export async function createIssue(input: {
  title: string
  projectId: string
  priority: 'Urgent' | 'High' | 'Medium' | 'Low'
  description?: string
}) {
  const response = await apiRequest<ApiResponse<BackendIssue>>(
    '/issues',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return response.data
}



export async function updateIssue(
  issueId: string,
  input: {
    status?: 'Todo' | 'In progress' | 'In review' | 'Done'
    priority?: 'Urgent' | 'High' | 'Medium' | 'Low'
  },
) {
  const response = await apiRequest<ApiResponse<BackendIssue>>(
    `/issues/${issueId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.data
}
