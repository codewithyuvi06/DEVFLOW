
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Boxes,
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import PageHeader from '../components/PageHeader'
import ProjectCard from '../components/ProjectCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import type { Project, ProjectStatus } from '../types'
import {
  createProject as createBackendProject,
  getProjects,
  getTeams,
  type BackendProject,
  type BackendTeam,
} from '../services/projects'

function mapProject(project: BackendProject): Project {
  const members = Array.isArray(project.members)
    ? project.members.map(member =>
        typeof member === 'string'
          ? member
          : member.name || member.email || member.id || member._id || '',
      )
    : []

  return {
    id: project.id || project._id || '',
    name: project.name,
    description: project.description || '',
    color: project.color || '#8E05C2',
    status: (project.status || 'Planning') as ProjectStatus,
    progress: project.progress ?? 0,
    tasksDone: project.tasksDone ?? 0,
    tasksTotal: project.tasksTotal ?? 0,
    members,
    updated: project.updated || project.updatedAt || 'Recently',
    repo: project.repository?.fullName || 'Not linked',
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<BackendTeam[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All projects')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadProjects() {
    setLoading(true)
    setError('')

    try {
      const teamData = await getTeams()
      setTeams(teamData)

      const projectData = await getProjects()
      setProjects(projectData.map(mapProject))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load projects.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const filtered = useMemo(
    () =>
      projects.filter(
        project =>
          (project.name + project.description)
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (filter === 'All projects' || project.status === filter),
      ),
    [projects, search, filter],
  )

  async function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const description = String(data.get('description') || '').trim()

    if (!name) return

    const teamId = teams[0]?.id || teams[0]?._id

    if (!teamId) {
      setError('No workspace was found. Please reload and try again.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createBackendProject({
        name,
        description: description || 'A new project in your workspace.',
        teamId,
        color: '#8E05C2',
        status: 'Planning',
      })

      setModalOpen(false)
      await loadProjects()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create project.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="Projects"
        description="Plan work, track progress, and keep every project moving."
        action={
          <button
            className="button button-primary"
            onClick={() => {
              setError('')
              setModalOpen(true)
            }}
          >
            <Plus size={16} /> New project
          </button>
        }
      />

      {error && (
        <div className="auth-error" role="alert">
          {error}
          <button className="button" onClick={() => void loadProjects()}>
            Retry
          </button>
        </div>
      )}

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="toolbar-right">
          <div className="filter-select-wrap">
            <SlidersHorizontal size={15} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              aria-label="Filter projects"
            >
              <option>All projects</option>
              <option>On track</option>
              <option>At risk</option>
              <option>Planning</option>
            </select>
          </div>

          <div className="view-toggle">
            <button className="active" aria-label="Grid view">
              <Grid2X2 size={16} />
            </button>
            <button
              aria-label="List view"
              onClick={() =>
                window.alert('List view is planned for a future UI iteration.')
              }
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="results-line">
        <span>{loading ? 'Loading projects...' : `${filtered.length} projects`}</span>
        <span>Sorted by recently updated</span>
      </div>

      {loading ? (
        <p>Loading projects from your workspace...</p>
      ) : filtered.length ? (
        <div className="projects-grid">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={setSelectedProject}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Boxes}
          title="No projects found"
          description="Try changing your search or filters, or create a new project."
        />
      )}

      {modalOpen && (
        <Modal
          title="Create a project"
          description="Give your team a new space to make progress."
          onClose={() => {
            if (!saving) setModalOpen(false)
          }}
          onSubmit={handleCreateProject}
          submitLabel={saving ? 'Creating...' : 'Create project'}
        >
          <label className="form-label">
            Project name <span>*</span>
            <input
              className="form-input"
              name="name"
              placeholder="e.g. Mobile App"
              required
              autoFocus
              disabled={saving}
            />
          </label>

          <label className="form-label">
            Description <span className="optional">(optional)</span>
            <textarea
              className="form-input form-textarea"
              name="description"
              placeholder="What is this project about?"
              rows={3}
              disabled={saving}
            />
          </label>

          <label className="form-label">
            Workspace
            <select className="form-input" name="workspace" disabled>
              <option>
                {teams[0]?.name || 'Loading workspace...'}
              </option>
            </select>
          </label>
        </Modal>
      )}

      {selectedProject && (
        <Modal
          title={selectedProject.name}
          description={selectedProject.description}
          onClose={() => setSelectedProject(null)}
          submitLabel="Done"
          onSubmit={e => {
            e.preventDefault()
            setSelectedProject(null)
          }}
        >
          <div className="detail-summary-grid">
            <div>
              <span>Status</span>
              <strong>{selectedProject.status}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{selectedProject.progress}%</strong>
            </div>
            <div>
              <span>Tasks complete</span>
              <strong>
                {selectedProject.tasksDone} / {selectedProject.tasksTotal}
              </strong>
            </div>
            <div>
              <span>Repository</span>
              <strong>{selectedProject.repo}</strong>
            </div>
          </div>
          <p className="modal-note">
            Project information is loaded from your DEVFLOW backend.
          </p>
        </Modal>
      )}
    </div>
  )
}
