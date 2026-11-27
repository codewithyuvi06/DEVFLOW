
import { Schema, model } from 'mongoose';

const pullRequestCommentSchema = new Schema(
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
    commenter: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      default: '',
    },
    line: {
      type: Number,
      default: null,
    },
    commentType: {
      type: String,
      enum: ['review', 'conversation'],
      required: true,
    },
    createdAtGitHub: {
      type: Date,
    },
    url: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false },
);

pullRequestCommentSchema.index(
  { pullRequest: 1, githubId: 1, commentType: 1 },
  { unique: true },
);

export const PullRequestComment = model(
  'PullRequestComment',
  pullRequestCommentSchema,
);
