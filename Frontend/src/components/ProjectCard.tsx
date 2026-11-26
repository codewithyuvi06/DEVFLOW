import { ArrowUpRight, Check, MoreHorizontal } from 'lucide-react'
import type { Project } from '../types'

export default function ProjectCard({ project, onOpen }: { project: Project; onOpen?: (project: Project) => void }) {
  return <article className="project-card">
    <div className="project-card-top">
      <div className="project-mark" style={{ '--project-color': project.color } as React.CSSProperties}>{project.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
      <button className="icon-button subtle-button" aria-label={`More options for ${project.name}`} onClick={() => window.alert(`${project.name}: project actions will be connected to the API later.`)}><MoreHorizontal size={19}/></button>
    </div>
    <button className="project-title-button" onClick={() => onOpen?.(project)}><h3>{project.name}<ArrowUpRight size={15}/></h3></button>
    <p className="project-description">{project.description}</p>
    <div className="project-status-row"><span className={`status-pill ${project.status.toLowerCase().replace(' ', '-')}`}><i/>{project.status}</span><span className="project-updated">{project.updated}</span></div>
    <div className="progress-meta"><span>Progress</span><strong>{project.progress}%</strong></div>
    <div className="progress-track"><div className="progress-fill" style={{ width: `${project.progress}%`, '--project-color': project.color } as React.CSSProperties}/></div>
    
<div className="project-card-bottom">
  <span className="task-count">
    <Check size={13} />
    {project.tasksDone} of {project.tasksTotal} tasks
  </span>

  <div className="avatar-stack">
    {project.members.slice(0, 4).map((member, i) => {
      const memberName =
        typeof member === 'string'
          ? member
          : member.name

      const initials = memberName
        .split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      return (
        <span
          className={`avatar avatar-${i}`}
          key={`${project.id}-${memberName}-${i}`}
          title={memberName}
        >
          {initials}
        </span>
      )
    })}
  </div>
</div>

  </article>
}
