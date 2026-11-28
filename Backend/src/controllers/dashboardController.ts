
import { Team } from '../models/Team';
import { Project } from '../models/Project';
import { Issue } from '../models/Issue';
import { Activity } from '../models/Activity';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';

export const dashboard = asyncHandler(async (req, res) => {
  const range = req.query.range ?? 'all';

  if (!['7days', '30days', 'all'].includes(String(range))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dashboard date range.',
    });
  }

  const now = new Date();
  const dateFilter: { $gte?: Date } = {};

  if (range === '7days') {
    dateFilter.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30days') {
    dateFilter.$gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const teams = await Team.find({
    'members.user': req.user!.id,
  }).select('_id name');

  const teamIds = teams.map((team) => team._id);

  const issueFilter: Record<string, unknown> = {
    team: { $in: teamIds },
  };

  const activityFilter: Record<string, unknown> = {
    team: { $in: teamIds },
  };

  if (dateFilter.$gte) {
    issueFilter.createdAt = dateFilter;
    activityFilter.createdAt = dateFilter;
  }

  const [
    projects,
    issues,
    openIssues,
    doneIssues,
    activities,
    unreadNotifications,
  ] = await Promise.all([
    Project.find({
      team: { $in: teamIds },
      archivedAt: { $exists: false },
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('members', 'name email')
      .populate('repository', 'fullName url'),

    Issue.countDocuments(issueFilter),

    Issue.countDocuments({
      ...issueFilter,
      status: { $ne: 'Done' },
    }),

    Issue.countDocuments({
      ...issueFilter,
      status: 'Done',
    }),

    Activity.find(activityFilter)
      .populate('actor', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(10),

    Notification.countDocuments({
      user: req.user!.id,
      readAt: { $exists: false },
    }),
  ]);

  const projectIds = projects.map((project) => project._id);

  const issueGroups = await Issue.aggregate([
    {
      $match: {
        project: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        done: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Done'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const map = new Map(
    issueGroups.map((group) => [String(group._id), group]),
  );

  success(res, {
    stats: {
      projects: await Project.countDocuments({
        team: { $in: teamIds },
        archivedAt: { $exists: false },
      }),
      issues,
      openIssues,
      doneIssues,
      unreadNotifications,
    },

    projects: projects.map((project) => {
      const group = map.get(project.id);

      return {
        ...project.toObject(),
        id: project.id,
        tasksTotal: group?.total ?? 0,
        tasksDone: group?.done ?? 0,
        progress: group?.total
          ? Math.round((group.done / group.total) * 100)
          : 0,
        updated: project.updatedAt,
      };
    }),

    activity: activities.map((activity) => ({
      ...activity.toObject(),
      id: activity.id,
      time: activity.createdAt,
    })),
  });
});
