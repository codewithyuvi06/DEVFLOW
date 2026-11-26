import { Team } from '../models/Team';
import { Activity } from '../models/Activity';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
export const listActivity = asyncHandler(async (req, res) => {
 const teams = await Team.find({ 'members.user': req.user!.id }).select('_id');
 const items = await Activity.find({ team: { $in: teams.map(t => t._id) } }).populate('actor', 'name avatarUrl').sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 50, 100));
 success(res, items.map(a => ({ ...a.toObject(), id: a.id, time: a.createdAt })));
});
