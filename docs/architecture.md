# Architecture

## Overview

Events Logger is a server-rendered Astro application. Every page is rendered on the server using SQLite queries. HTMX handles dynamic interactions (search, polling, partial page updates) without client-side routing. Alpine.js handles UI state (sidebar toggle, playground form, dropdowns).

The app is fully self-contained -- no external services, no build-time data fetching, no client-side state management libraries.

## Project Layout

```
events-logger/
  README.md                  # Full documentation (API, CLI, architecture, deployment, security)
  AGENTS.md                  # Instructions for AI coding agents
  LICENSE                    # MIT
  astro.config.mjs          # Astro config (SSR + Node adapter)
  drizzle.config.ts          # Drizzle ORM config (SQLite path, schema location)
  package.json               # Dependencies and scripts
  tsconfig.json              # TypeScript config with @/ path alias

  cli/
    index.js                 # CLI entry point (commander-based)

  data/
    events.db                # SQLite database file (gitignored, auto-created)

  demos/                     # Demo scenario JSON files, generator, walkthrough script

  screenshots/               # Screenshots of the app

  docs/                      # Documentation
    api.md
    architecture.md
    cli.md
    database.md
    roadmap.md

  src/
    db/
      schema.ts              # Drizzle table definitions (projects, categories, events, insights)
      index.ts               # Database connection + auto-migration on startup

    lib/
      auth.ts                # API key authentication + ID/key generators

    layouts/
      Layout.astro           # Base HTML shell (includes HTMX + Alpine.js from CDN)
      DashboardLayout.astro  # Responsive layout: icon sidebar + project sidebar + main content

    components/
      CategoryList.astro     # Category list with event counts, favorites link, in project sidebar
      EventCard.astro        # Single event card (icon, title, description, category, time, tags, favorite/delete)
      InsightCard.astro      # Single KPI card (icon, value, title, delete)
      SearchBar.astro        # HTMX-powered search input that filters the feed

    pages/
      index.astro            # Home page: project list, create project form

      projects/[id]/
        feed.astro           # Event feed with search and auto-refresh
        charts.astro         # Bar charts per category (Chart.js)
        insight.astro        # KPI card grid with auto-refresh
        playground.astro     # Interactive event testing form with live code preview
        settings.astro       # API key, project info, delete project

      partials/
        event-list.astro     # HTMX partial: rendered event list (used by search + polling)
        insight-grid.astro   # HTMX partial: rendered insight cards (used by polling)

      api/
        projects.ts          # GET (list) + POST (create) projects
        events.ts            # GET (query) + POST (push) events
        events/[eventId]/
          delete.ts          # POST delete event
          favorite.ts        # POST toggle event favorite
        insight.ts           # POST (upsert) insights
        insight/[insightId]/
          delete.ts          # POST delete insight
        charts.ts            # GET aggregated chart data
```

## Request Flow

### Page Load

1. Browser requests a page (e.g. `/projects/abc123/feed`)
2. Astro renders the page server-side, querying SQLite via Drizzle
3. Full HTML is sent to the browser with HTMX and Alpine.js loaded from CDN

### HTMX Interactions

- **Search**: The SearchBar input fires `hx-get` to `/partials/event-list` with a 300ms debounce. The server queries events matching the search term and returns HTML that replaces `#event-list`.
- **Live feed**: The event list div has `hx-trigger="every 10s"` which polls `/partials/event-list` and swaps in fresh content. New events with `notify: true` trigger OS-level browser notifications via the Web Notifications API.
- **Insights polling**: The insight grid has `hx-trigger="every 15s"` which polls `/partials/insight-grid`.

### API Calls (from CLI or external services)

1. Client sends `POST /api/events` with `Authorization: Bearer <global_api_key>` and a `project` ID in the body
2. `authenticateRequest()` in `src/lib/auth.ts` validates the key against the global key in `app_settings`
3. The project is looked up by the `project` ID from the request body
4. The event is inserted into SQLite
5. If the category doesn't exist, it's auto-created
6. The next HTMX poll picks up the new event in the dashboard

### Playground

The playground page is a fully client-side Alpine.js form. It sends events via `fetch()` directly to `/api/events` and shows a live code preview of the equivalent `fetch()` call.

## Responsive Design

On viewports under 768px:
- Both sidebars (icon sidebar + project sidebar) collapse off-screen to the left
- A hamburger button appears at the top-left corner
- Clicking the hamburger slides the sidebars in as an overlay with a dark backdrop
- Clicking the backdrop or a navigation link closes the sidebar
- Main content gets full width with reduced padding
- The playground form switches from 2-column to single-column layout

## Key Design Decisions

- **No client-side routing**: Every page is a full server render. HTMX handles partial updates.
- **SQLite**: Single-file database, zero config. Tables auto-created on startup.
- **HTMX partials**: Files in `src/pages/partials/` return HTML fragments (no `<html>` wrapper). Used exclusively as `hx-get` targets.
- **API key auth**: A single global `ev_`-prefixed API key authenticates all write endpoints (`POST /api/events`, `POST /api/insight`, `POST /api/projects`). Event delete, favorite, and insight delete endpoints do not require authentication.
- **Timestamps as unix integers**: Drizzle's `{ mode: 'timestamp' }` converts to/from `Date`.
- **Tags as JSON text**: Arbitrary key-value metadata stored as JSON string.
- **User identification**: Events can carry a `user_id` field to associate events with specific users.

## Styling

CSS is scoped per-component using Astro's `<style>` blocks. No CSS framework is used. Global styles (reset, body, links) are in `Layout.astro`. The design uses:

- Purple accent color (`#6c5ce7`)
- Light background (`#f8f8fc`)
- System font stack
- 12-14px rounded cards with subtle borders
- SVG icons from Feather Icons for navigation
