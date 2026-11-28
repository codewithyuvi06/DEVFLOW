
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, CircleDot, Clock3, GitCommitHorizontal, GitPullRequest, Plus, Sparkles, Target, TrendingUp, Zap, } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import ProjectCard from '../components/ProjectCard'
import { getIssues } from '../services/issues'
import type { BackendIssue } from '../services/issues'
import { getDashboard } from '../services/dashboard'
import type {
  DashboardActivity,
  DashboardProject,
  DashboardStats,
  DashboardRange,
} from '../services/dashboard'

export default function DashboardPage() {
  const [range, setRange] = useState<DashboardRange>('7days')
  const [toast, setToast] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<DashboardProject[]>([])
  const [activities, setActivities] = useState<DashboardActivity[]>([])
  const [issues, setIssues] = useState<BackendIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [response, issueData] = await Promise.all([
          getDashboard(range),
          getIssues(),
        ])

        if (!cancelled) {
          if (!response.success || !response.data) {
            throw new Error('The dashboard response was incomplete.')
          }

          setStats(response.data.stats)
          setProjects(response.data.projects ?? [])
          setActivities(response.data.activity ?? [])
          setIssues(issueData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load dashboard data.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [range])

  const handleOpenProject = (project: DashboardProject) => {
    setToast(`${project.name} selected — open its full workspace from Projects.`)
  }

  const recentActivities = activities

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title={
          <>
            Good morning, Yubaraj <span className="wave">✦</span>
          </>
        }
        description="Here's what's happening across your workspace today."
        rightNote="Workspace overview"
        action={
          <button
            className="button button-primary"
            onClick={() =>
              setToast('Use the Projects page to create and manage projects.')
            }
          >
            <Plus size={16} /> New project
          </button>
        }
      />

      {toast && (
        <div className="inline-toast">
          <Sparkles size={15} />
          {toast}
          <button onClick={() => setToast('')}>Dismiss</button>
        </div>
      )}

      {error && (
        <div className="inline-toast" role="alert">
          Dashboard API error: {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          label="Total projects"
          value={loading ? '—' : String(stats?.projects ?? 0)}
          change="Live data"
          icon={Target}
          tone="purple"
          caption="Active workspace projects"
        />
        <StatCard
          label="Open issues"
          value={loading ? '—' : String(stats?.openIssues ?? 0)}
          change="Live data"
          icon={CircleDot}
          tone="blue"
          caption={`${stats?.doneIssues ?? 0} completed issues`}
        />
        <StatCard
          label="Total issues"
          value={loading ? '—' : String(stats?.issues ?? 0)}
          change="Live data"
          icon={GitPullRequest}
          tone="pink"
          caption="Across your workspace"
        />
        <StatCard
          label="Notifications"
          value={loading ? '—' : String(stats?.unreadNotifications ?? 0)}
          change="Live data"
          icon={Zap}
          tone="orange"
          caption="Unread notifications"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel sprint-panel">
          <div className="panel-header">
            <div>
              <div className="panel-kicker">
                <span className="live-dot" /> WORKSPACE STATUS
              </div>
              <h2>{loading ? 'Loading your workspace…' : 'Ship it, together.'}</h2>
              <p>
                {loading
                  ? 'Fetching data from your backend.'
                  : 'Your workspace, connected to live data.'}
              </p>
            </div>
          </div>

          <div className="sprint-progress-wrap">
            <div className="sprint-progress-ring">
              <svg viewBox="0 0 120 120" aria-label="Project progress">
                <circle cx="60" cy="60" r="49" className="ring-track" />
                <circle
                  cx="60"
                  cy="60"
                  r="49"
                  className="ring-value"
                  style={{
                    strokeDasharray: `${(projects.length
                      ? projects.reduce((sum, project) => sum + project.progress, 0) /
                        projects.length
                      : 0) * 3.078} 308`,
                  }}
                />
              </svg>
              <div className="ring-center">
                <strong>
                  {projects.length
                    ? Math.round(
                        projects.reduce(
                          (sum, project) => sum + project.progress,
                          0,
                        ) / projects.length,
                      )
                    : 0}
                  <span>%</span>
                </strong>
                <small>avg. progress</small>
              </div>
            </div>

            <div className="sprint-stats">
              <div>
                <span className="sprint-stat-dot purple-dot" />
                <span>Projects loaded</span>
                <strong>{projects.length}</strong>
              </div>
              <div>
                <span className="sprint-stat-dot gray-dot" />
                <span>Open issues</span>
                <strong>{stats?.openIssues ?? 0}</strong>
              </div>
              <div>
                <span className="sprint-stat-dot light-dot" />
                <span>Completed issues</span>
                <strong>{stats?.doneIssues ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="sprint-footer">
            <div className="sprint-team">
              <span>Live workspace overview</span>
            </div>
            <span className="days-left">
              <Clock3 size={14} /> DEVFLOW
            </span>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading-row">
            <div>
              <h2>Recent activity</h2>
              <p>Latest updates from your team</p>
            </div>
            <Link to="/activity" className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="activity-list compact">
            {loading ? (
              <p>Loading activity…</p>
            ) : recentActivities.length > 0 ? (
              recentActivities.slice(0, 4).map((item) => {
                const actor =
                  typeof item.actor === 'string'
                    ? item.actor
                    : item.actor?.name ?? 'A teammate'

                return (
                  <div className="activity-row" key={item.id}>
                    <div className={`activity-symbol ${item.type}`}>
                      {item.type === 'commit' ? (
                        <GitCommitHorizontal size={15} />
                      ) : item.type === 'review' ? (
                        <GitPullRequest size={15} />
                      ) : item.type === 'issue' ? (
                        <CircleDot size={15} />
                      ) : (
                        <Target size={15} />
                      )}
                    </div>
                    <div className="activity-copy">
                      <p>
                        <strong>{actor}</strong> {item.action}{' '}
                        <span>{item.target}</span>
                      </p>
                      <span>
                        {typeof item.time === 'string'
                          ? item.time
                          : new Date(item.time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p>No activity yet. Your workspace updates will appear here.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Your projects</h2>
            <p>Keep track of the work that moves you forward.</p>
          </div>
          <div className="section-actions">
            <div className="segmented-control">
  {(
    [
      { label: '7 days', value: '7days' },
      { label: '30 days', value: '30days' },
      { label: 'All time', value: 'all' },
    ] as const
  ).map((item) => (
    <button
      key={item.value}
      className={range === item.value ? 'selected' : ''}
      onClick={() => setRange(item.value)}
    >
      {item.label}
    </button>
  ))}
</div>
            <Link to="/projects" className="text-link">
              All projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading projects…</p>
        ) : projects.length > 0 ? (
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project as never}
                onOpen={() => handleOpenProject(project)}
              />
            ))}
          </div>
        ) : (
          <div className="panel">
            <p>No projects found in this workspace yet.</p>
          </div>
        )}
      </section>

      <section className="dashboard-grid bottom-grid">
        <div className="panel tasks-panel">
          <div className="panel-heading-row">
            <div>
              <h2>Priority issues</h2>
              <p>Issues that need your attention</p>
            </div>
            <Link to="/issues" className="text-link">
              All issues <ArrowRight size={14} />
            </Link>
          </div>
          <div className="issue-mini-list">
  {issues
    .filter(
      (issue) =>
        issue.priority === 'Urgent' || issue.priority === 'High',
    )
    .sort((a, b) => {
      const priorityOrder: Record<BackendIssue['priority'], number> = {
        Urgent: 0,
        High: 1,
        Medium: 2,
        Low: 3,
      }

      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 4)
    .map((issue) => (
      <div className="issue-mini-row" key={issue.id}>
        <span
          className={`priority-mark priority-${issue.priority.toLowerCase()}`}
        />
        <div className="issue-mini-copy">
          <span>{issue.id}</span>
          <strong>{issue.title}</strong>
        </div>
        <span
          className={`issue-status status-${issue.status.toLowerCase().replace(' ', '-')}`}
        >
          {issue.status}
        </span>
      </div>
    ))}
</div>
        </div>

        <div className="panel insights-panel">
          <div className="insight-art">
            <div className="insight-orb orb-one" />
            <div className="insight-orb orb-two" />
            <div className="insight-grid-lines" />
          </div>
          <div className="insight-content">
            <div className="insight-badge">
              <Sparkles size={13} /> WORKSPACE INSIGHT
            </div>
            <h2>Your workspace is connected.</h2>
            <p>
              Dashboard statistics, projects, and activity now load from your
              backend.
            </p>
            <div className="insight-metric">
              <TrendingUp size={17} />
              <strong>{stats?.doneIssues ?? 0}</strong>
              <span>completed issues</span>
            </div>
            <button
              className="insight-link"
              onClick={() =>
                setToast('More analytics can be added after the core integration.')
              }
            >
              Explore insights <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
