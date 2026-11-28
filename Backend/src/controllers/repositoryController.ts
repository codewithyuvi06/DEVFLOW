import { Repository } from '../models/Repository';
import { Team } from '../models/Team';
import { PullRequest } from '../models/PullRequest';
import { PullRequestReview } from '../models/PullRequestReview';
import { PullRequestComment } from '../models/PullRequestComment';
import { PullRequestCheck } from '../models/PullRequestCheck';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { ApiError } from '../utils/apiError';
import { githubOAuthConfigured, exchangeGitHubCode, getGitHubUser, listGitHubRepos, listGitHubPulls, listGitHubIssues, listGitHubPRReviews, listGitHubPRReviewComments, listGitHubPRConversationComments, listGitHubCheckRuns,} from '../services/githubService';
import { logActivity } from '../services/activityService';
import { signToken } from '../utils/token';
import { setSessionCookie } from '../utils/cookies';
import { env } from '../config/env';
import { Project } from '../models/Project';
import { Issue } from '../models/Issue';
export const githubStart = asyncHandler(async (req, res) => {
 if (!githubOAuthConfigured()) throw new ApiError(503, 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env');
 const state = String(req.query.state ?? ''); if (!state || state.length < 16) throw new ApiError(400, 'OAuth state is required');
 const url = new URL('https://github.com/login/oauth/authorize'); url.searchParams.set('client_id', env.GITHUB_CLIENT_ID); url.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL); url.searchParams.set('scope', 'read:user user:email repo'); url.searchParams.set('state', state);
 res.redirect(url.toString());
});

export const githubCallback = asyncHandler(async (req, res) => {
  const code = String(req.query.code ?? '');

  if (!code) {
    throw new ApiError(400, 'GitHub did not return an authorization code');
  }

  const token = await exchangeGitHubCode(code);
  const gh = await getGitHubUser(token);

  const emails = gh.email
    ? [{ email: gh.email, primary: true, verified: true }]
    : await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }).then(r => r.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;

  const email = Array.isArray(emails)
    ? emails.find(e => e.primary && e.verified)?.email ??
      emails.find(e => e.verified)?.email
    : undefined;

  if (!email) {
    throw new ApiError(400, 'A verified GitHub email is required');
  }

  let user = await User.findOne({
    $or: [
      { githubId: String(gh.id) },
      { email: email.toLowerCase() },
    ],
  });

  if (!user) {
    user = await User.create({
      name: gh.name || gh.login,
      email: email.toLowerCase(),
      githubId: String(gh.id),
      githubUsername: gh.login,
      githubAccessToken: token,
      avatarUrl: gh.avatar_url,
      lastLoginAt: new Date(),
    });
  } else {
    user.githubId = String(gh.id);
    user.githubUsername = gh.login;
    user.githubAccessToken = token;
    user.avatarUrl = gh.avatar_url;
    user.lastLoginAt = new Date();

    await user.save();
  }

  if (!(await Team.exists({ 'members.user': user._id }))) {
    const slug = `${gh.login.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(user._id).slice(-5)}`;

    await Team.create({
      name: `${gh.login}'s workspace`,
      slug,
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }],
    });
  }

  setSessionCookie(
    res,
    signToken({
      sub: String(user._id),
      email: user.email,
      name: user.name,
    }),
  );

  res.redirect(`${env.FRONTEND_URL}/?github=connected`);
});

export const listRepositories = asyncHandler(async (req, res) => {
 const teams = await Team.find({ 'members.user': req.user!.id }).select('_id'); const filter: Record<string, unknown> = { team: { $in: teams.map(t => t._id) } }; if (req.query.teamId) filter.team = req.query.teamId;
 const repos = await Repository.find(filter).sort({ updatedAt: -1 }); success(res, repos.map(r => ({ ...r.toObject(), id: r.id, stars: r.stars, updated: r.updatedAt })));
});
export const importRepositories = asyncHandler(async (req, res) => {
 const { teamId } = req.body as { teamId: string }; const team = await Team.findOne({ _id: teamId, 'members.user': req.user!.id }); if (!team) throw new ApiError(403, 'Team not found or access denied');
 const user = await User.findById(req.user!.id).select('+githubAccessToken');
 const token = (user as unknown as { githubAccessToken?: string } | null)?.githubAccessToken;
 if (!token) throw new ApiError(400, 'GitHub repository import requires a linked GitHub account and stored token. Reconnect GitHub after configuring OAuth; token persistence is intentionally not enabled by default for security.');
 const remoteRepos = await listGitHubRepos(token); const result = [];
 for (const r of remoteRepos) {
  const repo = await Repository.findOneAndUpdate({ team: team._id, githubId: String(r.id) }, { team: team._id, addedBy: req.user!.id, githubId: String(r.id), fullName: r.full_name, name: r.name, url: r.html_url, description: r.description ?? '', defaultBranch: r.default_branch, isPrivate: r.private, language: r.language ?? '', stars: r.stargazers_count, syncedAt: new Date() }, { upsert: true, new: true, setDefaultsOnInsert: true }); await Project.findOneAndUpdate(
  {
    team: team._id,
    repository: repo._id,
  },
  {
    $setOnInsert: {
      name: repo.name,
      description: repo.description || '',
      color: '#700B97',
      status: 'Planning',
      progress: 0,
      team: team._id,
      owner: req.user!.id,
      members: [req.user!.id],
      repository: repo._id,
    },
  },
  {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  },
);

result.push(repo);
 }
 success(res, result, 'Repositories synced');
});

export const syncPullRequests = asyncHandler(async (req, res) => {
  const repo = await Repository.findById(req.params.repositoryId);
  if (!repo) throw new ApiError(404, 'Repository not found');

  const team = await Team.findOne({
    _id: repo.team,
    'members.user': req.user!.id
  });
  if (!team) throw new ApiError(403, 'Access denied');

  const user = await User.findById(req.user!.id).select('+githubAccessToken');
  const token = (user as unknown as { githubAccessToken?: string } | null)?.githubAccessToken;

  if (!token) {
    throw new ApiError(400, 'Link a GitHub access token before syncing pull requests');
  }

  const pulls = await listGitHubPulls(repo.fullName, token);
  const results = [];

  for (const pr of pulls) {
    const state = pr.merged_at
      ? 'merged'
      : pr.state === 'closed'
        ? 'closed'
        : 'open';

    const existingPR = await PullRequest.findOne({
      repository: repo._id,
      number: pr.number
    });

    const isNew = !existingPR;

    const hasDetailsChanged = existingPR && (
      existingPR.title !== pr.title ||
      existingPR.body !== (pr.body ?? '') ||
      existingPR.author !== pr.user.login ||
      existingPR.url !== pr.html_url ||
      existingPR.baseBranch !== pr.base.ref ||
      existingPR.headBranch !== pr.head.ref ||
      existingPR.headSha !== pr.head.sha
);

    const hasStateChanged = existingPR && existingPR.state !== state;

    const savedPR = await PullRequest.findOneAndUpdate(
      { repository: repo._id, number: pr.number },
      {
        team: repo.team,
        repository: repo._id,
        githubId: String(pr.id),
        number: pr.number,
        title: pr.title,
        body: pr.body ?? '',
        state,
        author: pr.user.login,
        url: pr.html_url,
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        headSha: pr.head.sha,
        syncedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (isNew) {
      await logActivity({
        team: String(repo.team),
        actor: req.user!.id,
        type: 'pull_request',
        action: 'created pull request',
        target: pr.title,
        targetId: savedPR.id
      });
    } else if (hasStateChanged) {
      await logActivity({
        team: String(repo.team),
        actor: req.user!.id,
        type: 'pull_request',
        action: state === 'merged'
          ? 'merged pull request'
          : state === 'closed'
            ? 'closed pull request'
            : 'reopened pull request',
        target: pr.title,
        targetId: savedPR.id
      });
    } else if (hasDetailsChanged) {
      await logActivity({
        team: String(repo.team),
        actor: req.user!.id,
        type: 'pull_request',
        action: 'updated pull request',
        target: pr.title,
        targetId: savedPR.id
      });
    }

    results.push(savedPR);
  }

  success(res, results, 'Pull requests synced');
});

export const syncPullRequestDetails = asyncHandler(async (req, res) => {
  const pullRequest = await PullRequest.findById(req.params.pullRequestId);

  if (!pullRequest) {
    throw new ApiError(404, 'Pull request not found');
  }

  const repo = await Repository.findById(pullRequest.repository);

  if (!repo) {
    throw new ApiError(404, 'Repository not found');
  }

  const team = await Team.findOne({
    _id: repo.team,
    'members.user': req.user!.id,
  });

  if (!team) {
    throw new ApiError(403, 'Access denied');
  }

  const user = await User.findById(req.user!.id).select('+githubAccessToken');
  const token = (user as unknown as { githubAccessToken?: string } | null)
    ?.githubAccessToken;

  if (!token) {
    throw new ApiError(400, 'Link a GitHub access token before syncing');
  }

  const [reviews, reviewComments, conversationComments] = await Promise.all([
    listGitHubPRReviews(repo.fullName, pullRequest.number, token),
    listGitHubPRReviewComments(repo.fullName, pullRequest.number, token),
    listGitHubPRConversationComments(repo.fullName, pullRequest.number, token),
  ]);

  for (const review of reviews) {
    await PullRequestReview.findOneAndUpdate(
      {
        pullRequest: pullRequest._id,
        githubId: String(review.id),
      },
      {
        reviewer: review.user?.login ?? '',
        state: review.state,
        body: review.body ?? '',
        submittedAt: review.submitted_at
          ? new Date(review.submitted_at)
          : undefined,
        url: review.html_url,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  for (const comment of reviewComments) {
    await PullRequestComment.findOneAndUpdate(
      {
        pullRequest: pullRequest._id,
        githubId: String(comment.id),
        commentType: 'review',
      },
      {
        commenter: comment.user?.login ?? '',
        body: comment.body,
        path: comment.path,
        line: comment.line,
        createdAtGitHub: new Date(comment.created_at),
        url: comment.html_url,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  for (const comment of conversationComments) {
    await PullRequestComment.findOneAndUpdate(
      {
        pullRequest: pullRequest._id,
        githubId: String(comment.id),
        commentType: 'conversation',
      },
      {
        commenter: comment.user?.login ?? '',
        body: comment.body,
        createdAtGitHub: new Date(comment.created_at),
        url: comment.html_url,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const reviewers = [
    ...new Set(
      reviews
        .map((review) => review.user?.login)
        .filter((login): login is string => Boolean(login)),
    ),
  ];

  pullRequest.reviewers = reviewers;
  await pullRequest.save();

    const savedReviews = await PullRequestReview.find({
    pullRequest: pullRequest._id,
  }).sort({ submittedAt: -1 });

  const savedComments = await PullRequestComment.find({
    pullRequest: pullRequest._id,
  }).sort({ createdAtGitHub: -1 });

  success(
    res,
    {
      reviews: savedReviews,
      comments: savedComments,
      reviewers,
    },
    'Pull request details synced',
  );
});

export const listPullRequests = asyncHandler(async (req, res) => {
 const teams = await Team.find({ 'members.user': req.user!.id }).select('_id'); const filter: Record<string, unknown> = { team: { $in: teams.map(t => t._id) } }; if (req.query.teamId) filter.team = req.query.teamId; if (req.query.state) filter.state = req.query.state;
 const prs = await PullRequest.find(filter).populate('repository', 'name fullName url').sort({ updatedAt: -1 }).limit(100); success(res, prs.map(pr => ({ ...pr.toObject(), id: pr.id })));
});


export const syncGitHubIssues = asyncHandler(async (req, res) => {
  const repo = await Repository.findById(req.params.repositoryId);
  if (!repo) throw new ApiError(404, 'Repository not found');

  const team = await Team.findOne({
    _id: repo.team,
    'members.user': req.user!.id,
  });

  if (!team) throw new ApiError(403, 'Access denied');

  const project = await Project.findOne({
    team: repo.team,
    repository: repo._id,
  });

  if (!project) {
    throw new ApiError(404, 'DEVFLOW project linked to this repository was not found');
  }

  const user = await User.findById(req.user!.id).select('+githubAccessToken');
  const token = (user as unknown as { githubAccessToken?: string } | null)
    ?.githubAccessToken;

  if (!token) {
    throw new ApiError(400, 'Link a GitHub access token before syncing issues');
  }

  const githubIssues = await listGitHubIssues(repo.fullName, token);
  const results = [];

  for (const githubIssue of githubIssues) {
    // GitHub's Issues API also returns pull requests.
    if (githubIssue.pull_request) continue;

    const githubId = String(githubIssue.id);

    const existingIssue = await Issue.findOne({
      project: project._id,
      githubId,
    });

    const internalNumber = existingIssue
      ? existingIssue.number
      : (await Issue.countDocuments({ project: project._id })) + 1;

    const savedIssue = await Issue.findOneAndUpdate(
      {
        project: project._id,
        githubId,
      },
      {
        $set: {
          source: 'github',
          githubId,
          githubNumber: githubIssue.number,
          githubUrl: githubIssue.html_url,
          githubState: githubIssue.state,
          githubAuthor: githubIssue.user.login,
          githubCreatedAt: new Date(githubIssue.created_at),
          githubUpdatedAt: new Date(githubIssue.updated_at),
          githubLabels: githubIssue.labels.map(label => label.name),
          title: githubIssue.title,
          description: githubIssue.body ?? '',
          syncedAt: new Date(),
        },
        $setOnInsert: {
          number: internalNumber,
          project: project._id,
          team: repo.team,
          reporter: req.user!.id,
          status: 'Todo',
          priority: 'Medium',
          labels: [],
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    results.push(savedIssue);
  }

  success(res, results, 'GitHub issues synced');
});

export const syncPullRequestChecks = asyncHandler(async (req, res) => {
  const pullRequest = await PullRequest.findById(req.params.pullRequestId);

  if (!pullRequest) {
    throw new ApiError(404, 'Pull request not found');
  }

  const repo = await Repository.findById(pullRequest.repository);

  if (!repo) {
    throw new ApiError(404, 'Repository not found');
  }

  const team = await Team.findOne({
    _id: pullRequest.team,
    'members.user': req.user!.id,
  });

  if (!team) {
    throw new ApiError(403, 'Access denied');
  }

  const user = await User.findById(req.user!.id).select(
    '+githubAccessToken',
  );

  const token = (
    user as unknown as { githubAccessToken?: string } | null
  )?.githubAccessToken;

  if (!token) {
    throw new ApiError(400, 'Link a GitHub access token before syncing checks');
  }

  if (!pullRequest.headSha) {
    throw new ApiError(
      400,
      'Pull request has no commit SHA. Sync pull requests again.',
    );
  }

  const result = await listGitHubCheckRuns(
    repo.fullName,
    pullRequest.headSha,
    token,
  );

  for (const check of result.check_runs) {
    await PullRequestCheck.findOneAndUpdate(
      {
        pullRequest: pullRequest._id,
        githubId: String(check.id),
      },
      {
        $set: {
          name: check.name,
          status: check.status,
          conclusion: check.conclusion ?? '',
          detailsUrl: check.html_url,
          startedAt: check.started_at
            ? new Date(check.started_at)
            : undefined,
          completedAt: check.completed_at
            ? new Date(check.completed_at)
            : undefined,
        },
      },
      { upsert: true, new: true },
    );
  }

  const savedChecks = await PullRequestCheck.find({
    pullRequest: pullRequest._id,
  }).sort({ createdAt: -1 });

  success(
    res,
    {
      checks: savedChecks,
      total: result.total_count,
    },
    'Pull request checks synced',
  );
});