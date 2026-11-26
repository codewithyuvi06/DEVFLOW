import { Team } from '../models/Team';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { logActivity } from '../services/activityService';
export const listTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user!.id }).populate('members.user', 'name email avatarUrl');
  success(res, teams);
});
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body as { name: string; description?: string };
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const team = await Team.create({ name, description: description ?? '', slug: `${slugBase}-${Math.random().toString(36).slice(2,7)}`, owner: req.user!.id, members: [{ user: req.user!.id, role: 'owner' }] });
  await logActivity({ team: team.id, actor: req.user!.id, type: 'team', action: 'created team', target: team.name, targetId: team.id });
  success(res, team, 'Team created', 201);
});
export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role = 'member' } = req.body as { email: string; role?: 'admin'|'member'|'viewer' };
  if (!['admin','member','viewer'].includes(role)) throw new ApiError(400, 'Invalid role');
  const team = res.locals.team;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, 'User must create a DEVFLOW account before being added');
  if (team.members.some((m: { user: unknown }) => String(m.user) === user.id)) throw new ApiError(409, 'User is already a team member');
  team.members.push({ user: user._id, role, joinedAt: new Date() } as never); await team.save();
  await logActivity({ team: team.id, actor: req.user!.id, type: 'member', action: 'added team member', target: user.name, targetId: user.id });
  success(res, { teamId: team.id, member: { id: user.id, name: user.name, email: user.email, role } }, 'Member added', 201);
});
export const listMembers = asyncHandler(async (_req, res) => { const team = res.locals.team; await team.populate('members.user', 'name email avatarUrl'); success(res, team.members); });
