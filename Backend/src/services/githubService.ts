import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
const headers = (token: string) => ({ Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'DEVFLOW' });
export function githubOAuthConfigured() { return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET); }
export async function exchangeGitHubCode(code: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }) });
  const data = await response.json() as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !data.access_token) throw new ApiError(502, data.error_description ?? 'GitHub token exchange failed');
  return data.access_token;
}
export async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, { headers: headers(token) });
  if (!response.ok) throw new ApiError(response.status === 404 ? 404 : 502, `GitHub API request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export async function getGitHubUser(token: string) { return githubFetch<{ id: number; login: string; name: string | null; email: string | null; avatar_url: string }>('/user', token); }
export async function listGitHubRepos(token: string) { return githubFetch<Array<{ id: number; name: string; full_name: string; html_url: string; description: string | null; default_branch: string; private: boolean; language: string | null; stargazers_count: number }>>('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', token); }
export async function listGitHubPulls(fullName: string, token: string) { return githubFetch<Array<{ id: number; number: number; title: string; body: string | null; state: string; html_url: string; user: { login: string }; base: { ref: string }; head: { ref: string }; merged_at: string | null }>>(`/repos/${fullName}/pulls?state=all&per_page=50`, token); }
