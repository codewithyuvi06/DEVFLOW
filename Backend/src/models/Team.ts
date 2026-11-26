import { Schema, model } from 'mongoose';
const memberSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' }, joinedAt: { type: Date, default: Date.now } }, { _id: false });
const teamSchema = new Schema({ name: { type: String, required: true, trim: true, maxlength: 80 }, slug: { type: String, required: true, lowercase: true, trim: true }, description: { type: String, default: '', maxlength: 500 }, owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, members: { type: [memberSchema], default: [] } }, { timestamps: true, versionKey: false });
teamSchema.index({ slug: 1, owner: 1 }, { unique: true });
export const Team = model('Team', teamSchema);
