# CLI Reference

The CLI is at `cli/index.js`. The `init`, `push`, and `insight` commands require the dashboard server to be running. The `export` and `load` commands talk directly to the SQLite database and work without the server.

```bash
node cli/index.js <command> [options]
```

Server-dependent commands accept `--url <url>` to point to a different server (default: `http://localhost:4321`).

---

## Commands

### init

Create a new project.

```bash
node cli/index.js init --api-key ev_your-key --name "my-store"
```

| Option | Required | Description |
|--------|----------|-------------|
| `--api-key <key>` | yes | API key |
| `--name <name>` | yes | Project name |
| `--url <url>` | no | Server URL (default: http://localhost:4321) |

### push

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

### insight

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

### export

Export all data (projects, categories, events, insights) to a JSON file. Does not require the server to be running — reads directly from SQLite.

```bash
node cli/index.js export --file backup.json
```

| Option | Required | Description |
|--------|----------|-------------|
| `--file <path>` | no | Output file path (default: `export.json`) |
| `--db <path>` | no | Database file path (default: `data/events.db`) |

### load

Load data from a JSON file. Replaces all existing data by default. Does not require the server — writes directly to SQLite. Restart the dev server after loading.

```bash
node cli/index.js load --file demos/ecommerce.json
```

| Option | Required | Description |
|--------|----------|-------------|
| `--file <path>` | yes | JSON file to load |
| `--db <path>` | no | Database file path (default: `data/events.db`) |
| `--merge` | no | Merge with existing data instead of replacing |

---

## Demo Scenarios

Pre-built demo scenarios are in `demos/`. Each contains realistic data spanning 30 days.

| Scenario | File | Description |
|----------|------|-------------|
| QuickShop | `demos/ecommerce.json` | E-commerce: orders, carts, payments, reviews |
| LaunchPad SaaS | `demos/saas.json` | SaaS app: logins, billing, API usage, errors |
| DeployBot | `demos/devops.json` | CI/CD: deploys, builds, incidents, monitoring |
| BlogWave | `demos/content.json` | Content platform: subscribers, articles, newsletters |
| All | `demos/all-scenarios.json` | All 4 scenarios combined |

```bash
# Load all demo data
node cli/index.js load --file demos/all-scenarios.json

# Load just one scenario
node cli/index.js load --file demos/ecommerce.json

# Regenerate random demo data
node demos/generate.js
```

See `demos/WALKTHROUGH.md` for a full presentation script.

---

## Examples

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
