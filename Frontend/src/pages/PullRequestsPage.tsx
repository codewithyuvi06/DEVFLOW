
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, GitPullRequest, Search, ShieldAlert,} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { getPullRequests, syncPullRequestDetails, syncPullRequestChecks, type BackendPullRequest, type PullRequestReview, type PullRequestComment, type PullRequestCheck, } from '../services/pullRequests'

export default function PullRequestsPage() {
  const [pullRequests, setPullRequests] = useState<BackendPullRequest[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPR, setSelectedPR] = useState<string | null>(null)
  const [reviews, setReviews] = useState<PullRequestReview[]>([])
  const [comments, setComments] = useState<PullRequestComment[]>([])
  const [reviewers, setReviewers] = useState<string[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [checks, setChecks] = useState<PullRequestCheck[]>([])
  const [checksLoading, setChecksLoading] = useState(false)
  const [checksError, setChecksError] = useState('')

  async function handleSyncDetails(prId: string) {
  try {
    setSelectedPR(prId)
    setDetailsLoading(true)
    setDetailsError('')

    const data = await syncPullRequestDetails(prId)

    setReviews(data.reviews)
    setComments(data.comments)
    setReviewers(data.reviewers)
  } catch (err) {
    setDetailsError(
      err instanceof Error
        ? err.message
        : 'Unable to load review details.',
    )
  } finally {
    setDetailsLoading(false)
  }
}

async function handleSyncChecks(prId: string) {
  try {
    setSelectedPR(prId)
    setChecksLoading(true)
    setChecksError('')

    const data = await syncPullRequestChecks(prId)
    
    setChecks(data.checks)
  } catch (err) {
    setChecksError(
      err instanceof Error
        ? err.message
        : 'Unable to load CI checks.',
    )
  } finally {
    setChecksLoading(false)
  }
}

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

              <button
                className="button button-secondary"
                onClick={() => handleSyncDetails(pr._id)}
                disabled={detailsLoading}
              >
                {detailsLoading && selectedPR === pr._id
                  ? 'Syncing...'
                  : 'Sync Reviews'}
              </button>

              <button
                className="button button-secondary"
                onClick={() => handleSyncChecks(pr._id)}
                disabled={checksLoading}
              >
                {checksLoading && selectedPR === pr._id
                  ? 'Syncing...'
                  : 'Sync Checks'}
              </button>

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

      {selectedPR && (
  <div className="pr-details-panel">
    <h2>Pull Request Reviews</h2>

    {detailsLoading ? (
      <p>Loading review details...</p>
    ) : detailsError ? (
      <div className="inline-toast">{detailsError}</div>
    ) : (
      <>
        <div>
          <h3>Reviewers</h3>
          {reviewers.length ? (
            reviewers.map(reviewer => (
              <span key={reviewer}>{reviewer} </span>
            ))
          ) : (
            <p>No reviewers found.</p>
          )}
        </div>

        <div>
          <h3>Reviews</h3>
          {reviews.length ? (
            reviews.map(review => (
              <article key={review._id}>
                <strong>{review.reviewer}</strong>
                <span> — {review.state}</span>
                <p>{review.body || 'No review message.'}</p>
                <a href={review.url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </article>
            ))
          ) : (
            <p>No reviews found.</p>
          )}
        </div>

        <div>
          <h3>Comments</h3>
          {comments.length ? (
            comments.map(comment => (
              <article key={comment._id}>
                <strong>{comment.commenter}</strong>
                <p>{comment.body}</p>
                {comment.path && <p>File: {comment.path}</p>}
                <a href={comment.url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </article>
            ))
          ) : (
            <p>No comments found.</p>
          )}
        </div>
      </>
    )}
  </div>
)}

      <div className="data-disclaimer">
        Pull request information is synchronized from your connected GitHub repositories.
        Open the original pull request on GitHub to view reviews, checks, and comments.
      </div>
    </div>
  )
}
