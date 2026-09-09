# Database

The app uses SQLite stored at `data/events.db`. The file is auto-created on first run. Tables and indexes are auto-created via `src/db/index.ts` -- no manual migration step is needed.

Drizzle ORM is used for type-safe queries. The schema is defined in `src/db/schema.ts`.

## Tables

### app_settings

Single-row table storing the global API key.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Always 1 |
| `api_key` | TEXT NOT NULL | Global authentication key (prefixed `ev_`) |

### projects

Each tracked application or service.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | 12-character alphanumeric ID |
| `name` | TEXT NOT NULL | Project display name |
| `created_at` | INTEGER NOT NULL | Unix timestamp |

### categories

Event categories within a project. Auto-created when an event references a new category name.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `project_id` | TEXT NOT NULL FK | References `projects.id` |
| `name` | TEXT NOT NULL | Category name (e.g. "orders", "signups") |
| `created_at` | INTEGER NOT NULL | Unix timestamp |

Unique constraint: `(project_id, name)`

### events

Individual tracked occurrences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `project_id` | TEXT NOT NULL FK | References `projects.id` |
| `category` | TEXT NOT NULL | Category name |
| `title` | TEXT NOT NULL | Event title |
| `description` | TEXT | Optional description (supports `**bold**` and `[link](url)`) |
| `icon` | TEXT | Emoji icon |
| `tags` | TEXT | JSON string of key-value metadata |
| `url` | TEXT | Link to external resource (opens in new tab when event title is clicked) |
| `user_id` | TEXT | User identifier associated with the event |
| `notify` | INTEGER NOT NULL DEFAULT 0 | When true, triggers a browser notification and highlights the event in the feed |
| `favorited` | INTEGER NOT NULL DEFAULT 0 | When true, the event is marked as a favorite and can be filtered in the feed |
| `created_at` | INTEGER NOT NULL | Unix timestamp |

### insights

KPI dashboard cards. Upserted by project + title.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `project_id` | TEXT NOT NULL FK | References `projects.id` |
| `title` | TEXT NOT NULL | Insight display name |
| `value` | TEXT NOT NULL | Current value (number or formatted string) |
| `icon` | TEXT | Emoji icon |
| `updated_at` | INTEGER NOT NULL | Unix timestamp |

Unique constraint: `(project_id, title)`

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_events_project_category` | `(project_id, category)` | Filter events by category |
| `idx_events_project_created` | `(project_id, created_at)` | Feed ordering and time-range queries |
| `idx_events_created` | `(created_at)` | Global time-range queries |

## Notes

- All timestamps are stored as unix integers (seconds since epoch). Drizzle converts them to `Date` objects via `{ mode: 'timestamp' }`.
- The `tags` column stores a JSON string. It is queried via `LIKE` for search -- no JSON path operators are used.
- The `user_id` column is optional. When provided, it associates an event with a specific user for future user profile features.
- The database uses WAL journal mode and foreign keys are enabled.
- Deleting a project cascades: all events, categories, and insights for that project are deleted in the settings page handler.
- On startup, `src/db/index.ts` runs `ALTER TABLE` migrations in try/catch blocks to safely rename old `channels` table/column to `categories`/`category` in existing databases.
