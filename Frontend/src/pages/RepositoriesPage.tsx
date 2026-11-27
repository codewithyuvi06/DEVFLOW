import { syncRepositoryPullRequests } from '../services/pullRequests'
import { useEffect, useState } from 'react'
import {Check, Code2, ExternalLink, GitBranch, GitCommitHorizontal, Plus, Search, Star,} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { apiRequest } from '../services/api'

type Repository = {
  _id: string
  id?: string
  name: string
  fullName: string
  description: string
  url: string
  defaultBranch: string
  isPrivate: boolean
  language: string
  stars: number
  updated?: string
  updatedAt?: string
}

type Team = {
  _id: string
  name: string
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export default function RepositoriesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All repositories')
  const [syncingRepoId, setSyncingRepoId] = useState('')
  const [syncingPRRepoId, setSyncingPRRepoId] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [teamId, setTeamId] = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadRepositories() {
    const response = await apiRequest<ApiResponse<Repository[]>>(
      '/repositories',
    )

    setRepos(response.data)
  }

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true)
        setError('')

        const response = await apiRequest<ApiResponse<Team[]>>('/teams')

        if (!response.data.length) {
          throw new Error('No workspace found. Create a workspace first.')
        }

        setTeamId(response.data[0]._id)

        await loadRepositories()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load repositories.',
        )
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  async function handleImport() {
    if (!teamId || importing) return

    try {
      setImporting(true)
      setError('')
      setMessage('')

      await apiRequest<ApiResponse<Repository[]>>(
        '/repositories/import',
        {
          method: 'POST',
          body: JSON.stringify({ teamId }),
        },
      )

      await loadRepositories()

      setMessage('GitHub repositories imported successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to import GitHub repositories.',
      )
    } finally {
      setImporting(false)
    }
  }

  async function handleSyncIssues(repo: Repository) {
  if (syncingRepoId) return

  try {
    setSyncingRepoId(repo._id)
    setError('')
    setMessage('')

    const response = await apiRequest<ApiResponse<unknown[]>>(
      `/repositories/${repo._id}/sync-issues`,
      {
        method: 'POST',
      },
    )

    setMessage(
      `Successfully synced ${response.data.length} GitHub issues from ${repo.name}.`,
    )
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to synchronize GitHub issues.',
    )
  } finally {
    setSyncingRepoId('')
  }
}

async function handleSyncPullRequests(repo: Repository) {
  if (syncingPRRepoId) return

  try {
    setSyncingPRRepoId(repo._id)
    setError('')
    setMessage('')

    const data = await syncRepositoryPullRequests(repo._id)

    setMessage(
      `Successfully synced ${data.length} pull requests from ${repo.name}.`,
    )
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to synchronize pull requests.',
    )
  } finally {
    setSyncingPRRepoId('')
  }
}

  const filtered = repos.filter(repo => {
    const matchesSearch =
      `${repo.name} ${repo.description} ${repo.language}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const visibility = repo.isPrivate ? 'Private' : 'Public'

    return (
      matchesSearch &&
      (filter === 'All repositories' || visibility === filter)
    )
  })

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CODE AT THE CENTER"
        title="Repositories"
        description="Your codebase, branches, and checks — all in one place."
        action={
          <button
            className="button button-primary"
            onClick={handleImport}
            disabled={importing || loading || !teamId}
          >
            <Plus size={16} />
            {importing ? 'Importing...' : 'Import repositories'}
          </button>
        }
      />

      <div className="github-connect-banner">
        <div className="github-mark">
          <GitBranch size={21} />
        </div>

        <div>
          <strong>GitHub workspace</strong>
          <p>Import repositories and bring code activity into DEVFLOW.</p>
        </div>

        <button
          className="button button-secondary"
          onClick={handleImport}
          disabled={importing || loading || !teamId}
        >
          {importing ? 'Importing...' : 'Sync GitHub'}
          <ExternalLink size={14} />
        </button>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <div className="inline-toast">
          <Check size={15} />
          {message}
        </div>
      )}

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Find a repository..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Repository visibility"
          >
            <option>All repositories</option>
            <option>Private</option>
            <option>Public</option>
          </select>
        </div>
      </div>

      <div className="repo-list">
        {loading ? (
          <p>Loading repositories...</p>
        ) : filtered.length > 0 ? (
          filtered.map(repo => (
            <article
              className="repo-row"
              key={repo._id || repo.id}
            >
              <div className="repo-icon">
                <Code2 size={19} />
              </div>

              <div className="repo-main">
                <div className="repo-title-row">
                  <h3>{repo.name}</h3>

                  <span
                    className={`visibility-pill ${
                      repo.isPrivate ? 'private' : 'public'
                    }`}
                  >
                    {repo.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>

                <p>{repo.description || 'No description provided.'}</p>

                <div className="repo-meta">
                  {repo.language && (
                    <span className="repo-language">
                      <i />
                      {repo.language}
                    </span>
                  )}

                  <span>
                    <Star size={14} />
                    {repo.stars}
                  </span>

                  <span>
                    <GitBranch size={14} />
                    {repo.defaultBranch}
                  </span>
                </div>
              </div>

              <div className="repo-side">
  <span className="repo-updated">
    <GitCommitHorizontal size={14} />
    {repo.updated
      ? new Date(repo.updated).toLocaleDateString()
      : 'Recently synced'}
  </span>

  <button
    className="button button-secondary"
    onClick={() => handleSyncIssues(repo)}
    disabled={syncingRepoId !== ''}
  >
    {syncingRepoId === repo._id ? 'Syncing...' : 'Sync Issues'}
  </button>

  <button
  className="button button-secondary"
  onClick={() => handleSyncPullRequests(repo)}
  disabled={syncingPRRepoId !== ''}
>
  {syncingPRRepoId === repo._id ? 'Syncing PRs...' : 'Sync PRs'}
</button>



  <a
    className="icon-button"
    href={repo.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Open ${repo.name} on GitHub`}
  >
    <ExternalLink size={16} />
  </a>
</div>
            </article>
          ))
        ) : (
          <EmptyState
            icon={Code2}
            title="No repositories found"
            description={
              repos.length
                ? 'Try a different search or visibility filter.'
                : 'Click Import repositories to bring your GitHub repositories into DEVFLOW.'
            }
          />
        )}
      </div>

      <div className="data-disclaimer">
        Repository information is loaded from your DEVFLOW database and synced
        with GitHub.
      </div>
    </div>
  )
}
