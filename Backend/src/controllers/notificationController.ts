import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
export const listNotifications = asyncHandler(async (req, res) => { const items = await Notification.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(100); success(res, items.map(n => ({ ...n.toObject(), id: n.id, read: Boolean(n.readAt) }))); });
export const markRead = asyncHandler(async (req, res) => { const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: req.user!.id }, { readAt: new Date() }, { new: true }); if (!notification) throw new ApiError(404, 'Notification not found'); success(res, notification, 'Notification marked as read'); });
export const markAllRead = asyncHandler(async (req, res) => { await Notification.updateMany({ user: req.user!.id, readAt: { $exists: false } }, { readAt: new Date() }); success(res, null, 'All notifications marked as read'); });
