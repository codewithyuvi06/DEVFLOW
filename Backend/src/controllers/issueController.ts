import { Issue } from '../models/Issue';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { logActivity } from '../services/activityService';
export const listIssues = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user!.id }).select('_id');
  const filter: Record<string, unknown> = { team: { $in: teams.map(t => t._id) } };
  if (req.query.projectId) filter.project = req.query.projectId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assigneeId) filter.assignee = req.query.assigneeId;
  if (req.query.search) filter.title = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const issues = await Issue.find(filter).populate('assignee', 'name email avatarUrl').populate('reporter', 'name email avatarUrl').populate('project', 'name color').sort({ updatedAt: -1 }).limit(Math.min(Number(req.query.limit) || 100, 200));
  success(res, issues.map(i => ({ ...i.toObject(), id: i.id, due: i.dueDate, initials: (i.assignee && typeof i.assignee === 'object' && 'name' in i.assignee) ? String((i.assignee as unknown as {name:string}).name).split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() : '' })));
});
export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, projectId, status, priority, assigneeId, dueDate, labels } = req.body as { title: string; description?: string; projectId: string; status?: 'Todo'|'In progress'|'In review'|'Done'; priority?: 'Urgent'|'High'|'Medium'|'Low'; assigneeId?: string; dueDate?: string; labels?: string[] };
  const project = await Project.findById(projectId); if (!project) throw new ApiError(404, 'Project not found');
  const team = await Team.findOne({ _id: project.team, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Access denied');
  if (assigneeId && !team.members.some(m => String(m.user) === assigneeId)) throw new ApiError(400, 'Assignee must be a member of the project team');
  const number = (await Issue.countDocuments({ project: project._id })) + 1;
  const issue = await Issue.create({ number, title, description, project: project._id, team: team._id, status, priority, assignee: assigneeId, reporter: req.user!.id, dueDate: dueDate ? new Date(dueDate) : undefined, labels });
  if (assigneeId && assigneeId !== req.user!.id) await Notification.create({ user: assigneeId, team: team._id, type: 'assignment', title: 'You were assigned an issue', body: title, link: `/issues/${issue.id}` });
  await logActivity({ team: team.id, actor: req.user!.id, type: 'issue', action: 'created issue', target: title, targetId: issue.id });
  await issue.populate([{ path: 'assignee', select: 'name email avatarUrl' }, { path: 'reporter', select: 'name email avatarUrl' }, { path: 'project', select: 'name color' }]);
  success(res, { ...issue.toObject(), id: issue.id, due: issue.dueDate }, 'Issue created', 201);
});
export const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId); if (!issue) throw new ApiError(404, 'Issue not found');
  const team = await Team.findOne({ _id: issue.team, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Access denied');
  const fields = ['title','description','status','priority','assigneeId','dueDate','labels'] as const;
  for (const key of fields) if (req.body[key] !== undefined) {
    const dest = key === 'assigneeId' ? 'assignee' : key;
    (issue as unknown as Record<string, unknown>)[dest] = key === 'dueDate' && req.body[key] ? new Date(req.body[key]) : req.body[key];
  }
  if (issue.status === 'Done' && !issue.closedAt) issue.closedAt = new Date(); else if (issue.status !== 'Done') issue.closedAt = undefined;
  await issue.save(); await issue.populate([{ path: 'assignee', select: 'name email avatarUrl' }, { path: 'reporter', select: 'name email avatarUrl' }, { path: 'project', select: 'name color' }]);
  await logActivity({ team: team.id, actor: req.user!.id, type: 'issue', action: 'updated issue', target: issue.title, targetId: issue.id });
  success(res, { ...issue.toObject(), id: issue.id, due: issue.dueDate }, 'Issue updated');
});
export const addComment = asyncHandler(async (req, res) => {
  const { body } = req.body as { body: string }; const issue = await Issue.findById(req.params.issueId); if (!issue) throw new ApiError(404, 'Issue not found');
  const team = await Team.findOne({ _id: issue.team, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Access denied');
  issue.comments.push({ author: req.user!.id as never, body, createdAt: new Date() } as never); await issue.save();
  const comment = issue.comments[issue.comments.length - 1]; success(res, comment, 'Comment added', 201);
});
export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId); if (!issue) throw new ApiError(404, 'Issue not found');
  const team = await Team.findOne({ _id: issue.team, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Access denied');
  await issue.deleteOne(); success(res, null, 'Issue deleted');
});
