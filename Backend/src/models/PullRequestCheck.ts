import { Schema, model } from 'mongoose';

const pullRequestCheckSchema = new Schema(
  {
    pullRequest: {
      type: Schema.Types.ObjectId,
      ref: 'PullRequest',
      required: true,
      index: true,
    },
    githubId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'queued',
    },
    conclusion: {
      type: String,
      default: '',
    },
    detailsUrl: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

pullRequestCheckSchema.index(
  { pullRequest: 1, githubId: 1 },
  { unique: true },
);

export const PullRequestCheck = model(
  'PullRequestCheck',
  pullRequestCheckSchema,
);