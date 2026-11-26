import { Schema, model } from 'mongoose';
const activitySchema = new Schema({ team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true }, actor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, enum: ['project', 'issue', 'repository', 'pull_request', 'team', 'member'], required: true }, action: { type: String, required: true }, target: { type: String, required: true }, targetId: { type: String, default: '' }, metadata: { type: Schema.Types.Mixed, default: {} } }, { timestamps: true, versionKey: false });
activitySchema.index({ team: 1, createdAt: -1 });
export const Activity = model('Activity', activitySchema);
