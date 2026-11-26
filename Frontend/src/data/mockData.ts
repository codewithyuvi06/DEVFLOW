import type { ActivityItem, Issue, Project } from '../types'

export const projectsSeed: Project[] = [
  { id: 'PRJ-01', name: 'Nexus Platform', description: 'A unified space for teams to plan, build, and ship better software.', color: '#8E05C2', status: 'On track', progress: 78, tasksDone: 42, tasksTotal: 54, members: ['YC', 'AM', 'SK', 'RD'], updated: '12 min ago', repo: 'nexus-platform' },
  { id: 'PRJ-02', name: 'Pulse Analytics', description: 'Product analytics and insight dashboards for modern teams.', color: '#4F46E5', status: 'At risk', progress: 46, tasksDone: 18, tasksTotal: 39, members: ['AM', 'RD', 'PK'], updated: '38 min ago', repo: 'pulse-analytics' },
  { id: 'PRJ-03', name: 'Orbit UI Kit', description: 'A reusable, accessible component system for our products.', color: '#0D9488', status: 'On track', progress: 91, tasksDone: 32, tasksTotal: 35, members: ['YC', 'SK', 'PK'], updated: '1 hour ago', repo: 'orbit-ui' },
  { id: 'PRJ-04', name: 'Launchpad API', description: 'Reliable APIs and integrations that power the developer experience.', color: '#EA580C', status: 'Planning', progress: 12, tasksDone: 3, tasksTotal: 26, members: ['RD', 'AM'], updated: 'Yesterday', repo: 'launchpad-api' },
]

export const issuesSeed: Issue[] = [
  { id: 'DEV-142', title: 'Fix session refresh on expired tokens', project: 'Nexus Platform', status: 'In progress', priority: 'Urgent', assignee: 'Yubaraj Chanda', initials: 'YC', due: 'Today' },
  { id: 'DEV-139', title: 'Add keyboard navigation to command menu', project: 'Orbit UI Kit', status: 'In review', priority: 'High', assignee: 'Ananya Mukherjee', initials: 'AM', due: 'Today' },
  { id: 'DEV-137', title: 'Optimize analytics query performance', project: 'Pulse Analytics', status: 'Todo', priority: 'High', assignee: 'Rohan Das', initials: 'RD', due: 'Oct 28' },
  { id: 'DEV-133', title: 'Create repository connection empty state', project: 'Nexus Platform', status: 'In progress', priority: 'Medium', assignee: 'Soham Kumar', initials: 'SK', due: 'Oct 29' },
  { id: 'DEV-128', title: 'Document API rate-limit behaviour', project: 'Launchpad API', status: 'Todo', priority: 'Low', assignee: 'Priya Kapoor', initials: 'PK', due: 'Oct 31' },
  { id: 'DEV-124', title: 'Update responsive spacing tokens', project: 'Orbit UI Kit', status: 'Done', priority: 'Medium', assignee: 'Yubaraj Chanda', initials: 'YC', due: 'Oct 24' },
  { id: 'DEV-121', title: 'Add export to CSV for reports', project: 'Pulse Analytics', status: 'In review', priority: 'Medium', assignee: 'Ananya Mukherjee', initials: 'AM', due: 'Nov 02' },
]

export const activitySeed: ActivityItem[] = [
  { id: 'a1', actor: 'Yubaraj Chanda', initials: 'YC', action: 'pushed 3 commits to', target: 'feature/session-refresh', time: '8 minutes ago', type: 'commit' },
  { id: 'a2', actor: 'Ananya Mukherjee', initials: 'AM', action: 'opened a pull request in', target: 'orbit-ui', time: '24 minutes ago', type: 'review' },
  { id: 'a3', actor: 'Soham Kumar', initials: 'SK', action: 'moved DEV-133 to In Progress in', target: 'Nexus Platform', time: '41 minutes ago', type: 'issue' },
  { id: 'a4', actor: 'Rohan Das', initials: 'RD', action: 'merged pull request #84 in', target: 'pulse-analytics', time: '1 hour ago', type: 'review' },
  { id: 'a5', actor: 'Priya Kapoor', initials: 'PK', action: 'created a new milestone in', target: 'Launchpad API', time: '2 hours ago', type: 'project' },
  { id: 'a6', actor: 'Yubaraj Chanda', initials: 'YC', action: 'updated the README in', target: 'nexus-platform', time: '3 hours ago', type: 'commit' },
]

export const pullRequests = [
  { id: 84, title: 'Improve query caching and request deduplication', repo: 'pulse-analytics', author: 'Rohan Das', initials: 'RD', status: 'Ready for review', checks: 'All checks passed', comments: 4, updated: '18 min ago' },
  { id: 82, title: 'Add accessible command menu interactions', repo: 'orbit-ui', author: 'Ananya Mukherjee', initials: 'AM', status: 'Review requested', checks: 'All checks passed', comments: 7, updated: '43 min ago' },
  { id: 79, title: 'Refresh session before API request', repo: 'nexus-platform', author: 'Yubaraj Chanda', initials: 'YC', status: 'Draft', checks: '1 check running', comments: 2, updated: '2 hours ago' },
  { id: 77, title: 'Document rate limiting and retry headers', repo: 'launchpad-api', author: 'Priya Kapoor', initials: 'PK', status: 'Changes requested', checks: 'All checks passed', comments: 6, updated: 'Yesterday' },
]
