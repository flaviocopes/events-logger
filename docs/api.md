# API Reference

Base URL: `http://localhost:4321`

All responses are JSON with `Content-Type: application/json`.

## Authentication

All write endpoints require the global API key via the `Authorization` header:

```
Authorization: Bearer ev_your-api-key-here
```

A single API key is auto-generated on first run and displayed on the home page. It is prefixed with `ev_` and follows the format `ev_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

Read-only endpoints (`GET /api/events`, `GET /api/projects`, `GET /api/charts`) do not require authentication.

---

## Projects

### List Projects

```
GET /api/projects
```

**Response** `200`:

```json
[
  {
    "id": "q4q8nb18qc2i",
    "name": "quickshop",
    "createdAt": "2026-02-27T08:00:00.000Z"
  }
]
```

### Create Project

```
POST /api/projects
```

Requires authentication.

**Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Project name |

**Response** `201`:

```json
{
  "id": "q4q8nb18qc2i",
  "name": "my-store"
}
```

---

## Events

### Push Event

```
POST /api/events
```

Requires authentication.

**Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `category` | string | yes | Category name (auto-created if new) |
| `title` | string | yes | Event title |
| `description` | string | no | Event description (supports `**bold**` and `[link](url)` markdown) |
| `icon` | string | no | Emoji icon |
| `tags` | object | no | Key-value metadata (e.g. `{"email": "user@example.com"}`) |
| `url` | string | no | Link to external resource (clicking the event title opens this URL) |
| `user_id` | string | no | User identifier to associate with this event |
| `notify` | boolean | no | Trigger browser notification + highlight in feed (default: false) |

**Request**:

```json
{
  "project": "q4q8nb18qc2i",
  "category": "orders",
  "title": "Order Placed",
  "description": "Order **#1234** placed by **Maria**",
  "icon": "🛍️",
  "url": "https://shop.example.com/admin/orders/1234",
  "user_id": "user-456",
  "tags": { "email": "maria@example.com", "amount": "$89.99" }
}
```

**Response** `201`:

```json
{
  "id": 1,
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

**Errors**:

| Status | Reason |
|--------|--------|
| 400 | Missing `project`, `category`, or `title` |
| 401 | Invalid or missing API key |
| 404 | Project not found |

### Query Events

```
GET /api/events
```

**Query parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `category` | string | no | Filter by category |
| `search` | string | no | Search title, description, and tags |
| `cursor` | integer | no | Event ID cursor for pagination (returns events with id < cursor) |
| `limit` | integer | no | Max results (default: 50, max: 100) |

**Response** `200`:

```json
{
  "events": [ ... ],
  "nextCursor": 5
}
```

`nextCursor` is `null` when there are no more results.

### Delete Event

```
POST /api/events/:eventId/delete
```

No authentication required.

**Response** `200`:

```json
{ "id": 42, "deleted": true }
```

**Errors**:

| Status | Reason |
|--------|--------|
| 400 | Invalid event ID |
| 404 | Event not found |

### Toggle Event Favorite

```
POST /api/events/:eventId/favorite
```

No authentication required. Toggles the `favorited` flag on the event.

**Response** `200`:

```json
{ "id": 42, "favorited": true }
```

**Errors**:

| Status | Reason |
|--------|--------|
| 400 | Invalid event ID |
| 404 | Event not found |

---

## Insights

### Upsert Insight

```
POST /api/insight
```

Requires authentication. Creates a new insight card or updates the value of an existing one (matched by project + title).

**Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `title` | string | yes | Insight name (used as unique key per project) |
| `value` | string/number | yes | Display value (stored as string) |
| `icon` | string | no | Emoji icon |

**Response** `200`:

```json
{ "ok": true }
```

### Delete Insight

```
POST /api/insight/:insightId/delete
```

No authentication required. Deletes the insight and redirects (303) to the insight-grid partial.

**Query parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | no | Project ID (falls back to the insight's own project) |

**Errors**:

| Status | Reason |
|--------|--------|
| 400 | Invalid insight ID |
| 404 | Insight not found |

---

## Charts

### Get Chart Data

```
GET /api/charts
```

Returns event counts grouped by category and day.

**Query parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | yes | Project ID |
| `days` | integer | no | Number of days to look back (default: 30) |
| `category` | string | no | Filter to a specific category |

**Response** `200`:

```json
{
  "orders": [
    { "day": "2026-02-25", "count": 5 },
    { "day": "2026-02-26", "count": 8 },
    { "day": "2026-02-27", "count": 3 }
  ],
  "signups": [
    { "day": "2026-02-27", "count": 2 }
  ]
}
```
