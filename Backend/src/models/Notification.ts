import { Schema, model } from 'mongoose';
const notificationSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, team: { type: Schema.Types.ObjectId, ref: 'Team' }, type: { type: String, enum: ['mention', 'assignment', 'review', 'invite', 'system'], default: 'system' }, title: { type: String, required: true }, body: { type: String, default: '' }, link: { type: String, default: '' }, readAt: { type: Date } }, { timestamps: true, versionKey: false });
notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);
