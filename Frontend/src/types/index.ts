export type ProjectStatus = 'On track' | 'At risk' | 'Planning'
export type IssueStatus = 'In progress' | 'Todo' | 'In review' | 'Done'
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low'

export interface Project {
  id: string
  name: string
  description: string
  color: string
  status: ProjectStatus
  progress: number
  tasksDone: number
  tasksTotal: number
  members: Array<
  | string
  | {
      _id?: string
      id?: string
      name: string
      email?: string
    }
>
  updated: string
  repo: string
}

export interface Issue {
  id: string
  backendId: string
  title: string
  project: string
  status: IssueStatus
  priority: Priority
  assignee: string
  initials: string
  due: string
}

export interface ActivityItem {
  id: string
  actor: string
  initials: string
  action: string
  target: string
  time: string
  type: 'commit' | 'issue' | 'review' | 'project'
}
