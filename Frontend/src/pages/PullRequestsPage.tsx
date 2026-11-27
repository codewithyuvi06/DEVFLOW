
import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  GitPullRequest,
  Search,
  ShieldAlert,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import {
  getPullRequests,
  type BackendPullRequest,
} from '../services/pullRequests'

export default function PullRequestsPage() {
  const [pullRequests, setPullRequests] = useState<BackendPullRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPullRequests() {
      try {
        setLoading(true)
        setError('')

        const data = await getPullRequests()
        setPullRequests(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load pull requests.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPullRequests()
  }, [])

  const items = useMemo(() => {
    return pullRequests.filter(pr => {
      const repoName =
        typeof pr.repository === 'string'
          ? pr.repository
          : pr.repository.fullName

      const matchesSearch = `${pr.title} ${repoName} ${pr.author} #${pr.number}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFilter = filter === 'all' || pr.state === filter

      return matchesSearch && matchesFilter
    })
  }, [pullRequests, search, filter])

  const openCount = pullRequests.filter(pr => pr.state === 'open').length
  const closedCount = pullRequests.filter(pr => pr.state === 'closed').length
  const mergedCount = pullRequests.filter(pr => pr.state === 'merged').length

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="COLLABORATE & REVIEW"
        title="Pull requests"
        description="Review changes, follow pull request activity, and keep quality high."
      />

      <div className="pr-summary-grid">
        <div className="pr-summary-card">
          <GitPullRequest size={18} />
          <span>Open pull requests</span>
          <strong>{openCount}</strong>
        </div>

        <div className="pr-summary-card">
          <CheckCircle2 size={18} />
          <span>Merged pull requests</span>
          <strong>{mergedCount}</strong>
        </div>

        <div className="pr-summary-card">
          <ShieldAlert size={18} />
          <span>Closed pull requests</span>
          <strong>{closedCount}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search pull requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Filter pull requests"
          >
            <option value="all">All pull requests</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="merged">Merged</option>
          </select>
        </div>
      </div>

      {error && <div className="inline-toast">{error}</div>}

      <div className="pr-list">
        {loading ? (
          <div className="empty-state">
            Loading pull requests...
          </div>
        ) : items.map(pr => {
          const repoName =
            typeof pr.repository === 'string'
              ? pr.repository
              : pr.repository.fullName

          const updatedDate = pr.updatedAt || pr.syncedAt

          return (
            <article className="pr-row" key={pr._id}>
              <div className="pr-icon">
                <GitPullRequest size={20} />
              </div>

              <div className="pr-main">
                <div className="pr-title-line">
                  <h3>{pr.title}</h3>

                  <span
                    className={`pr-state state-${pr.state}`}
                  >
                    {pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
                  </span>
                </div>

                <div className="pr-meta">
                  <span className="pr-number">#{pr.number}</span>
                  <span>in <strong>{repoName}</strong></span>
                  <span>opened by <strong>{pr.author}</strong></span>

                  {updatedDate && (
                    <span>
                      Updated {new Date(updatedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="pr-checks">
                  <span>
                    {pr.headBranch} → {pr.baseBranch}
                  </span>
                </div>
              </div>

              <a
                className="button button-secondary review-button"
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Review <span>↗</span>
              </a>
            </article>
          )
        })}

        {!loading && !error && !items.length && (
          <EmptyState
            icon={GitPullRequest}
            title="No pull requests found"
            description="Try another search or status filter, or sync pull requests from your repositories."
          />
        )}
      </div>

      <div className="data-disclaimer">
        Pull request information is synchronized from your connected GitHub repositories.
        Open the original pull request on GitHub to view reviews, checks, and comments.
      </div>
    </div>
  )
}
