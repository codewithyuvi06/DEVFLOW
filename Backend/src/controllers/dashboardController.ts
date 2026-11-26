import { Team } from '../models/Team';
import { Project } from '../models/Project';
import { Issue } from '../models/Issue';
import { Activity } from '../models/Activity';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
export const dashboard = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user!.id }).select('_id name'); const teamIds = teams.map(t => t._id);
  const [projects, issues, openIssues, doneIssues, activities, unreadNotifications] = await Promise.all([
    Project.find({ team: { $in: teamIds }, archivedAt: { $exists: false } }).sort({ updatedAt: -1 }).limit(6).populate('members', 'name email').populate('repository', 'fullName url'),
    Issue.countDocuments({ team: { $in: teamIds } }), Issue.countDocuments({ team: { $in: teamIds }, status: { $ne: 'Done' } }), Issue.countDocuments({ team: { $in: teamIds }, status: 'Done' }),
    Activity.find({ team: { $in: teamIds } }).populate('actor', 'name avatarUrl').sort({ createdAt: -1 }).limit(10), Notification.countDocuments({ user: req.user!.id, readAt: { $exists: false } })
  ]);
  const projectIds = projects.map(p => p._id); const issueGroups = await Issue.aggregate([{ $match: { project: { $in: projectIds } } }, { $group: { _id: '$project', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status','Done'] },1,0] } } } }]);
  const map = new Map(issueGroups.map(g => [String(g._id), g]));
  success(res, { stats: { projects: await Project.countDocuments({ team: { $in: teamIds }, archivedAt: { $exists: false } }), issues, openIssues, doneIssues, unreadNotifications }, projects: projects.map(p => { const g = map.get(p.id); return { ...p.toObject(), id: p.id, tasksTotal: g?.total ?? 0, tasksDone: g?.done ?? 0, progress: g?.total ? Math.round(g.done / g.total * 100) : 0, updated: p.updatedAt }; }), activity: activities.map(a => ({ ...a.toObject(), id: a.id, time: a.createdAt })) });
});
