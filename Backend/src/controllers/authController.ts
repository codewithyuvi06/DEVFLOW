import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { signToken } from '../utils/token';
import { clearSessionCookie, setSessionCookie } from '../utils/cookies';

function publicUser(user: {
  _id: unknown
  name: string
  email: string
  avatarUrl?: string
  githubUsername?: string
  preferences?: unknown
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? '',
    githubUsername: user.githubUsername ?? '',
    preferences: user.preferences,
  }
}
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), lastLoginAt: new Date() });
  const teamName = `${name.trim().split(/\s+/)[0]}'s workspace`;
  const slug = `${teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(-5)}`;
  await Team.create({ name: teamName, slug, owner: user._id, members: [{ user: user._id, role: 'owner' }] });
  setSessionCookie(res, signToken({ sub: user.id, email: user.email, name: user.name }));
  success(res, { user: publicUser(user) }, 'Account created', 201);
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password');
  user.lastLoginAt = new Date(); await user.save();
  setSessionCookie(res, signToken({ sub: user.id, email: user.email, name: user.name }));
  success(res, { user: publicUser(user) }, 'Signed in');
});
export const logout = asyncHandler(async (_req, res) => { clearSessionCookie(res); success(res, null, 'Signed out'); });
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  success(res, { user: publicUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body as {
    name?: string
    preferences?: {
      theme?: 'dark' | 'light' | 'system'
      emailNotifications?: boolean
      productUpdates?: boolean
      issueAssignments?: boolean
      weeklyDigest?: boolean
      compactDensity?: boolean
    }
  }

  const updates: Record<string, unknown> = {}

  if (name !== undefined) {
    updates.name = name.trim()
  }

  if (preferences) {
    for (const [key, value] of Object.entries(preferences)) {
      updates[`preferences.${key}`] = value
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('-passwordHash')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  success(res, { user: publicUser(user) }, 'Profile updated')
})

