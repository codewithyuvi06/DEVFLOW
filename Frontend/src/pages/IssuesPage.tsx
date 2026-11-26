
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CircleDot, Plus, Search, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { getProjects } from '../services/projects'
import {
  createIssue as createBackendIssue,
  getIssues,
  updateIssue as updateBackendIssue,
  type BackendIssue,
} from '../services/issues'
import type {
  Issue,
  IssueStatus,
  Priority,
  Project,
} from '../types'

interface ProjectOption {
  id: string
  name: string
  color: string
}

function mapBackendIssue(issue: BackendIssue): Issue {
  const project =
    typeof issue.project === 'string'
      ? issue.project
      : issue.project?.name || 'Unknown project'

  const assignee =
    typeof issue.assignee === 'object' && issue.assignee
      ? issue.assignee.name
      : 'Unassigned'

  const dueValue = issue.dueDate || issue.due

  let due = 'Unscheduled'

  if (dueValue) {
    const parsedDate = new Date(dueValue)

    if (!Number.isNaN(parsedDate.getTime())) {
      due = parsedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
  }

  return {
    backendId: issue._id || issue.id,
    id: issue.number
      ? `DEV-${issue.number}`
      : `DEV-${issue.id.slice(-6).toUpperCase()}`,
    title: issue.title,
    project,
    status: issue.status,
    priority: issue.priority,
    assignee,
    initials:
      issue.initials ||
      (assignee === 'Unassigned'
        ? '—'
        : assignee
            .split(' ')
            .map(part => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()),
    due,
  }
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [priority, setPriority] = useState('All priorities')
  const [modalOpen, setModalOpen] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [backendIssues, backendProjects] = await Promise.all([
        getIssues(),
        getProjects(),
      ])

      setIssues(backendIssues.map(mapBackendIssue))

      setProjects(
        backendProjects.map(project => ({
  id: project.id,
  name: project.name,
  color: project.color || '#8E05C2',
})),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load issues.',
      )
    } finally {
      setLoading(false)
    }
  }

  
async function handleStatusChange(
  issue: Issue,
  newStatus: Issue['status'],
) {
  try {
    await updateBackendIssue(issue.backendId, {
      status: newStatus,
    })

    await loadData()
  } catch (error) {
    console.error('Failed to update issue status:', error)
    alert('Could not update issue status. Please try again.')
  }
}


  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(
    () =>
      issues.filter(
        issue =>
          `${issue.id} ${issue.title} ${issue.project} ${issue.assignee}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === 'All statuses' || issue.status === status) &&
          (priority === 'All priorities' || issue.priority === priority),
      ),
    [issues, search, status, priority],
  )

  async function handleCreateIssue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (creating) return

    const form = e.currentTarget
    const data = new FormData(form)

    const title = String(data.get('title') || '').trim()
    const projectId = String(data.get('projectId') || '')
    const selectedPriority = String(data.get('priority') || 'Medium') as Priority

    if (title.length < 2 || !projectId) {
      setError(
        !projectId
          ? 'Create a project before creating an issue.'
          : 'Issue title must contain at least 2 characters.',
      )
      return
    }

    setCreating(true)
    setError('')

    try {
      await createBackendIssue({
        title,
        projectId,
        priority: selectedPriority,
      })

      setModalOpen(false)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create the issue.',
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PLAN & TRACK"
        title="Issues"
        description="A clear view of what's moving, what's blocked, and what comes next."
        action={
          <button
            className="button button-primary"
            onClick={() => {
              setError('')
              setModalOpen(true)
            }}
          >
            <Plus size={16} /> Create issue
          </button>
        }
      />

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="issue-summary-strip">
        <div>
          <span className="summary-dot dot-violet" />
          <strong>{issues.filter(i => i.status !== 'Done').length}</strong>
          <span>Open</span>
        </div>
        <div>
          <span className="summary-dot dot-blue" />
          <strong>{issues.filter(i => i.status === 'In progress').length}</strong>
          <span>In progress</span>
        </div>
        <div>
          <span className="summary-dot dot-orange" />
          <strong>{issues.filter(i => i.priority === 'Urgent').length}</strong>
          <span>Urgent</span>
        </div>
        <div>
          <span className="summary-dot dot-green" />
          <strong>{issues.filter(i => i.status === 'Done').length}</strong>
          <span>Completed</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-right">
          <div className="filter-select-wrap">
            <SlidersHorizontal size={15} />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              aria-label="Filter status"
            >
              <option>All statuses</option>
              <option>Todo</option>
              <option>In progress</option>
              <option>In review</option>
              <option>Done</option>
            </select>
          </div>

          <div className="filter-select-wrap">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              aria-label="Filter priority"
            >
              <option>All priorities</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-topline">
          <span>
            Showing <strong>{filtered.length}</strong> issues
          </span>
          <span>
            {loading ? 'Loading...' : 'Synced with backend'}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading issues...
          </div>
        ) : filtered.length ? (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due date</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(issue => {
                  const projectColor =
                    projects.find(p => p.name === issue.project)?.color ||
                    '#8E05C2'

                  return (
                    <tr key={issue.id}>
                      <td>
                        <div className="issue-title-cell">
                          <CircleDot size={16} className="issue-circle" />
                          <div>
                            <span>{issue.id}</span>
                            <strong>{issue.title}</strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="project-cell">
                          <i style={{ background: projectColor }} />
                          {issue.project}
                        </span>
                      </td>

                      <td>
                        
<select
  className="status-select"
  value={issue.status}
  onChange={(event) =>
    handleStatusChange(
      issue,
      event.target.value as Issue['status'],
    )
  }
>
  <option value="Todo">Todo</option>
  <option value="In progress">In progress</option>
  <option value="In review">In review</option>
  <option value="Done">Done</option>
</select>

                      </td>

                      <td>
                        
<select
  className={`priority-label priority-text-${issue.priority.toLowerCase()}`}
  value={issue.priority}
  onChange={(event) =>
    updateBackendIssue(issue.backendId, {
      priority: event.target.value as Priority,
    }).then(() => loadData()).catch((error) => {
      console.error('Failed to update issue priority:', error)
      alert('Could not update issue priority.')
    })
  }
>
  <option value="Urgent">Urgent</option>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
</select>

                      </td>

                      <td>
                        <div className="assignee-cell">
                          <span className="avatar avatar-user">
                            {issue.initials}
                          </span>
                          <span>{issue.assignee}</span>
                        </div>
                      </td>

                      <td className={issue.due === 'Today' ? 'due-today' : ''}>
                        {issue.due}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CircleDot}
            title="No issues match"
            description={
              issues.length
                ? 'Try adjusting your search or filters.'
                : 'Create your first issue to start tracking work.'
            }
          />
        )}
      </div>

      {modalOpen && (
        <Modal
          title="Create an issue"
          description="Capture a task, bug, or idea for your team."
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateIssue}
          submitLabel={creating ? 'Creating...' : 'Create issue'}
        >
          <label className="form-label">
            Issue title <span>*</span>
            <input
              className="form-input"
              name="title"
              placeholder="What needs to be done?"
              minLength={2}
              maxLength={180}
              required
              autoFocus
            />
          </label>

          <label className="form-label">
            Project <span>*</span>
            <select
              className="form-input"
              name="projectId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Priority
            <select className="form-input" name="priority" defaultValue="Medium">
              <option>Medium</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </label>
        </Modal>
      )}
    </div>
  )
}
