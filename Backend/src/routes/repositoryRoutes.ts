import { Router } from 'express'; import { githubCallback, githubStart, importRepositories, listPullRequests, listRepositories, syncPullRequests, syncGitHubIssues, } from '../controllers/repositoryController'; import { requireAuth } from '../middleware/auth'; const router = Router();
router.get('/integrations/github/start', githubStart); router.get('/integrations/github/callback', githubCallback);
router.get('/repositories', requireAuth, listRepositories); router.post('/repositories/import', requireAuth, importRepositories);
router.get('/pull-requests', requireAuth, listPullRequests); router.post('/repositories/:repositoryId/sync-pull-requests', requireAuth, syncPullRequests);
export default router;
router.post(
  '/repositories/:repositoryId/sync-issues',
  requireAuth,
  syncGitHubIssues
);