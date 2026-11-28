
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

export interface PullRequestReview {
  _id: string
  reviewer: string
  state: string
  body: string
  submittedAt?: string
  url: string
}

export interface PullRequestComment {
  _id: string
  commenter: string
  body: string
  path: string
  line: number | null
  commentType: 'review' | 'conversation'
  createdAtGitHub?: string
  url: string
}

interface PullRequestDetailsResponse {
  success: boolean
  message: string
  data: {
    reviews: PullRequestReview[]
    comments: PullRequestComment[]
    reviewers: string[]
  }
}

export async function syncPullRequestDetails(pullRequestId: string) {
  const response = await apiRequest<PullRequestDetailsResponse>(
    `/pull-requests/${pullRequestId}/sync-details`,
    { method: 'POST' },
  )

  return response.data
}

export interface PullRequestCheck {
  _id: string
  githubId: string
  name: string
  status: string
  conclusion: string
  detailsUrl: string
  startedAt?: string
  completedAt?: string
}

interface PullRequestChecksResponse {
  success: boolean
  message: string
  data: {
    checks: PullRequestCheck[]
    total: number
  }
}

export async function syncPullRequestChecks(pullRequestId: string) {
  const response = await apiRequest<PullRequestChecksResponse>(
    `/pull-requests/${pullRequestId}/sync-checks`,
    { method: 'POST' },
  )

  return response.data
}