import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Team } from '../models/Team';
import { ApiError } from '../utils/apiError';
export function requireTeamRole(...allowed: string[]): RequestHandler {
  return async (req, res, next) => {
    try {
      const teamId = String(req.params.teamId ?? req.body.teamId ?? req.query.teamId ?? '');
      if (!mongoose.isValidObjectId(teamId)) throw new ApiError(400, 'A valid teamId is required');
      const team = await Team.findById(teamId);
      if (!team) throw new ApiError(404, 'Team not found');
      const member = team.members.find(m => String(m.user) === req.user?.id);
      if (!member) throw new ApiError(403, 'You are not a member of this team');
      if (allowed.length && !allowed.includes(member.role)) throw new ApiError(403, 'Insufficient team permissions');
      res.locals.team = team; res.locals.teamRole = member.role; next();
    } catch (e) { next(e); }
  };
}
