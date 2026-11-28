
import { apiRequest } from './api'

export interface Notification {
  _id: string
  id: string
  user: string
  team?: string
  type: 'mention' | 'assignment' | 'review' | 'invite' | 'system'
  title: string
  body: string
  link: string
  readAt?: string
  read: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getNotifications() {
  const response = await apiRequest<ApiResponse<Notification[]>>(
    '/notifications',
  )

  return response.data
}

export async function markNotificationRead(notificationId: string) {
  const response = await apiRequest<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  )

  return response.data
}

export async function markAllNotificationsRead() {
  const response = await apiRequest<ApiResponse<null>>(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
  )

  return response.data
}
