import { Schema, model } from 'mongoose';
const pullRequestSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true }, repository: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  githubId: { type: String, required: true }, number: { type: Number, required: true }, title: { type: String, required: true }, body: { type: String, default: '' },
  state: { type: String, enum: ['open', 'closed', 'merged'], default: 'open' }, author: { type: String, default: '' }, url: { type: String, required: true }, baseBranch: { type: String, default: 'main' }, headBranch: { type: String, default: '' },
  reviewers: [{ type: String }], syncedAt: { type: Date }
}, { timestamps: true, versionKey: false });
pullRequestSchema.index({ repository: 1, number: 1 }, { unique: true });
export const PullRequest = model('PullRequest', pullRequestSchema);
