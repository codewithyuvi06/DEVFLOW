
import { Schema, model } from 'mongoose';

const pullRequestReviewSchema = new Schema(
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
    reviewer: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
    },
    url: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false },
);

pullRequestReviewSchema.index(
  { pullRequest: 1, githubId: 1 },
  { unique: true },
);

export const PullRequestReview = model(
  'PullRequestReview',
  pullRequestReviewSchema,
);
