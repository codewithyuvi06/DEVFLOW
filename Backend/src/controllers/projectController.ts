import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { Issue } from '../models/Issue';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { logActivity } from '../services/activityService';
export const listProjects = asyncHandler(async (req, res) => {
  const teamId = String(req.query.teamId ?? '');
  const teams = await Team.find({ 'members.user': req.user!.id }).select('_id');
  const allowed = teams.map(t => t.id);
  const filter: Record<string, unknown> = { team: { $in: allowed }, archivedAt: { $exists: false } };
  if (teamId) { if (!allowed.includes(teamId)) throw new ApiError(403, 'No access to this team'); filter.team = teamId; }
  const projects = await Project.find(filter).populate('members', 'name email avatarUrl').populate('repository', 'fullName url').sort({ updatedAt: -1 });
  const ids = projects.map(p => p._id);
  const counts = await Issue.aggregate([{ $match: { project: { $in: ids } } }, { $group: { _id: '$project', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status','Done'] },1,0] } } } }]);
  const countMap = new Map(counts.map(c => [String(c._id), c]));
  success(res, projects.map(p => { const c = countMap.get(p.id); return { ...p.toObject(), id: p.id, tasksTotal: c?.total ?? 0, tasksDone: c?.done ?? 0, progress: c?.total ? Math.round((c.done / c.total) * 100) : p.progress, updated: p.updatedAt }; }));
});
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color, status, teamId, members, dueDate } = req.body as { name: string; description?: string; color?: string; status?: 'On track'|'At risk'|'Planning'; teamId: string; members?: string[]; dueDate?: string };
  const team = await Team.findOne({ _id: teamId, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Team not found or access denied');
  const project = await Project.create({ name, description, color, status, team: teamId, owner: req.user!.id, members: members ?? [req.user!.id], ...(dueDate ? { dueDate: new Date(dueDate) } : {}) });
  await logActivity({ team: teamId, actor: req.user!.id, type: 'project', action: 'created project', target: name, targetId: project.id });
  success(res, { ...project.toObject(), id: project.id, tasksDone: 0, tasksTotal: 0, updated: project.updatedAt }, 'Project created', 201);
});
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('members', 'name email avatarUrl').populate('repository');
  if (!project) throw new ApiError(404, 'Project not found');
  const team = await Team.findOne({ _id: project.team, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Access denied');
  const [tasksTotal, tasksDone] = await Promise.all([Issue.countDocuments({ project: project._id }), Issue.countDocuments({ project: project._id, status: 'Done' })]);
  success(res, { ...project.toObject(), id: project.id, tasksTotal, tasksDone, progress: tasksTotal ? Math.round(tasksDone / tasksTotal * 100) : 0 });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId)
  if (!project) throw new ApiError(404, 'Project not found')

  const team = await Team.findOne({
    _id: project.team,
    'members.user': req.user!.id
  })

  if (!team) throw new ApiError(403, 'Access denied')

  const allowed = [
    'name',
    'description',
    'color',
    'status',
    'members',
    'dueDate'
  ] as const

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (project as unknown as Record<string, unknown>)[key] =
        key === 'dueDate' && req.body[key]
          ? new Date(req.body[key])
          : req.body[key]
    }
  }

  await project.save()

  await logActivity({
    team: String(project.team),
    actor: req.user!.id,
    type: 'project',
    action: 'updated project',
    target: project.name,
    targetId: project.id
  })

  success(res, project, 'Project updated')
})


export const archiveProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId)
  if (!project) throw new ApiError(404, 'Project not found')

  const team = await Team.findOne({
    _id: project.team,
    'members.user': req.user!.id
  })

  if (!team) throw new ApiError(403, 'Access denied')

  project.archivedAt = new Date()
  await project.save()

  await logActivity({
    team: String(project.team),
    actor: req.user!.id,
    type: 'project',
    action: 'archived project',
    target: project.name,
    targetId: project.id
  })

  success(res, null, 'Project archived')
})

