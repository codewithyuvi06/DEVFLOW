
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  Target,
  Search,
  Users,
  UserPlus,
  LoaderCircle,
  AlertCircle,
  FolderGit2,
} from 'lucide-react'

import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { getActivities, type ActivityItem, type ActivityType } from '../services/activity'

const iconByType = {
  project: Target,
  issue: CircleDot,
  repository: GitCommitHorizontal,
  pull_request: GitPullRequest,
  team: Users,
  member: UserPlus,
} satisfies Record<ActivityType, typeof Activity>

const filters = [
  { label: 'Everything', value: 'Everything' },
  { label: 'Projects', value: 'project' },
  { label: 'Issues', value: 'issue' },
  { label: 'Repositories', value: 'repository' },
  { label: 'Pull Requests', value: 'pull_request' },
  { label: 'Teams', value: 'team' },
  { label: 'Members', value: 'member' },
]

function getInitials(name?: string) {
  if (!name) return 'U'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatActivityTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getActivityLabel(type: ActivityType) {
  const labels: Record<ActivityType, string> = {
    project: 'Project update',
    issue: 'Issue update',
    repository: 'Repository update',
    pull_request: 'Pull request',
    team: 'Team update',
    member: 'Member update',
  }

  return labels[type]
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Everything')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadActivities() {
      try {
        setLoading(true)
        setError('')

        const response = await getActivities()

        if (active) {
          setActivities(response.data)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load activity.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadActivities()

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return activities.filter(item => {
      const actorName = item.actor?.name ?? ''

      const matchesSearch = [
        actorName,
        item.action,
        item.target,
        item.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)

      const matchesFilter =
        filter === 'Everything' || item.type === filter

      return matchesSearch && matchesFilter
    })
  }, [activities, search, filter])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TEAM PULSE"
        title="Activity"
        description="A running timeline of the work happening across your workspace."
      />

      <div className="activity-filter-bar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search activity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {filters.map(item => (
            <button
              key={item.value}
              className={filter === item.value ? 'active' : ''}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-timeline-panel">
        <div className="timeline-date">
          <span />
          LATEST ACTIVITY
        </div>

        {loading && (
          <div className="activity-loading">
            <LoaderCircle size={22} className="spin" />
            <p>Loading activity...</p>
          </div>
        )}

        {!loading && error && (
          <div className="activity-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.map((item, index) => {
          const Icon = iconByType[item.type]
          const actorName = item.actor?.name ?? 'Unknown user'

          return (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-rail">
                <div className={`timeline-icon ${item.type}`}>
                  <Icon size={16} />
                </div>

                {index < filtered.length - 1 && (
                  <div className="timeline-line" />
                )}
              </div>

              <div className="timeline-card">
                <div className="timeline-card-top">
                  <div className="avatar avatar-user">
                    {getInitials(actorName)}
                  </div>

                  <div className="timeline-copy">
                    <p>
                      <strong>{actorName}</strong>{' '}
                      {item.action}{' '}
                      <span>{item.target}</span>
                    </p>

                    <span>{formatActivityTime(item.time)}</span>
                  </div>
                </div>

                <div className="timeline-tag">
                  {getActivityLabel(item.type)}
                </div>
              </div>
            </div>
          )
        })}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Activity}
            title="Nothing to see here"
            description={
              activities.length === 0
                ? 'No activity has been recorded yet.'
                : 'No activity matches your current filters.'
            }
          />
        )}
      </div>
    </div>
  )
}
