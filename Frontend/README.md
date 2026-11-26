# DEVFLOW Frontend

A responsive developer collaboration workspace built with React, TypeScript, Vite, React Router, and custom CSS. It uses the DEVFLOW brand palette:

- `#000000` — foundation
- `#3E065F` — deep violet
- `#700B97` — primary violet
- `#8E05C2` — accent purple

## What's included

- Responsive dashboard with project metrics, sprint progress, activity, and tasks
- Projects page with search, filtering, and a working create-project modal
- Issues page with status filters and a working create-issue modal
- Repositories, pull requests, activity, and settings screens
- Sidebar navigation, mobile navigation, global search, notifications popover, profile menu
- Reusable components and typed mock data
- Local mock interactions so the frontend can be explored before the API exists

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run typecheck
npm run build
npm run preview
```

## Backend integration note

This ZIP contains the **frontend only**. Current screens use local mock data and client-side state. No real authentication, database persistence, GitHub API calls, or backend endpoints are included yet. `VITE_API_URL` is reserved for connecting the frontend to the backend in a later phase. Do not enter real secrets into the frontend environment: `VITE_*` variables are public in the browser bundle.

## Main structure

```text
src/
  components/
    AppLayout.tsx
    Sidebar.tsx
    Topbar.tsx
    PageHeader.tsx
    StatCard.tsx
    ProjectCard.tsx
    Modal.tsx
    EmptyState.tsx
  data/
    mockData.ts
  pages/
    DashboardPage.tsx
    ProjectsPage.tsx
    IssuesPage.tsx
    RepositoriesPage.tsx
    PullRequestsPage.tsx
    ActivityPage.tsx
    SettingsPage.tsx
  types/
    index.ts
  App.tsx
  main.tsx
  styles.css
```
