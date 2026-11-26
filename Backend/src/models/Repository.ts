import { Schema, model } from 'mongoose';
const repositorySchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true }, addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['github'], default: 'github' }, githubId: { type: String, required: true }, fullName: { type: String, required: true }, name: { type: String, required: true },
  description: { type: String, default: '' }, url: { type: String, required: true }, defaultBranch: { type: String, default: 'main' }, isPrivate: { type: Boolean, default: false }, language: { type: String, default: '' }, stars: { type: Number, default: 0 },
  syncedAt: { type: Date }
}, { timestamps: true, versionKey: false });
repositorySchema.index({ team: 1, githubId: 1 }, { unique: true });
export const Repository = model('Repository', repositorySchema);
