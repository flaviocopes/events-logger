# Events Logger

Events Logger is a self-hosted event tracking dashboard. It is one of the software packages I publish with full source code. The landing page is [flaviocopes.com/software/events-logger](https://flaviocopes.com/software/events-logger/).

It is MIT licensed. You can use it, fork it and change it, also for commercial work.

There is no support. Issues are turned off and there is no roadmap. Forks are welcome.

If you point a coding agent at this repository, have it read [AGENTS.md](AGENTS.md) first.

## Table of contents

- [What it is](#what-it-is)
- [Quick start](#quick-start)
- [Push your first event](#push-your-first-event)
- [API integration](#api-integration)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Database](#database)
- [Demo scenarios](#demo-scenarios)
- [Ideas list](#ideas-list)
- [Use cases](#use-cases)
- [Scripts](#scripts)
- [Why I built this](#why-i-built-this)
- [API reference](#api-reference)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
  - [Language examples](#language-examples)
  - [Integration patterns](#integration-patterns)
- [CLI reference](#cli-reference)
- [Architecture](#architecture)
- [How it was built](#how-it-was-built)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Customization](#customization)
- [Security](#security)
- [Decisions](#decisions)
- [Changelog](#changelog)
- [License](#license)

## What it is

Track events from your applications (signups, orders, deploys, payments) and see them in a clean, real-time dashboard. Push them from any language with one HTTP call, or from the command line with the bundled CLI. All data stays in a local SQLite database.

Built with the AHA stack: Astro + HTMX + Alpine.js.

The app was previously called **Events Dashboard**. The name still shows up in the UI header, the browser title, the CLI help text and `package.json`. It is the same software.

Everything that used to be split across separate Markdown files is now in this README: how I built it, the API and CLI references, the architecture, configuration, deployment, customization, security and decisions notes, and the changelog. The short reference docs in [docs/](docs/) and the demo walkthrough stay as separate files.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:4321, create a project, and start pushing events. Your global API key is displayed on the home page.

## Push your first event

Create a project via the CLI:

```bash
node cli/index.js init --api-key ev_your-key-here --name "my-app"
```

Push an event:

```bash
node cli/index.js push \
  --api-key ev_your-key-here \
  --project q4q8nb18qc2i \
  --category signups \
  --title "User Registered" \
  --description "New user **john@example.com** signed up" \
  --icon "👤" \
  --user-id "user-123"
```

Or use the API directly:

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key-here" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "orders",
    "title": "Order Placed",
    "description": "Order **#1234** placed by **Maria**",
    "icon": "🛍️",
    "user_id": "user-456",
    "tags": {"email": "maria@example.com", "amount": "$89.99"}
  }'
```

Or use the built-in **Playground** page to test events interactively with a form and live code preview.

## API integration

The app uses a single global API key (shown on the home page). All write endpoints require this key in the `Authorization` header and a `project` ID in the request body.

### Event fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `category` | string | yes | Category name (auto-created if new) |
| `title` | string | yes | Event title |
| `description` | string | no | Supports `**bold**` and `[link](url)` markdown |
| `icon` | string | no | Emoji icon |
| `tags` | object | no | Key-value metadata for filtering and display |
| `url` | string | no | Link to external resource (e.g. order page, ticket, deploy). Clicking the event title opens this URL |
| `user_id` | string | no | Associate the event with a user |
| `notify` | boolean | no | Trigger browser notification + highlight in feed (default: false) |

The full [API reference](#api-reference) below covers every endpoint, with examples in JavaScript, Python, PHP, Ruby, and Go, plus integration patterns for Stripe webhooks, CI/CD pipelines, and more. [docs/api.md](docs/api.md) has the same endpoints in compact form.

## Features

- **Feed** -- chronological event stream with live search, auto-refresh, and browser notifications
- **Charts** -- bar charts showing event frequency per category over time
- **Insights** -- KPI dashboard cards for real-time metrics
- **Playground** -- interactive form to test event publishing with live code preview
- **Categories** -- auto-created groupings to organize events
- **User tracking** -- associate events with user IDs via the `user_id` field
- **Favorites** -- mark events as favorites and filter the feed to show only starred items
- **Search** -- filter events by title, description, or tags
- **Delete** -- remove individual events or insight cards from the dashboard
- **Settings** -- project info, rename, delete project
- **CLI** -- command-line tool to push events and manage projects
- **REST API** -- JSON API for integration with any service
- **Export/Import** -- export all data to JSON, load demo scenarios or backups
- **Demo scenarios** -- 4 pre-built scenarios with 1800+ events for presentations
- **Responsive** -- mobile-friendly layout with collapsible sidebar

## Tech stack

- **Astro 5** (SSR mode with Node adapter) -- pages, layouts, API routes
- **HTMX** -- live feed updates, search, polling without page reloads
- **Alpine.js** -- dropdowns, toggles, sidebar, playground interactivity
- **SQLite** via better-sqlite3 -- local database, zero configuration
- **Drizzle ORM** -- type-safe schema and queries
- **Chart.js** -- bar charts on the charts page
- **Commander** -- CLI tool

## Project structure

See [docs/architecture.md](docs/architecture.md) for the full project layout and component descriptions. The short version is in the [Architecture](#architecture) section below.

## Database

See [docs/database.md](docs/database.md) for the schema, tables, and indexes.

## Demo scenarios

Load pre-built demo data to showcase the app without using personal data. Each scenario contains realistic, generated data spanning 30 days.

```bash
# Load all 4 scenarios (1800+ events across 30 days)
node cli/index.js load --file demos/all-scenarios.json

# Load a single scenario
node cli/index.js load --file demos/ecommerce.json

# Export your current data first (backup)
node cli/index.js export --file my-backup.json

# Regenerate fresh random demo data
node demos/generate.js
```

| Scenario | Project | File | Events | Description |
|----------|---------|------|--------|-------------|
| E-commerce | QuickShop | `demos/ecommerce.json` | ~530 | Orders, cart, payments, reviews, support |
| SaaS | LaunchPad | `demos/saas.json` | ~540 | Logins, billing, API usage, errors, features |
| DevOps | DeployBot | `demos/devops.json` | ~340 | Deploys, builds, incidents, releases, monitoring |
| Content | BlogWave | `demos/content.json` | ~400 | Subscribers, articles, newsletters, traffic |
| All | All four | `demos/all-scenarios.json` | 1800+ | All 4 scenarios combined |

See [demos/WALKTHROUGH.md](demos/WALKTHROUGH.md) for a full presentation script.

## Ideas list

[docs/roadmap.md](docs/roadmap.md) is a list of ideas I noted while building the app, inspired by LogSnag. It is not a commitment. Nothing in it is planned. If you want one of those features, fork the repository and build it.

## Use cases

- **E-commerce** -- user registrations, cart events, orders, shipping, reviews
- **SaaS** -- signups, trial conversions, subscription changes, feature usage
- **CI/CD** -- build status, deploys, test results, rollbacks
- **Content platforms** -- posts published, comments, subscriber growth
- **Indie projects** -- waitlist signups, feedback, revenue milestones

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 4321 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:push` | Push schema changes to database |
| `node cli/index.js export --file data.json` | Export all data to JSON |
| `node cli/index.js load --file data.json` | Load data from JSON (replaces existing) |
| `node demos/generate.js` | Regenerate demo scenario files |

---

## Why I built this

I wanted to know what was happening across my apps -- signups, deploys, errors, sales -- without sending data to a third-party analytics service. Every analytics tool I tried was either too complex, too expensive, or required sending my data to someone else's servers.

I wanted a self-hosted dashboard where I could push events from any app with a single HTTP call, see them visualized with charts, and track KPIs with insight cards. Something simple enough to set up in minutes, powerful enough to replace basic analytics.

So I built an event tracking dashboard with a REST API and CLI. Push events from any language, categorize them with tags, and see activity over time. All data stays in a local SQLite database.

### Why it could be useful for you

- **See what's happening across all your apps** -- one dashboard for signups, deploys, payments, errors, and anything else you want to track
- **Your data stays on your machine** -- no third-party analytics, no data sharing, no monthly fees
- **Push events from any language** -- a single HTTP POST with an API key is all you need
- **Track KPIs with insight cards** -- monitor key metrics at a glance without building custom dashboards
- **CLI for quick logging** -- push events from shell scripts, cron jobs, or CI/CD pipelines
- **Study a real REST API** -- authentication, pagination, search, and filtering implemented with clear, readable code
- **Learn the AHA Stack** -- see how Astro SSR, HTMX partial swaps, and Alpine.js work together with Drizzle ORM and SQLite
- **Extend with AI agents** -- point an AI agent at the project and add webhooks, email alerts, Slack integration, or custom visualizations

---

## API reference

Events Logger exposes a REST API that any application can use to push events, update metrics, and query data. All responses are JSON.

**Base URL:** `http://localhost:4321` (or wherever you deploy the app)

### API quick start

```bash
# 1. Create a project (requires API key)
curl -X POST http://localhost:4321/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-api-key" \
  -d '{"name": "my-app"}'

# Response: {"id": "q4q8nb18qc2i", "name": "my-app"}

# 2. Push an event
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-api-key" \
  -d '{"project": "q4q8nb18qc2i", "category": "signups", "title": "User Registered", "icon": "👤"}'

# 3. Query events
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i"
```

---

### Authentication

All write endpoints (`POST /api/events`, `POST /api/insight`, `POST /api/projects`) require the global API key in the `Authorization` header:

```
Authorization: Bearer ev_your-api-key-here
```

A single API key is auto-generated when the app starts for the first time. It is displayed on the home page. The key is prefixed with `ev_` and follows the format `ev_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (five lowercase alphanumeric groups of 8, 4, 4, 4 and 12 characters).

Read-only endpoints (`GET /api/events`, `GET /api/projects`, `GET /api/charts`) do not require authentication.

---

### Endpoints

#### POST /api/projects

Create a new project. **Requires authentication.**

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Project name |

**Example:**

```bash
curl -X POST http://localhost:4321/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-api-key" \
  -d '{"name": "my-saas-app"}'
```

**Response** `201`:

```json
{
  "id": "q4q8nb18qc2i",
  "name": "my-saas-app"
}
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing or empty `name` |
| 401 | Missing or invalid API key |

---

#### GET /api/projects

List all projects.

```bash
curl http://localhost:4321/api/projects
```

**Response** `200`:

```json
[
  {
    "id": "q4q8nb18qc2i",
    "name": "my-saas-app",
    "createdAt": "2026-02-27T08:00:00.000Z"
  }
]
```

---

#### POST /api/events

Push an event. **Requires authentication.**

**Body:** the fields listed in [Event fields](#event-fields).

**Response** `201`:

```json
{
  "id": 42,
  "projectId": "q4q8nb18qc2i",
  "category": "orders",
  "title": "Order Placed",
  "description": "Order **#1234** placed by **Maria**",
  "icon": "🛍️",
  "tags": "{\"email\":\"maria@example.com\",\"amount\":\"$89.99\"}",
  "url": "https://shop.example.com/admin/orders/1234",
  "userId": "user-456",
  "notify": false,
  "favorited": false,
  "createdAt": "2026-02-27T08:12:03.000Z"
}
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing `project`, `category`, or `title` |
| 401 | Missing or invalid API key |
| 404 | Project not found |

##### Examples by use case

**User signup:**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "signups",
    "title": "User Registered",
    "description": "New user **john@example.com** signed up via Google OAuth",
    "icon": "👤",
    "user_id": "usr_abc123",
    "tags": {"email": "john@example.com", "source": "google", "plan": "free"}
  }'
```

**Payment received:**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "payments",
    "title": "Payment Received",
    "description": "**$49.99** payment from user-456 for Pro plan",
    "icon": "💰",
    "url": "https://dashboard.stripe.com/payments/pi_abc123",
    "user_id": "user-456",
    "notify": true,
    "tags": {"amount": "49.99", "currency": "USD", "plan": "pro"}
  }'
```

**Deploy completed:**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "deploys",
    "title": "Deploy Succeeded",
    "description": "Version **v2.4.1** deployed to production in 43s",
    "icon": "🚀",
    "tags": {"version": "v2.4.1", "environment": "production", "duration": "43s"}
  }'
```

**Error alert:**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "errors",
    "title": "500 Internal Server Error",
    "description": "Unhandled exception in **/api/checkout**: NullPointerException",
    "icon": "🔴",
    "url": "https://sentry.io/issues/ERR-78901",
    "notify": true,
    "tags": {"endpoint": "/api/checkout", "status": "500", "count": "12"}
  }'
```

**Subscription change:**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{
    "project": "q4q8nb18qc2i",
    "category": "billing",
    "title": "Plan Upgraded",
    "description": "**Maria** upgraded from Free to **Pro** plan",
    "icon": "⬆️",
    "user_id": "user-456",
    "tags": {"from": "free", "to": "pro", "mrr_change": "+49.99"}
  }'
```

**Minimal event (only required fields):**

```bash
curl -X POST http://localhost:4321/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{"project": "q4q8nb18qc2i", "category": "logs", "title": "Cron job completed"}'
```

---

#### GET /api/events

Query events for a project. Supports filtering, search, and cursor-based pagination.

**Query parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `category` | string | no | Filter by category name |
| `search` | string | no | Search across title, description, and tags |
| `cursor` | integer | no | Return events with id < cursor (for pagination) |
| `limit` | integer | no | Max results per page (default: 50, max: 100) |

**Get all events:**

```bash
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i"
```

**Filter by category:**

```bash
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i&category=payments"
```

**Search events:**

```bash
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i&search=maria"
```

**Paginate through results:**

```bash
# First page
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i&limit=10"
# Response includes "nextCursor": 35

# Next page
curl "http://localhost:4321/api/events?project=q4q8nb18qc2i&limit=10&cursor=35"
# Response includes "nextCursor": 22

# Keep going until nextCursor is null
```

**Response** `200`:

```json
{
  "events": [
    {
      "id": 42,
      "projectId": "q4q8nb18qc2i",
      "category": "signups",
      "title": "User Registered",
      "description": "New user **john@example.com** signed up",
      "icon": "👤",
      "tags": "{\"email\":\"john@example.com\",\"source\":\"google\"}",
      "userId": "usr_abc123",
      "notify": false,
      "createdAt": "2026-02-27T08:12:03.000Z"
    }
  ],
  "nextCursor": 41
}
```

`nextCursor` is `null` when there are no more results.

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing `project` parameter |

---

#### POST /api/events/:eventId/delete

Delete an event by ID. No authentication required.

**Example:**

```bash
curl -X POST http://localhost:4321/api/events/42/delete
```

**Response** `200`:

```json
{ "id": 42, "deleted": true }
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Invalid event ID |
| 404 | Event not found |

---

#### POST /api/events/:eventId/favorite

Toggle the favorite status of an event. No authentication required.

**Example:**

```bash
curl -X POST http://localhost:4321/api/events/42/favorite
```

**Response** `200`:

```json
{ "id": 42, "favorited": true }
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Invalid event ID |
| 404 | Event not found |

---

#### POST /api/insight

Create or update an insight card (a KPI metric displayed on the dashboard). **Requires authentication.**

Insights are upserted by project + title: if an insight with the same title already exists, its value is updated. This makes it easy to keep metrics current by re-posting with the latest value.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `title` | string | yes | Insight name (unique key per project) |
| `value` | string or number | yes | Display value |
| `icon` | string | no | Emoji icon |

**Examples:**

```bash
# Total revenue
curl -X POST http://localhost:4321/api/insight \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{"project": "q4q8nb18qc2i", "title": "Total Revenue", "value": "$12,340", "icon": "💰"}'

# Active users
curl -X POST http://localhost:4321/api/insight \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{"project": "q4q8nb18qc2i", "title": "Active Users", "value": 1284, "icon": "👥"}'

# Conversion rate
curl -X POST http://localhost:4321/api/insight \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{"project": "q4q8nb18qc2i", "title": "Conversion Rate", "value": "3.2%", "icon": "📈"}'

# Update an existing insight (same title = update)
curl -X POST http://localhost:4321/api/insight \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ev_your-key" \
  -d '{"project": "q4q8nb18qc2i", "title": "Total Revenue", "value": "$13,500", "icon": "💰"}'
```

**Response** `200`:

```json
{ "ok": true }
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing `project`, `title`, or `value` |
| 401 | Missing or invalid API key |
| 404 | Project not found |

---

#### POST /api/insight/:insightId/delete

Delete an insight by ID. No authentication required. Redirects (303) to the insight-grid partial.

**Example:**

```bash
curl -X POST http://localhost:4321/api/insight/5/delete?project=q4q8nb18qc2i
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Invalid insight ID |
| 404 | Insight not found |

---

#### GET /api/charts

Get event counts grouped by category and day. Used to render bar charts on the dashboard.

**Query parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `days` | integer | no | Number of days to look back (default: 30) |
| `category` | string | no | Filter to a specific category |

**Examples:**

```bash
# All categories, last 30 days
curl "http://localhost:4321/api/charts?project=q4q8nb18qc2i"

# Last 7 days
curl "http://localhost:4321/api/charts?project=q4q8nb18qc2i&days=7"

# Single category
curl "http://localhost:4321/api/charts?project=q4q8nb18qc2i&category=signups"
```

**Response** `200`:

```json
{
  "orders": [
    { "day": "2026-02-25", "count": 5 },
    { "day": "2026-02-26", "count": 8 },
    { "day": "2026-02-27", "count": 3 }
  ],
  "signups": [
    { "day": "2026-02-25", "count": 2 },
    { "day": "2026-02-26", "count": 4 },
    { "day": "2026-02-27", "count": 1 }
  ]
}
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing `project` parameter |

---

### Language examples

#### JavaScript / Node.js

```javascript
const API_URL = "http://localhost:4321";
const API_KEY = "ev_your-key-here";

// Push an event
const res = await fetch(`${API_URL}/api/events`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    project: "q4q8nb18qc2i",
    category: "signups",
    title: "User Registered",
    description: "New user **john@example.com** signed up",
    icon: "👤",
    user_id: "user-123",
    tags: { plan: "pro", source: "google" },
  }),
});

const event = await res.json();
console.log("Created event:", event.id);
```

```javascript
// Query events
const res = await fetch(
  `${API_URL}/api/events?project=q4q8nb18qc2i&category=signups&limit=10`
);
const { events, nextCursor } = await res.json();
```

```javascript
// Update an insight
await fetch(`${API_URL}/api/insight`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    project: "q4q8nb18qc2i",
    title: "Total Users",
    value: 1284,
    icon: "👥",
  }),
});
```

#### Python

```python
import requests

API_URL = "http://localhost:4321"
API_KEY = "ev_your-key-here"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}

# Push an event
response = requests.post(f"{API_URL}/api/events", json={
    "project": "q4q8nb18qc2i",
    "category": "payments",
    "title": "Payment Received",
    "description": "**$49.99** from user-456",
    "icon": "💰",
    "user_id": "user-456",
    "tags": {"amount": "49.99", "currency": "USD"},
}, headers=HEADERS)

event = response.json()
print(f"Created event: {event['id']}")
```

```python
# Query events
response = requests.get(f"{API_URL}/api/events", params={
    "project": "q4q8nb18qc2i",
    "category": "payments",
    "limit": 20,
})
data = response.json()
for event in data["events"]:
    print(f"{event['title']} - {event['createdAt']}")
```

```python
# Update an insight
requests.post(f"{API_URL}/api/insight", json={
    "project": "q4q8nb18qc2i",
    "title": "Monthly Revenue",
    "value": "$12,340",
    "icon": "💰",
}, headers=HEADERS)
```

#### PHP

```php
$apiUrl = "http://localhost:4321";
$apiKey = "ev_your-key-here";

// Push an event
$ch = curl_init("$apiUrl/api/events");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer $apiKey",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "project" => "q4q8nb18qc2i",
        "category" => "orders",
        "title" => "Order Placed",
        "description" => "Order **#1234** for **$89.99**",
        "icon" => "🛍️",
        "user_id" => "user-456",
        "tags" => ["amount" => "89.99", "product" => "Widget Pro"],
    ]),
]);

$response = curl_exec($ch);
$event = json_decode($response, true);
curl_close($ch);
```

#### Ruby

```ruby
require "net/http"
require "json"

api_url = "http://localhost:4321"
api_key = "ev_your-key-here"

uri = URI("#{api_url}/api/events")
http = Net::HTTP.new(uri.host, uri.port)

request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer #{api_key}"
request.body = {
  project: "q4q8nb18qc2i",
  category: "signups",
  title: "User Registered",
  description: "New user **sarah@example.com** signed up",
  icon: "👤",
  user_id: "user-789",
  tags: { email: "sarah@example.com", plan: "starter" }
}.to_json

response = http.request(request)
event = JSON.parse(response.body)
puts "Created event: #{event['id']}"
```

#### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload, _ := json.Marshal(map[string]interface{}{
        "project":     "q4q8nb18qc2i",
        "category":    "deploys",
        "title":       "Deploy Succeeded",
        "description": "Version **v2.4.1** deployed to production",
        "icon":        "🚀",
        "tags":        map[string]string{"version": "v2.4.1", "env": "production"},
    })

    req, _ := http.NewRequest("POST", "http://localhost:4321/api/events", bytes.NewBuffer(payload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer ev_your-key-here")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    fmt.Println("Status:", resp.StatusCode)
}
```

---

### Integration patterns

#### Track signups from your auth system

Call the API after a user registers:

```javascript
async function onUserRegistered(user) {
  await fetch("http://localhost:4321/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer ev_your-key",
    },
    body: JSON.stringify({
      project: "q4q8nb18qc2i",
      category: "signups",
      title: "User Registered",
      description: `**${user.email}** signed up`,
      icon: "👤",
      user_id: user.id,
      tags: { email: user.email, provider: user.authProvider },
    }),
  });
}
```

#### Track payments from Stripe webhooks

```javascript
app.post("/webhooks/stripe", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await fetch("http://localhost:4321/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ev_your-key",
      },
      body: JSON.stringify({
        project: "q4q8nb18qc2i",
        category: "payments",
        title: "Payment Received",
        description: `**$${(session.amount_total / 100).toFixed(2)}** from **${session.customer_email}**`,
        icon: "💰",
        notify: true,
        user_id: session.client_reference_id,
        tags: {
          amount: (session.amount_total / 100).toFixed(2),
          currency: session.currency,
          stripe_session: session.id,
        },
      }),
    });
  }

  res.sendStatus(200);
});
```

#### Track deploys from CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Track deploy
  run: |
    curl -X POST ${{ secrets.EVENTS_LOGGER_URL }}/api/events \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${{ secrets.EVENTS_API_KEY }}" \
      -d '{
        "project": "${{ secrets.EVENTS_PROJECT_ID }}",
        "category": "deploys",
        "title": "Deploy to Production",
        "description": "Commit **${{ github.sha }}** by **${{ github.actor }}**",
        "icon": "🚀",
        "tags": {
          "commit": "${{ github.sha }}",
          "branch": "${{ github.ref_name }}",
          "actor": "${{ github.actor }}",
          "run": "${{ github.run_id }}"
        }
      }'
```

#### Update dashboard KPIs on a schedule

Run a cron job to keep insight cards current:

```bash
#!/bin/bash
API_KEY="ev_your-key-here"
URL="http://localhost:4321"

# Fetch counts from your database and post as insights
TOTAL_USERS=$(psql -t -c "SELECT count(*) FROM users")
MRR=$(psql -t -c "SELECT sum(amount) FROM subscriptions WHERE status='active'")

curl -s -X POST "$URL/api/insight" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{\"project\": \"q4q8nb18qc2i\", \"title\": \"Total Users\", \"value\": \"$TOTAL_USERS\", \"icon\": \"👥\"}"

curl -s -X POST "$URL/api/insight" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{\"project\": \"q4q8nb18qc2i\", \"title\": \"MRR\", \"value\": \"\$$MRR\", \"icon\": \"💰\"}"
```

---

### Notes

- **Categories are auto-created.** The first time you push an event with a new category name, the category is created automatically. No setup needed.
- **Insights upsert by title.** Posting an insight with the same title updates the existing value instead of creating a duplicate.
- **Tags are stored as JSON.** They're searchable via the `search` parameter on `GET /api/events`.
- **Descriptions support markdown.** Use `**bold**` and `[link text](url)` in descriptions for richer display in the dashboard.
- **Pagination is cursor-based.** Use `nextCursor` from the response as the `cursor` parameter in the next request. This is more reliable than offset-based pagination.
- **Rate limits:** None. This is a self-hosted app, so you control the infrastructure.

---

## CLI reference

The CLI is at `cli/index.js`. The `init`, `push`, and `insight` commands require the dashboard server to be running. The `export` and `load` commands talk directly to the SQLite database and work without the server.

```bash
node cli/index.js <command> [options]
```

Server-dependent commands accept `--url <url>` to point to a different server (default: `http://localhost:4321`).

---

### Commands

#### init

Create a new project.

```bash
node cli/index.js init --api-key ev_your-key --name "my-store"
```

| Option | Required | Description |
|--------|----------|-------------|
| `--api-key <key>` | yes | API key |
| `--name <name>` | yes | Project name |
| `--url <url>` | no | Server URL (default: http://localhost:4321) |

#### push

Push an event to a project.

```bash
node cli/index.js push \
  --api-key ev_your-key \
  --project q4q8nb18qc2i \
  --category orders \
  --title "Order Placed" \
  --description "Order **#1234** by John" \
  --icon "📦" \
  --user-id "user-123" \
  --tags '{"email":"john@example.com"}'
```

| Option | Required | Description |
|--------|----------|-------------|
| `--api-key <key>` | yes | API key |
| `--project <id>` | yes | Project ID |
| `--category <name>` | yes | Category name |
| `--title <title>` | yes | Event title |
| `--description <text>` | no | Description (supports `**bold**` and `[link](url)`) |
| `--icon <emoji>` | no | Emoji icon |
| `--tags <json>` | no | JSON object of key-value tags |
| `--action-url <url>` | no | Link to external resource (e.g. order page, ticket) |
| `--user-id <id>` | no | User ID to associate with the event |
| `--notify` | no | Trigger browser notification + highlight in feed |
| `--url <url>` | no | Server URL |

#### insight

Create or update an insight KPI card.

```bash
node cli/index.js insight \
  --api-key ev_your-key \
  --project q4q8nb18qc2i \
  --title "Online Users" \
  --value 28 \
  --icon "🔴"
```

| Option | Required | Description |
|--------|----------|-------------|
| `--api-key <key>` | yes | API key |
| `--project <id>` | yes | Project ID |
| `--title <title>` | yes | Insight name (unique per project -- updates if exists) |
| `--value <value>` | yes | Display value |
| `--icon <emoji>` | no | Emoji icon |
| `--url <url>` | no | Server URL |

#### export

Export all data (projects, categories, events, insights) to a JSON file. Does not require the server to be running -- reads directly from SQLite.

```bash
node cli/index.js export --file backup.json
```

| Option | Required | Description |
|--------|----------|-------------|
| `--file <path>` | no | Output file path (default: `export.json`) |
| `--db <path>` | no | Database file path (default: `data/events.db`) |

#### load

Load data from a JSON file. Replaces all existing data by default. Does not require the server -- writes directly to SQLite. Restart the dev server after loading.

```bash
node cli/index.js load --file demos/ecommerce.json
```

| Option | Required | Description |
|--------|----------|-------------|
| `--file <path>` | yes | JSON file to load |
| `--db <path>` | no | Database file path (default: `data/events.db`) |
| `--merge` | no | Merge with existing data instead of replacing |

Demo data files and how to load them are described in [Demo scenarios](#demo-scenarios).

---

### CLI examples

Track an e-commerce order flow:

```bash
API_KEY="ev_your-key"
PROJECT="q4q8nb18qc2i"

node cli/index.js push --api-key $API_KEY --project $PROJECT --category signups --title "User Registered" --icon "👤" --user-id "user-42"
node cli/index.js push --api-key $API_KEY --project $PROJECT --category orders --title "Order Placed" --description "Order **#1001**" --icon "🛍️" --user-id "user-42"
node cli/index.js push --api-key $API_KEY --project $PROJECT --category shipping --title "Order Shipped" --icon "🚚"
node cli/index.js push --api-key $API_KEY --project $PROJECT --category shipping --title "Order Delivered" --icon "📦"

node cli/index.js insight --api-key $API_KEY --project $PROJECT --title "24h Sales" --value "\$1,449" --icon "☀️"
node cli/index.js insight --api-key $API_KEY --project $PROJECT --title "Orders Processing" --value 23 --icon "🏭"
```

Track CI/CD deploys:

```bash
node cli/index.js push --api-key $API_KEY --project $PROJECT --category deploys --title "Deploy Succeeded" --description "v2.4.1 to production" --icon "🚀"
node cli/index.js insight --api-key $API_KEY --project $PROJECT --title "Deploys Today" --value 5 --icon "📊"
```

---

## Architecture

Events Logger uses Astro, HTMX, Alpine.js, SQLite, Drizzle ORM, and Commander.

The full file tree is in [docs/architecture.md](docs/architecture.md).

### Main areas

- `src/pages/api/` receives and validates incoming events.
- `src/pages/` renders dashboards and HTMX partials.
- `src/db/` and Drizzle files own the schema and persistence.
- `cli/` provides terminal commands for creating projects and pushing events.

### Change flow

Start from the user-facing route or command, follow its call into the domain or data module, change the narrowest responsible layer, and verify the result with the commands in [Scripts](#scripts). Keep external-service calls behind existing server or integration boundaries.

---

## How it was built

This guide explains how I approached the software. It is not a generated API reference. It is the story of the build: what I did first, why the architecture looks this way, what was difficult, and what I would change next.

### The starting point

I built Events Logger because small projects often need visibility before they need a full analytics platform. I wanted an event API I could understand, host, and change without inheriting a large vendor model.

My rule was to get one complete path working before adding breadth. A complete path gives us something we can run, inspect, and improve. A collection of disconnected features does not.

### The build sequence

1. I began with one endpoint that accepted a project, event name, and payload. The first milestone was storing and listing events reliably.
2. I moved the schema into Drizzle so tables and queries had one typed definition. SQLite kept the first deployment self-contained.
3. I added project API keys once ingestion worked. Authentication belongs at the event boundary, not scattered through dashboard code.
4. I built the dashboard as server-rendered pages and HTMX fragments. New events can update focused regions without turning the site into a client application.
5. I added charts and KPI cards after the raw feed was trustworthy. Every summary starts from the stored event model.
6. I finished with a CLI that creates projects and sends events using the same API your integrations use.

This order matters. Each step depends on a smaller working system underneath it. If you rebuild the software in another stack, keep the sequence even when the files and frameworks change.

### The parts that needed the most care

- Event payloads are flexible, but unbounded flexibility becomes a storage problem. I validate the envelope and keep payload handling deliberate.
- Analytics summaries can disagree with the event feed. I derive both from the same persisted records and date boundaries.
- An ingestion endpoint attracts abuse when public. The [Security](#security) section calls out key rotation, rate limits, payload limits, and HTTPS.

These are the areas I would inspect first when changing the product. They contain more product behavior than their file size suggests.

### How I verified the build

I did not treat a successful compilation as the finish line. I used the real product flow:

1. Create a project and send events through both HTTP and the CLI.
2. Compare the activity feed, chart totals, and KPI cards for the same date range.
3. Restart the server, confirm persistence, and run the production build.

When you make a structural change, repeat the same journey. Add a focused automated test when the change introduces a rule that is easy to break.

### How to study the source

Start with the top of this README, then read [Architecture](#architecture) and [Decisions](#decisions). Open the implementation areas listed there and trace one user action from the interface to its data or system boundary.

Do not read every file in order. Follow behavior. For example, start from a form, route, or command. Find the function it calls. Then find where that function reads or writes data.

After that, run the unmodified project. Change one visible detail. Run it again. Small changes build a much better mental model than a large rewrite on day one.

### What I would do next

- At larger volume I would batch writes and move from SQLite to PostgreSQL or an event store.
- I would add retention rules before collecting detailed customer data.
- I would preserve the small event envelope because it makes integrations easy to debug.

Those are directions, not requirements. The current software is intentionally a starting point. Keep the parts that support your product and replace the rest.

### Rebuilding it in another stack

If you want to rewrite this software, preserve these four things first:

1. The domain records and the rules connecting them.
2. The main user journey from input to useful result.
3. The trust boundaries around users, secrets, payments, and external services.
4. The verification journey described above.

Frameworks are replaceable. Product behavior is the valuable part.

My advice is to keep the original version running beside the rewrite. Move one complete path at a time. Compare the two versions with the same inputs before removing the old path.

---

## Configuration

- The application creates local project/API credentials.
- Change database and server settings in the Drizzle and Astro configuration files.

### Rules

- If you add example configuration files, never put real values into them.
- Keep public browser variables separate from server secrets.
- Use different credentials and resources for development and production.
- Document any variable you add, including whether it is public, secret, or optional.

---

## Deployment

### Before deploying

1. Complete local setup and verification from [Quick start](#quick-start).
2. Create fresh developer-owned service accounts and resources.
3. Set production values through the host's secret manager.
4. Confirm no local databases, logs, or credentials are in version control.

### Project-specific steps

- Build the Astro server.
- Provide persistent storage for SQLite.
- Place the API behind HTTPS and a reverse proxy.

After deployment, smoke-test the primary user flow, error handling, authentication if present, and every configured webhook or external service.

---

## Customization

Good first customization areas:

- event categories and fields
- dashboard charts
- retention policies
- API and CLI commands

### Recommended sequence

1. Run the unmodified project locally.
2. Change naming, colors, copy, and sample data.
3. Change one domain rule at a time and verify it.
4. Add or replace integrations only after the local flow works.
5. Update tests and all affected project documentation.

---

## Security

### Project-specific checks

- Rotate exposed project API keys.
- Rate-limit public ingestion endpoints.
- Avoid placing sensitive personal data in event descriptions.

### Release checklist

- Scan the repository for credentials and personal paths.
- Review authorization on every write operation.
- Validate and bound user-controlled input.
- Keep dependencies patched and run the available tests and security checks.
- Use HTTPS in production and restrict service credentials to the minimum scope.

---

## Decisions

The software intentionally makes these choices:

- Use an append-oriented event model that stays simple to query.
- Use HTML-over-the-wire updates rather than a client application framework.
- Keep the API and bundled CLI aligned around the same authentication rules.

These are starting points rather than restrictions. If you replace one, update the [Architecture](#architecture), [Configuration](#configuration), [Deployment](#deployment), and [Security](#security) sections so future maintainers and AI agents understand the new tradeoff.

---

## Changelog

All notable changes to Events Logger are recorded here. Versions follow semantic versioning; the public-facing release label may omit the patch number.

### 1.0.0 - 2026-08-03

Initial public release.

- Provides a self-hosted event tracking dashboard with a live feed, charts, and KPI insight cards.
- Includes a REST API and command-line client for creating projects, pushing events, upserting insights, and exporting or importing data.
- Runs locally on SQLite with zero-configuration setup through Drizzle ORM.
- Ships four demo scenarios with generated sample events for e-commerce, SaaS, DevOps, and content platforms.
- Includes complete Astro + HTMX + Alpine.js source and project documentation for humans and AI coding agents (now merged into this README).

---

## License

MIT. See [LICENSE](LICENSE).
