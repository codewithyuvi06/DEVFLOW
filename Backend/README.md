# DEVFLOW Backend

Node.js + Express + TypeScript + MongoDB/Mongoose REST API for DEVFLOW. The API uses the agreed black/violet palette only in the frontend; backend responses are UI-neutral JSON.

## Requirements
- Node.js 20+
- npm
- MongoDB Community Server or a MongoDB Atlas connection string

## Start locally
1. Extract this folder next to `devflow-frontend`.
2. Copy `.env.example` to `.env` and set a unique random `JWT_SECRET` (32+ characters).
3. Start MongoDB locally or set `MONGODB_URI` to your Atlas connection string.
4. Run:

```bash
npm install
npm run dev
```

API defaults to `http://localhost:4000`; health check: `http://localhost:4000/health`.

## Build and test
```bash
npm run typecheck
npm test
npm run build
npm start
```

## API overview
All endpoints except health, auth register/login/logout, and GitHub OAuth entry/callback are under `/api/v1`. JSON responses use `{ success, message?, data? }`; errors use `{ success: false, error: { message, details? } }`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Create user and personal workspace |
| POST | `/api/v1/auth/login` | Sign in |
| POST | `/api/v1/auth/logout` | Clear session cookie |
| GET | `/api/v1/auth/me` | Current user |
| PATCH | `/api/v1/auth/me` | Update profile/preferences |
| GET/POST | `/api/v1/teams` | List/create teams |
| GET/POST | `/api/v1/teams/:teamId/members` | List/add team members |
| GET/POST | `/api/v1/projects` | List/create projects |
| GET/PATCH/DELETE | `/api/v1/projects/:projectId` | Read/update/archive project |
| GET/POST | `/api/v1/issues` | List/create issues |
| PATCH/DELETE | `/api/v1/issues/:issueId` | Update/delete issue |
| POST | `/api/v1/issues/:issueId/comments` | Comment on issue |
| GET | `/api/v1/dashboard` | Dashboard stats, projects and activity |
| GET | `/api/v1/activity` | Activity feed |
| GET | `/api/v1/notifications` | User notifications |
| PATCH | `/api/v1/notifications/read-all` | Mark all notifications read |
| PATCH | `/api/v1/notifications/:notificationId/read` | Mark one notification read |
| GET | `/api/v1/repositories` | Imported repositories |
| POST | `/api/v1/repositories/import` | Import repositories from linked GitHub token |
| GET | `/api/v1/pull-requests` | Stored pull requests |
| POST | `/api/v1/repositories/:repositoryId/sync-pull-requests` | Sync pull requests from GitHub |
| GET | `/api/v1/integrations/github/start?state=...` | Begin GitHub OAuth |
| GET | `/api/v1/integrations/github/callback` | OAuth callback |

Protected endpoints accept the `devflow_session` HTTP-only cookie. For API clients, `Authorization: Bearer <JWT>` is also accepted. Browser requests must use `credentials: 'include'`.

### Example requests
Register:
```http
POST /api/v1/auth/register
Content-Type: application/json

{"name":"Alex Developer","email":"alex@example.com","password":"use-a-long-unique-password"}
```
Create a team:
```http
POST /api/v1/teams
Content-Type: application/json

{"name":"Platform Team","description":"Core engineering"}
```
Create a project (replace `teamId` with a real team ID):
```http
POST /api/v1/projects
Content-Type: application/json

{"name":"API Modernization","description":"Modernize services","teamId":"64f000000000000000000001","color":"#700B97"}
```

## GitHub OAuth setup
1. Create an OAuth App in GitHub Developer Settings.
2. Set callback URL to `http://localhost:4000/api/v1/integrations/github/callback`.
3. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` to `.env`.
4. Call `/api/v1/integrations/github/start?state=<random-state>` and validate that same state in your frontend callback flow.

**Security note:** OAuth is a starter integration and the state parameter must be generated and verified by the client; for production, use a server-issued, short-lived, one-time state cookie and PKCE where supported. Access tokens are deliberately not persisted by this version. Consequently, repository import / PR sync endpoints return a clear setup error until secure encrypted token storage is implemented. Do not work around this by storing access tokens in plaintext. GitHub account linking and repo syncing are a follow-up hardening step.

## Security and implementation notes
- Passwords are hashed with bcrypt (12 rounds); JWT is in an HTTP-only cookie.
- Helmet, restricted CORS, auth rate limiting, input validation, request size limits, team membership checks, and centralized errors are configured.
- `.env` is excluded from git. Never put server secrets in `VITE_*` variables.
- Team invite-by-email currently adds an existing DEVFLOW user immediately; invitation emails/tokens are not implemented yet.
- Real-time updates, webhook signature verification, email delivery, Redis/background queues, refresh-token rotation, password reset, MFA, billing, and production deployment are not implemented in this package yet.
- The frontend ZIP still uses mock data and does not call these endpoints automatically. Backend and frontend API wiring is the next integration task.
