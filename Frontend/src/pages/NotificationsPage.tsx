
import { useEffect, useState } from 'react'
import {
  Bell,
  AtSign,
  UserCheck,
  GitPullRequest,
  Users,
  Info,
  CheckCheck,
  LoaderCircle,
  AlertCircle,
  Inbox,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '../services/notifications'

const notificationIcons = {
  mention: AtSign,
  assignment: UserCheck,
  review: GitPullRequest,
  invite: Users,
  system: Info,
} satisfies Record<Notification['type'], typeof Bell>

function formatNotificationTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function NotificationsPage() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      try {
        setLoading(true)
        setError('')

        const response = await getNotifications()

        if (active) {
          setNotifications(response)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load notifications.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      active = false
    }
  }, [])

  const unreadCount = notifications.filter(
    notification => !notification.read,
  ).length

  async function handleMarkRead(notification: Notification) {
    if (notification.read || updating) {
      if (notification.link) navigate(notification.link)
      return
    }

    try {
      setUpdating(true)

      await markNotificationRead(notification.id)

      setNotifications(current =>
        current.map(item =>
          item.id === notification.id
            ? { ...item, read: true, readAt: new Date().toISOString() }
            : item,
        ),
      )

      if (notification.link) {
        navigate(notification.link)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update notification.',
      )
    } finally {
      setUpdating(false)
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || updating) return

    try {
      setUpdating(true)

      await markAllNotificationsRead()

      setNotifications(current =>
        current.map(item => ({
          ...item,
          read: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to mark all notifications as read.',
      )
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="WORKSPACE UPDATES"
        title="Notifications"
        description="Stay updated with mentions, assignments, reviews and workspace activity."
      />

      <div className="activity-filter-bar">
        <div>
          <strong>{unreadCount}</strong>{' '}
          unread {unreadCount === 1 ? 'notification' : 'notifications'}
        </div>

        <button
          className="button button-secondary"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || updating}
        >
          <CheckCheck size={16} />
          Mark all as read
        </button>
      </div>

      <div className="activity-timeline-panel">
        <div className="timeline-date">
          <span />
          ALL NOTIFICATIONS
        </div>

        {loading && (
          <div className="activity-loading">
            <LoaderCircle size={22} className="spin" />
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && error && (
          <div className="activity-error" role="alert">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="activity-list">
            {notifications.map(notification => {
              const Icon = notificationIcons[notification.type]

              return (
                <button
                  type="button"
                  className={`notification-row ${notification.read ? 'read' : 'unread'}`}
                  key={notification.id}
                  onClick={() => handleMarkRead(notification)}
                  disabled={updating}
                >
                  <div className={`timeline-icon ${notification.type}`}>
                    <Icon size={17} />
                  </div>

                  <div className="activity-copy">
                    <p>
                      <strong>{notification.title}</strong>
                    </p>

                    {notification.body && <p>{notification.body}</p>}

                    <span>
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>

                  {!notification.read && (
                    <span className="notification-unread-dot" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="You're all caught up"
            description="New workspace notifications will appear here."
          />
        )}
      </div>
    </div>
  )
}
