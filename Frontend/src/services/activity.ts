
import { apiRequest } from './api'

export type ActivityType =
  | 'project'
  | 'issue'
  | 'repository'
  | 'pull_request'
  | 'team'
  | 'member'

export interface ActivityItem {
  id: string
  team: string
  actor: {
    name?: string
    avatarUrl?: string
  } | null
  type: ActivityType
  action: string
  target: string
  targetId?: string
  metadata?: Record<string, unknown>
  time: string
}

interface ActivityResponse {
  success: boolean
  message: string
  data: ActivityItem[]
}

export function getActivities(limit = 50) {
  return apiRequest<ActivityResponse>(`/activity?limit=${limit}`)
}
