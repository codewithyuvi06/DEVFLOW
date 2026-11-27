
import { apiRequest } from './api'

export interface BackendPullRequest {
  _id: string
  id: string
  githubId: string
  number: number
  title: string
  body?: string
  state: 'open' | 'closed' | 'merged'
  author: string
  url: string
  baseBranch: string
  headBranch: string
  repository: {
    _id: string
    name: string
    fullName: string
    url: string
  } | string
  syncedAt?: string
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getPullRequests() {
  const response = await apiRequest<ApiResponse<BackendPullRequest[]>>(
    '/pull-requests',
  )

  return response.data
}

export async function syncRepositoryPullRequests(repositoryId: string) {
  const response = await apiRequest<ApiResponse<BackendPullRequest[]>>(
    `/repositories/${repositoryId}/sync-pull-requests`,
    {
      method: 'POST',
    },
  )

  return response.data
}
