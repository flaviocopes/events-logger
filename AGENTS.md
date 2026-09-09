# AGENTS.md

Instructions for AI agents working on this codebase.

The code lives at the repository root. `README.md` is the single long-form document: it contains the API reference, the CLI reference, the architecture notes, how the app was built, and the configuration, deployment, customization, security and decisions sections. Read the relevant README section before changing an area. The short reference docs in `docs/` and the demo script in `demos/WALKTHROUGH.md` stay as separate files.

The app is published as **Events Logger**. The UI header, browser title, CLI help text and `package.json` still use the old name, **Events Dashboard**. Keep them consistent with each other if you touch them.

## Stack

- **Astro 5** in SSR mode (`output: 'server'`) with `@astrojs/node` adapter
- **HTMX 2** loaded from CDN in `src/layouts/Layout.astro` -- used for search, polling, partial page updates
- **Alpine.js 3** loaded from CDN in `src/layouts/Layout.astro` -- used for sidebar toggle, playground form, dropdowns
- **SQLite** via `better-sqlite3` -- single-file database at `data/events.db`
- **Drizzle ORM** -- schema in `src/db/schema.ts`, connection in `src/db/index.ts`
- **Chart.js 4** loaded from CDN on the charts page only
- **Commander 13** -- CLI tool at `cli/index.js`
- **No CSS framework** -- all styles in scoped Astro `<style>` blocks
- **SVG icons** from Feather Icons -- inline SVG in components, no icon library dependency

## Project Structure

```
README.md               -- full documentation (API, CLI, architecture, build story, deployment, security)
AGENTS.md               -- this file
LICENSE                 -- MIT
src/
  db/schema.ts          -- Drizzle table definitions (appSettings, projects, categories, events, insights)
  db/index.ts           -- DB connection, auto-creates tables + migration on import
  lib/auth.ts           -- authenticateRequest(), getGlobalApiKey(), generateProjectId()
  layouts/Layout.astro  -- base HTML shell, loads HTMX + Alpine from CDN
  layouts/DashboardLayout.astro -- responsive layout with collapsible sidebars
  components/           -- reusable Astro components (EventCard, InsightCard, CategoryList, SearchBar)
  pages/index.astro     -- home page (project list, create form)
  pages/projects/[id]/  -- feed, charts, insight, playground, settings
  pages/partials/       -- HTMX partial responses (no <html> wrapper)
  pages/api/            -- REST API endpoints (events.ts, insight.ts, projects.ts, charts.ts, event delete/favorite, insight delete)
cli/index.js            -- CLI entry point (push, insight, export, load)
data/events.db          -- SQLite database (gitignored, auto-created)
docs/                   -- documentation (api.md, architecture.md, cli.md, database.md, roadmap.md)
demos/                  -- demo scenario JSON files + generator + walkthrough script
  generate.js           -- generates random demo data (run: node demos/generate.js)
  ecommerce.json        -- QuickShop e-commerce scenario
  saas.json             -- LaunchPad SaaS scenario
  devops.json           -- DeployBot CI/CD scenario
  content.json          -- BlogWave content platform scenario
  all-scenarios.json    -- all 4 scenarios combined
  WALKTHROUGH.md        -- presentation script for demoing the app
screenshots/            -- screenshots of the app (home, feed, charts, insights, playground)
```

## Key Conventions

- **All pages are server-rendered.** No client-side routing, no SPA. HTMX handles partial updates.
- **Path alias**: `@/` maps to `src/`. Use `import { db } from '@/db'` not relative paths.
- **API routes** are in `src/pages/api/` and export `GET`/`POST` functions typed as `APIRoute`.
- **HTMX partials** are in `src/pages/partials/`. They return HTML fragments, not full pages. Never linked directly -- only `hx-get` targets.
- **Database auto-init**: Importing `@/db` creates tables if they don't exist. New columns are added via try/catch `ALTER TABLE` statements.
- **Auth**: A single global API key for the app, stored in the `app_settings` table and shown on the home page. All write endpoints (`POST /api/events`, `POST /api/insight`, `POST /api/projects`) require `Authorization: Bearer <api_key>`. Read endpoints and dashboard pages are unauthenticated. Events and insight requests must include a `project` field in the body.
- **Timestamps**: Unix integers. Drizzle converts to/from `Date` via `{ mode: 'timestamp' }`.
- **Tags**: JSON string in `events.tags`. Parse with `JSON.parse()`, search with SQL `LIKE`.
- **User ID**: Optional `user_id` text field on events. Sent as `user_id` in the API body, stored as `userId` in Drizzle.
- **Categories**: Auto-created when an event references a new category name.
- **URL**: Optional `url` text field on events. When set, the event title becomes a clickable link that opens in a new tab.
- **Insights**: Upserted by `(project_id, title)`. Same title updates the value.

## Responsive Design

The `DashboardLayout` uses Alpine.js for responsive sidebar behavior:
- Desktop (>768px): Both sidebars visible as flex columns
- Mobile (<=768px): Sidebars hidden off-screen, toggled via hamburger button
- The `.sidebar-group` wraps both the icon sidebar and project sidebar
- A `.sidebar-overlay` provides the dark backdrop on mobile
- The hamburger button uses `@click="sidebarOpen = !sidebarOpen"`

## Styling Conventions

- Purple accent: `#6c5ce7`
- Background: `#f8f8fc`
- Card borders: `#f0f0f5`
- Border radius: 12-14px for cards, 8-10px for inputs/buttons
- Font: system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`)
- No CSS framework. All styles in Astro `<style>` blocks (scoped by default).
- Use `<style is:global>` only in `Layout.astro` for resets.
- Navigation uses inline SVG icons, not emoji.
- `[x-cloak]` style must be present in any component using Alpine.js `x-show`.

## Running

```bash
npm install
npm run dev          # starts on http://localhost:4321
```

## Demo Data

```bash
node demos/generate.js                              # regenerate random data
node cli/index.js load --file demos/all-scenarios.json   # load all 4 scenarios
node cli/index.js load --file demos/ecommerce.json       # load single scenario
node cli/index.js export --file backup.json              # export current data
```

The `load` command replaces all data by default. Use `--merge` to add without clearing. The `export` and `load` commands work directly on the SQLite file (no server needed), but restart the server after loading.

## Database

SQLite at `data/events.db`. Tables auto-create on startup. A global API key is auto-generated in the `app_settings` table on first run. To reset, delete `data/events.db` and restart.

Event columns: `project_id`, `category`, `title`, `description`, `icon`, `tags`, `url`, `user_id`, `notify`, `favorited`, `created_at`. See `src/db/schema.ts` for full definitions and `docs/database.md` for column docs.

## API

- `POST /api/projects` -- create project (auth required)
- `GET /api/projects` -- list projects
- `POST /api/events` -- push event (auth required, requires `project` in body)
- `GET /api/events?project=<id>` -- query events (supports `category`, `search`, `cursor`, `limit`)
- `POST /api/events/[eventId]/delete` -- delete event (no auth)
- `POST /api/events/[eventId]/favorite` -- toggle event favorite (no auth)
- `POST /api/insight` -- upsert insight card (auth required, requires `project` in body)
- `POST /api/insight/[insightId]/delete` -- delete insight (no auth, redirects to partial)
- `GET /api/charts?project=<id>` -- chart data by category/day (supports `days`, `category`)

See `docs/api.md` for the compact endpoint reference and the "API reference" section of `README.md` for full request/response details and examples in several languages. The CLI is documented in the "CLI reference" section of `README.md` and in `docs/cli.md`.

## Adding a New Page

1. Create `src/pages/projects/[id]/newpage.astro`
2. Use `DashboardLayout` as the layout, pass `projectId` and `currentPage`
3. Add `currentPage` value to the `Props` type in `DashboardLayout.astro`
4. Add a nav link in `DashboardLayout.astro`'s `project-nav` section
5. If it needs HTMX polling, create a partial in `src/pages/partials/`

## Adding a New API Endpoint

1. Create `src/pages/api/endpoint.ts`
2. Export `GET` and/or `POST` functions typed as `APIRoute`
3. For auth-protected endpoints, call `authenticateRequest(request)` from `@/lib/auth`
4. Return `new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })`

## Adding a New Component

1. Create `src/components/ComponentName.astro`
2. Define a `Props` interface in the frontmatter
3. Use scoped `<style>` for CSS
4. For interactivity, use `x-data` / `x-init` (Alpine.js) or `hx-*` attributes (HTMX)
5. Add `[x-cloak] { display: none !important; }` if using `x-show`

## Ideas List

`docs/roadmap.md` is a list of ideas, not a commitment. Nothing in it is planned. It includes:
- Summary dashboard with aggregated KPIs
- Users section with user profiles and activity heatmaps
- Feature usage analytics
- Onboarding flow
- Enhanced notifications (push, email, webhook)
- Event detail views

If you are asked to build one of them, treat the list as a hint about intent, not as a spec.

## Demos & Walkthroughs

See `demos/WALKTHROUGH.md` for a scripted presentation covering all 4 demo scenarios.
